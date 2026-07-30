<?php

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * CORS Headers
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

/**
 * Standard JSON response function
 */
function respond(bool $success, string $message, int $statusCode = 200, array $extra = []): void
{
    http_response_code($statusCode);
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message,
    ], $extra));
    exit;
}

/**
 * Quote column names for SQL safety
 */
function quoteColumn(string $name): string
{
    return "`" . str_replace("`", "``", $name) . "`";
}

/**
 * Safe retrieval from POST data
 */
function valueFromPost(string $name): string
{
    return trim((string)($_POST[$name] ?? ""));
}

/**
 * Verify paid payment and return associated email
 */
function paidPaymentEmail(PDO $pdo, string $reference): ?string
{
    $reference = preg_replace('/[^A-Za-z0-9_-]/', '', $reference);
    $statement = $pdo->prepare(
        "SELECT email FROM application_payments 
         WHERE reference = ? AND status = 'paid' AND student_id IS NULL 
         LIMIT 1"
    );
    $statement->execute([$reference]);
    $email = $statement->fetchColumn();
    return $email === false ? null : (string) $email;
}

/**
 * Handle passport file upload
 */
function handlePassportUpload(): string
{
    if (!isset($_FILES["passport"]) || $_FILES["passport"]["error"] === UPLOAD_ERR_NO_FILE) {
        return "";
    }

    if ($_FILES["passport"]["error"] !== UPLOAD_ERR_OK) {
        respond(false, "Passport upload failed. Please try again.", 400);
    }

    $allowedTypes = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp",
        "image/gif" => "gif",
    ];

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($_FILES["passport"]["tmp_name"]);

    if (!isset($allowedTypes[$mimeType])) {
        respond(false, "Passport must be a JPG, PNG, WEBP, or GIF image.", 400);
    }

    $uploadDir = __DIR__ . DIRECTORY_SEPARATOR . envValue('UPLOAD_DIR', 'uploads');

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
        respond(false, "Could not create upload folder.", 500);
    }

    $fileName = date("YmdHis") . "_" . bin2hex(random_bytes(4)) . "." . $allowedTypes[$mimeType];
    $targetFile = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($_FILES["passport"]["tmp_name"], $targetFile)) {
        respond(false, "Could not save passport upload.", 500);
    }

    return envValue('UPLOAD_DIR', 'uploads') . $fileName;
}

/**
 * Handle birth certificate upload
 */
function handleBirthCertificateUpload(): string
{
    if (!isset($_FILES["birth_certificate"]) || $_FILES["birth_certificate"]["error"] === UPLOAD_ERR_NO_FILE) {
        return "";
    }

    if ($_FILES["birth_certificate"]["error"] !== UPLOAD_ERR_OK) {
        respond(false, "Birth certificate upload failed. Please try again.", 400);
    }

    $allowedTypes = [
        "application/pdf" => "pdf",
        "image/jpeg" => "jpg",
        "image/png" => "png",
    ];

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($_FILES["birth_certificate"]["tmp_name"]);

    if (!isset($allowedTypes[$mimeType])) {
        respond(false, "Birth certificate must be a PDF, JPG, or PNG.", 400);
    }

    $uploadDir = __DIR__ . DIRECTORY_SEPARATOR . envValue('UPLOAD_DIR', 'uploads');

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
        respond(false, "Could not create upload folder.", 500);
    }

    $fileName = date("YmdHis") . "_bc_" . bin2hex(random_bytes(4)) . "." . $allowedTypes[$mimeType];
    $targetFile = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($_FILES["birth_certificate"]["tmp_name"], $targetFile)) {
        respond(false, "Could not save birth certificate.", 500);
    }

    return envValue('UPLOAD_DIR', 'uploads') . $fileName;
}

/**
 * Generate temporary password
 */
function createTemporaryPassword(): string
{
    $alphabet = 'EBIebi23456789!@#$%';
    $password = '';
    for ($index = 0; $index < 12; $index++) {
        $password .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $password;
}

/**
 * Send student credentials via email
 */
function sendStudentCredentials(
    string $recipient,
    string $parentName,
    string $studentName,
    int $studentId,
    string $username,
    string $temporaryPassword
): bool {
    $autoload = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
    $smtpUsername = envValue('SMTP_USERNAME');
    $smtpPassword = envValue('SMTP_PASSWORD');
    $from = envValue('SCHOOL_FROM_EMAIL', $smtpUsername);

    if (!is_file($autoload) || $smtpUsername === '' || $smtpPassword === '' || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    require_once $autoload;

    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = envValue('SMTP_HOST', 'smtp.gmail.com');
        $mail->SMTPAuth = true;
        $mail->Username = $smtpUsername;
        $mail->Password = $smtpPassword;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = (int) envValue('SMTP_PORT', '587');
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($from, envValue('SCHOOL_FROM_NAME', 'School Management System'));
        $mail->addAddress($recipient, $parentName);
        $mail->isHTML(true);
        $mail->Subject = 'Student Portal Login Details - ' . $studentName;

        $safe = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        $schoolName = envValue('SCHOOL_FROM_NAME', 'School Management System');
        $appUrl = envValue('APP_URL', 'http://localhost:8000');

        $mail->Body = '<!doctype html><html><body style="margin:0;background-color:#f8fafc;padding:24px;font-family:Arial,sans-serif;color:#1e293b;">' .
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">' .
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.12);">' .
            '<tr><td style="padding:32px;background-color:#1d4ed8;color:#ffffff;text-align:center;">' .
            '<h1 style="margin:0;font-size:24px;line-height:32px;">Welcome to ' . $safe($schoolName) . '</h1></td></tr>' .
            '<tr><td style="padding:32px;">' .
            '<p style="margin:0 0 16px;font-size:16px;line-height:24px;">Dear ' . $safe($parentName) . ',</p>' .
            '<p style="margin:0 0 24px;font-size:16px;line-height:24px;">Your child\'s student portal account has been successfully created. Use the login details below to access the portal.</p>' .
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;overflow:hidden;">' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;">Student Name</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">' . $safe($studentName) . '</td></tr>' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;">Student ID</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">' . $safe($studentId) . '</td></tr>' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;">Portal Username</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-weight:600;">' . $safe($username) . '</td></tr>' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;font-weight:600;">Temporary Password</td><td style="padding:12px 16px;font-family:monospace;font-weight:700;color:#1d4ed8;letter-spacing:1px;">' . $safe($temporaryPassword) . '</td></tr>' .
            '</table>' .
            '<div style="margin:24px 0;padding:16px;background-color:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;">' .
            '<p style="margin:0;color:#92400e;font-size:14px;line-height:20px;"><strong>⚠️ Important:</strong> Please change your password immediately after your first login for security.</p>' .
            '</div>' .
            '<div style="text-align:center;margin:24px 0;">' .
            '<a href="' . $safe($appUrl) . '/login" style="display:inline-block;padding:12px 32px;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Access Portal</a>' .
            '</div>' .
            '<p style="margin:24px 0 0;font-size:14px;line-height:20px;">If you have any questions, please contact the school office.</p>' .
            '<p style="margin:16px 0 0;font-size:16px;line-height:24px;">Regards,<br><strong>' . $safe($schoolName) . '</strong></p>' .
            '</td></tr></table>' .
            '<p style="margin:16px 0 0;color:#64748b;font-size:12px;line-height:16px;text-align:center;">© ' . date('Y') . ' ' . $safe($schoolName) . '. All rights reserved.</p>' .
            '</td></tr></table></body></html>';

        $mail->AltBody = "Welcome to {$schoolName}\n\n" .
            "Student Name: {$studentName}\n" .
            "Student ID: {$studentId}\n" .
            "Username: {$username}\n" .
            "Temporary Password: {$temporaryPassword}\n\n" .
            "Please change your password after your first login.\n" .
            "Portal: {$appUrl}/login";

        return $mail->send();

    } catch (Exception $e) {
        error_log('Student credential email failed: ' . $e->getMessage());
        return false;
    }
}

/**
 * Load configuration and connect to database
 */
try {
    require __DIR__ . "/config.php";
} catch (Exception $e) {
    respond(false, "Configuration error: " . $e->getMessage(), 500);
}

/**
 * Validate request method
 */
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(false, "Invalid request method. POST required.", 405);
}

/**
 * Field mapping from POST to database
 */
$fieldMap = [
    "surname" => "surname",
    "firstName" => "first_name",
    "middleName" => "middle_name",
    "dateOfBirth" => "dob",
    "gender" => "gender",
    "nationality" => "nationality",
    "stateOfOrigin" => "state_of_origin",
    "lga" => "lga",
    "city" => "city",
    "religion" => "religion",
    "applicationType" => "application_type",
    "programme" => "programme",
    "session" => "session",
    "previousSchool" => "previous_school",
    "lastClass" => "last_class",
    "startDate" => "start_date",
    "email" => "email",
    "phone" => "phone",
    "address" => "address",
    "guardianName" => "guardian_name",
    "relationship" => "relationship",
    "guardianPhone" => "guardian_phone",
    "guardianEmail" => "guardian_email",
    "emergencyName" => "emergency_name",
    "emergencyPhone" => "emergency_phone",
    "bloodGroup" => "blood_group",
    "medicalInformation" => "medical_information",
];

/**
 * Required fields validation
 */
$requiredFields = [
    "surname",
    "firstName",
    "dateOfBirth",
    "gender",
    "nationality",
    "stateOfOrigin",
    "lga",
    "city",
    "applicationType",
    "programme",
    "session",
    "email",
    "phone",
    "address",
    "guardianName",
    "relationship",
    "guardianPhone",
    "emergencyName",
    "emergencyPhone",
    "paymentReference",
];

foreach ($requiredFields as $field) {
    if (valueFromPost($field) === "") {
        respond(false, "Missing required field.", 400, ["field" => $field]);
    }
}

/**
 * Email validation
 */
if (!filter_var(valueFromPost("email"), FILTER_VALIDATE_EMAIL)) {
    respond(false, "Invalid student email address.", 400, ["field" => "email"]);
}

if (valueFromPost("guardianEmail") && !filter_var(valueFromPost("guardianEmail"), FILTER_VALIDATE_EMAIL)) {
    respond(false, "Invalid guardian email address.", 400, ["field" => "guardianEmail"]);
}

try {
    /**
     * Payment verification
     */
    $paymentReference = valueFromPost('paymentReference');
    $paymentEmail = paidPaymentEmail($pdo, $paymentReference);

    if ($paymentEmail === null) {
        respond(false, 'Payment verification required. No valid paid application found.', 402);
    }

    if (strcasecmp(valueFromPost('guardianEmail'), $paymentEmail) !== 0) {
        respond(false, 'Guardian email must match the payment email for security.', 422, ['field' => 'guardianEmail']);
    }

    /**
     * Prepare student data
     */
    $data = [];
    foreach ($fieldMap as $postName => $columnName) {
        $value = valueFromPost($postName);
        $data[$columnName] = $value === "" ? null : $value;
    }

    $data["passport"] = handlePassportUpload();
    $data["birth_certificate"] = handleBirthCertificateUpload();

    /**
     * Insert student record
     */
    $columns = array_keys($data);
    $placeholders = array_map(fn($col) => ":" . $col, $columns);

    $sql = "INSERT INTO `students` (" .
        implode(", ", array_map("quoteColumn", $columns)) .
        ") VALUES (" .
        implode(", ", $placeholders) .
        ")";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
    $studentId = (int) $pdo->lastInsertId();

    /**
     * Generate portal credentials
     */
    $portalUsername = 'STU' . str_pad((string) $studentId, 7, '0', STR_PAD_LEFT);
    $temporaryPassword = createTemporaryPassword();
    $passwordHash = password_hash($temporaryPassword, PASSWORD_BCRYPT, ['cost' => 12]);

    $updateStmt = $pdo->prepare(
        'UPDATE students SET portal_username = ?, portal_password_hash = ? WHERE id = ?'
    );
    $updateStmt->execute([$portalUsername, $passwordHash, $studentId]);

    /**
     * Link payment to student
     */
    $paymentStmt = $pdo->prepare(
        'UPDATE application_payments SET student_id = ?, status = "paid" WHERE reference = ? AND student_id IS NULL'
    );
    $paymentStmt->execute([$studentId, $paymentReference]);

    /**
     * Send credentials email
     */
    $credentialsSent = sendStudentCredentials(
        $paymentEmail,
        valueFromPost('guardianName'),
        trim(valueFromPost('firstName') . ' ' . valueFromPost('surname')),
        $studentId,
        $portalUsername,
        $temporaryPassword
    );

    if ($credentialsSent) {
        $credentialsStmt = $pdo->prepare('UPDATE students SET credentials_sent_at = NOW() WHERE id = ?');
        $credentialsStmt->execute([$studentId]);
    }

    /**
     * Success response
     */
    $message = $credentialsSent
        ? "Registration successful! Login credentials have been sent to the guardian email."
        : "Registration successful! However, the credential email could not be sent. Please contact the school office.";

    respond(true, $message, 201, [
        "studentId" => $studentId,
        "portalUsername" => $portalUsername,
        "credentialsSent" => $credentialsSent,
    ]);

} catch (PDOException $e) {
    error_log('Registration error: ' . $e->getMessage());
    respond(false, "Registration failed. Please try again later.", 500);
}