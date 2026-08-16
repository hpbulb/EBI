<?php
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

function respond(bool $success, string $message, int $statusCode = 200, array $extra = []): void
{
    http_response_code($statusCode);

    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message,
    ], $extra));

    exit;
}

function quoteColumn(string $name): string
{
    return "`" . str_replace("`", "``", $name) . "`";
}

function ensureStudentsTable(PDO $pdo): void
{
    $columns = [
        "surname" => "VARCHAR(100) NOT NULL",
        "first_name" => "VARCHAR(100) NOT NULL",
        "middle_name" => "VARCHAR(100) DEFAULT NULL",
        "dob" => "DATE NOT NULL",
        "gender" => "VARCHAR(50) NOT NULL",
        // "marital_status" => "VARCHAR(50) NOT NULL",
        "nationality" => "VARCHAR(100) NOT NULL",
        "state_of_origin" => "VARCHAR(100) NOT NULL",
        "lga" => "VARCHAR(100) NOT NULL",
        "city" => "VARCHAR(100) NOT NULL",
        "religion" => "VARCHAR(100) DEFAULT NULL",
        "application_type" => "VARCHAR(100) NOT NULL",
        "programme" => "VARCHAR(150) NOT NULL",
        "session" => "VARCHAR(50) NOT NULL",
        "previous_school" => "VARCHAR(200) DEFAULT NULL",
        "last_class" => "VARCHAR(100) DEFAULT NULL",
        "start_date" => "DATE DEFAULT NULL",
        "email" => "VARCHAR(150) NOT NULL",
        "phone" => "VARCHAR(50) NOT NULL",
        "address" => "TEXT NOT NULL",
        "guardian_name" => "VARCHAR(150) NOT NULL",
        "relationship" => "VARCHAR(100) NOT NULL",
        "guardian_phone" => "VARCHAR(50) NOT NULL",
        "guardian_email" => "VARCHAR(150) DEFAULT NULL",
        "emergency_name" => "VARCHAR(150) NOT NULL",
        "emergency_phone" => "VARCHAR(50) NOT NULL",
        "blood_group" => "VARCHAR(10) DEFAULT NULL",
        "medical_information" => "TEXT NULL",
        "passport" => "VARCHAR(255) DEFAULT NULL",
        "birth_certificate" => "VARCHAR(255) DEFAULT NULL",
        "portal_username" => "VARCHAR(50) DEFAULT NULL UNIQUE",
        "portal_password_hash" => "VARCHAR(255) DEFAULT NULL",
        "credentials_sent_at" => "TIMESTAMP NULL DEFAULT NULL",
        "created_at" => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    ];

    $definitions = ["`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY"];

    foreach ($columns as $name => $definition) {
        $definitions[] = quoteColumn($name) . " " . $definition;
    }

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `students` (" .
        implode(", ", $definitions) .
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $existingColumns = $pdo
        ->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'")
        ->fetchAll(PDO::FETCH_COLUMN);

    foreach ($columns as $name => $definition) {
        if (!in_array($name, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE `students` ADD COLUMN " . quoteColumn($name) . " " . $definition);
        }
    }
}

function valueFromPost(string $name): string
{
    return trim((string)($_POST[$name] ?? ""));
}

function paidPaymentEmail(PDO $pdo, string $reference): ?string
{
    $reference = preg_replace('/[^A-Za-z0-9_-]/', '', $reference);
    $statement = $pdo->prepare("SELECT email FROM application_payments WHERE reference = ? AND status = 'paid' AND student_id IS NULL");
    $statement->execute([$reference]);
    $email = $statement->fetchColumn();
    return $email === false ? null : (string) $email;
}

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

    $uploadDir = __DIR__ . DIRECTORY_SEPARATOR . "uploads";

    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
        respond(false, "Could not create upload folder.", 500);
    }

    $fileName = date("YmdHis") . "_" . bin2hex(random_bytes(4)) . "." . $allowedTypes[$mimeType];
    $targetFile = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($_FILES["passport"]["tmp_name"], $targetFile)) {
        respond(false, "Could not save passport upload.", 500);
    }

    return "uploads/" . $fileName;
}

function createTemporaryPassword(): string
{
    // Uses an unambiguous alphabet so parents can enter the password easily.
    $alphabet = 'EBIebi23456789!@#$%';
    $password = '';
    for ($index = 0; $index < 12; $index++) {
        $password .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $password;
}

function sendStudentCredentials(string $recipient, string $parentName, string $studentName, int $studentId, string $username, string $temporaryPassword): bool
{
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
        $mail->setFrom($from, envValue('SCHOOL_FROM_NAME', 'EBI School'));
        $mail->addAddress($recipient, $parentName);
        $mail->isHTML(true);
        $mail->Subject = 'Student Portal Login Details';

        $safe = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        $mail->Body = '<!doctype html><html><body style="margin:0;background-color:#f8fafc;padding:24px;font-family:Arial,sans-serif;color:#1e293b;">' .
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center">' .
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.12);">' .
            '<tr><td style="padding:32px;background-color:#1d4ed8;color:#ffffff;text-align:center;">' .
            '<h1 style="margin:0;font-size:24px;line-height:32px;">Welcome to EBI School</h1></td></tr>' .
            '<tr><td style="padding:32px;">' .
            '<p style="margin:0 0 16px;font-size:16px;line-height:24px;">Dear ' . $safe($parentName) . ',</p>' .
            '<p style="margin:0 0 24px;font-size:16px;line-height:24px;">Your child\'s portal account has been created. Use the details below to sign in.</p>' .
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;overflow:hidden;">' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;">Student Name</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">' . $safe($studentName) . '</td></tr>' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;">Student ID</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">' . $safe($studentId) . '</td></tr>' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;">Username</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">' . $safe($username) . '</td></tr>' .
            '<tr><td style="padding:12px 16px;background-color:#f8fafc;font-weight:600;">Temporary Password</td><td style="padding:12px 16px;font-family:monospace;font-weight:700;color:#1d4ed8;">' . $safe($temporaryPassword) . '</td></tr>' .
            '</table>' .
            '<p style="margin:24px 0 0;padding:12px 16px;background-color:#fffbeb;border-radius:8px;color:#92400e;font-size:14px;line-height:20px;"><strong>Important:</strong> Please change the password after your first login.</p>' .
            '<p style="margin:24px 0 0;font-size:16px;line-height:24px;">Regards,<br><strong>EBI School</strong></p>' .
            '</td></tr></table>' .
            '<p style="margin:16px 0 0;color:#64748b;font-size:12px;line-height:16px;text-align:center;">This is an automated message from EBI School.</p>' .
            '</td></tr></table></body></html>';
        $mail->AltBody = "Student portal login details\nStudent: {$studentName}\nStudent ID: {$studentId}\nUsername: {$username}\nTemporary password: {$temporaryPassword}";
        return $mail->send();
    } catch (Exception $e) {
        error_log('Student credential email failed: ' . $e->getMessage());
        return false;
    }
}

try {
    require __DIR__ . "/config.php";
} catch (PDOException $e) {
    respond(false, "Database connection failed: " . $e->getMessage(), 500);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(false, "Invalid request", 405);
}

$fieldMap = [
    "surname" => "surname",
    "firstName" => "first_name",
    "middleName" => "middle_name",
    "dateOfBirth" => "dob",
    "gender" => "gender",
    // "maritalStatus" => "marital_status",
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

$requiredFields = [
    "surname",
    "firstName",
    "dateOfBirth",
    "gender",
    // "maritalStatus",
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
];

foreach ($requiredFields as $field) {
    if (valueFromPost($field) === "") {
        respond(false, "Please fill all required fields.", 400, ["field" => $field]);
    }
}

if (!filter_var(valueFromPost("email"), FILTER_VALIDATE_EMAIL)) {
    respond(false, "Please enter a valid student email address.", 400, ["field" => "email"]);
}

try {
    ensureStudentsTable($pdo);

    $paymentReference = valueFromPost('paymentReference');
    $paymentEmail = paidPaymentEmail($pdo, $paymentReference);
    if ($paymentEmail === null) {
        respond(false, 'A verified application payment is required before registration.', 402);
    }
    if (strcasecmp(valueFromPost('guardianEmail'), $paymentEmail) !== 0) {
        respond(false, 'The guardian email must match the email used for payment.', 422, ['field' => 'guardianEmail']);
    }

    $data = [];

    foreach ($fieldMap as $postName => $columnName) {
        $value = valueFromPost($postName);
        $data[$columnName] = $value === "" ? null : $value;
    }

    $data["passport"] = handlePassportUpload();

    $columns = array_keys($data);
    $placeholders = array_map(function ($column) {
        return ":" . $column;
    }, $columns);

    $stmt = $pdo->prepare(
        "INSERT INTO `students` (" .
        implode(", ", array_map("quoteColumn", $columns)) .
        ") VALUES (" .
        implode(", ", $placeholders) .
        ")"
    );

    $stmt->execute($data);
    $studentId = (int) $pdo->lastInsertId();
    $portalUsername = 'EBI' . str_pad((string) $studentId, 6, '0', STR_PAD_LEFT);
    $temporaryPassword = createTemporaryPassword();
    $pdo->prepare('UPDATE students SET portal_username = ?, portal_password_hash = ? WHERE id = ?')
        ->execute([$portalUsername, password_hash($temporaryPassword, PASSWORD_DEFAULT), $studentId]);

    $pdo->prepare('UPDATE application_payments SET student_id = ? WHERE reference = ? AND student_id IS NULL')
        ->execute([$studentId, $paymentReference]);

    $credentialsSent = sendStudentCredentials(
        $paymentEmail,
        valueFromPost('guardianName'),
        trim(valueFromPost('firstName') . ' ' . valueFromPost('surname')),
        $studentId,
        $portalUsername,
        $temporaryPassword,
    );
    if ($credentialsSent) {
        $pdo->prepare('UPDATE students SET credentials_sent_at = NOW() WHERE id = ?')->execute([$studentId]);
    }

    respond(true, $credentialsSent ? "Student registered successfully. Login details have been emailed to the parent or guardian." : "Student registered successfully, but the login email could not be sent. Please contact the school office.", 200, [
        "id" => $studentId,
        "credentialsSent" => $credentialsSent,
    ]);
} catch (PDOException $e) {
    respond(false, "Registration failed: " . $e->getMessage(), 500);
}
