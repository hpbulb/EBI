<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PATCH, OPTIONS");
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

function ensureStudentReviewColumns(PDO $pdo): void
{
    $columns = [
        "review_status" => "VARCHAR(20) NOT NULL DEFAULT 'pending'",
        "review_note" => "TEXT DEFAULT NULL",
    ];

    $existingColumns = $pdo
        ->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'")
        ->fetchAll(PDO::FETCH_COLUMN);

    foreach ($columns as $name => $definition) {
        if (!in_array($name, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE `students` ADD COLUMN " . quoteColumn($name) . " " . $definition);
        }
    }
}

try {
    require __DIR__ . "/config.php";
} catch (PDOException $e) {
    respond(false, "Database connection failed: " . $e->getMessage(), 500);
}

try {
    ensureStudentReviewColumns($pdo);
} catch (PDOException $e) {
    respond(false, "Unable to prepare dashboard columns: " . $e->getMessage(), 500);
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $search = trim((string)($_GET["search"] ?? ""));
    $statusFilter = trim((string)($_GET["status"] ?? ""));

    $whereConditions = [];
    $params = [];

    if ($search !== "") {
        $whereConditions[] = "(LOWER(`surname`) LIKE :term OR LOWER(`first_name`) LIKE :term OR LOWER(`programme`) LIKE :term OR LOWER(`email`) LIKE :term OR LOWER(`phone`) LIKE :term OR LOWER(`guardian_name`) LIKE :term)";
        $params[":term"] = "%" . strtolower($search) . "%";
    }

    if ($statusFilter !== "" && in_array($statusFilter, ["pending", "approved", "rejected"], true)) {
        $whereConditions[] = "COALESCE(`review_status`, 'pending') = :status";
        $params[":status"] = $statusFilter;
    }

    $whereClause = $whereConditions === [] ? "" : " WHERE " . implode(" AND ", $whereConditions);

    $stmt = $pdo->prepare(
        "SELECT `id`, CONCAT_WS(' ', `surname`, `first_name`, `middle_name`) AS `full_name`, `email`, `phone`, `programme`, `application_type`, `session`, `guardian_name`, `address`, `review_status`, `review_note`, `created_at` FROM `students`" . $whereClause . " ORDER BY `created_at` DESC"
    );

    $stmt->execute($params);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($students as &$student) {
        $student["review_status"] = $student["review_status"] ?: "pending";
    }
    unset($student);

    respond(true, "Dashboard loaded", 200, [
        "students" => $students,
    ]);
}

if ($_SERVER["REQUEST_METHOD"] !== "PATCH") {
    respond(false, "Invalid request", 405);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    respond(false, "Invalid request body", 400);
}

$id = (int)($input["id"] ?? 0);
$status = trim((string)($input["status"] ?? ""));
$note = trim((string)($input["note"] ?? ""));

if ($id <= 0 || !in_array($status, ["pending", "approved", "rejected"], true)) {
    respond(false, "Please provide a valid applicant id and review status.", 400);
}

$stmt = $pdo->prepare(
    "UPDATE `students` SET `review_status` = :status, `review_note` = :note WHERE `id` = :id"
);
$stmt->execute([
    ":status" => $status,
    ":note" => $note === "" ? null : $note,
    ":id" => $id,
]);

if ($stmt->rowCount() !== 1) {
    respond(false, "Applicant could not be updated.", 404);
}

$fetchStmt = $pdo->prepare(
    "SELECT `id`, CONCAT_WS(' ', `surname`, `first_name`, `middle_name`) AS `full_name`, `email`, `phone`, `programme`, `application_type`, `session`, `guardian_name`, `address`, `review_status`, `review_note`, `created_at` FROM `students` WHERE `id` = :id"
);
$fetchStmt->execute([":id" => $id]);
$student = $fetchStmt->fetch(PDO::FETCH_ASSOC);

if (!$student) {
    respond(false, "Applicant could not be reloaded.", 404);
}

$student["review_status"] = $student["review_status"] ?: "pending";

respond(true, "Applicant review updated", 200, [
    "student" => $student,
]);
