<?php
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
        "marital_status" => "VARCHAR(50) NOT NULL",
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
    "maritalStatus" => "marital_status",
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
    "maritalStatus",
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

    respond(true, "Student registered successfully", 200, [
        "id" => $pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    respond(false, "Registration failed: " . $e->getMessage(), 500);
}
