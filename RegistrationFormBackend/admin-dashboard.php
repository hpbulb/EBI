<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function dashboardResponse(bool $success, string $message, int $status = 200, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function ensureReviewColumns(PDO $pdo): void
{
    $columns = [
        'review_status' => "VARCHAR(20) NOT NULL DEFAULT 'pending'",
        'review_note' => 'TEXT DEFAULT NULL',
    ];
    $existingColumns = $pdo->query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'"
    )->fetchAll(PDO::FETCH_COLUMN);

    foreach ($columns as $name => $definition) {
        if (!in_array($name, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE `students` ADD COLUMN `$name` $definition");
        }
    }
}

try {
    require __DIR__ . '/config.php';
    ensureReviewColumns($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->query(
            "SELECT id, CONCAT_WS(' ', surname, first_name, middle_name) AS full_name,
                    email, phone, programme, application_type, session, guardian_name,
                    address, COALESCE(review_status, 'pending') AS review_status,
                    review_note, created_at
             FROM students ORDER BY created_at DESC"
        );
        dashboardResponse(true, 'Dashboard loaded.', 200, ['students' => $statement->fetchAll()]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        dashboardResponse(false, 'Invalid request method.', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        dashboardResponse(false, 'Invalid request body.', 400);
    }

    $id = (int)($input['id'] ?? 0);
    $status = trim((string)($input['status'] ?? ''));
    $note = trim((string)($input['note'] ?? ''));
    if ($id < 1 || !in_array($status, ['pending', 'approved', 'rejected'], true)) {
        dashboardResponse(false, 'Provide a valid applicant and review status.', 422);
    }

    $update = $pdo->prepare('UPDATE students SET review_status = ?, review_note = ? WHERE id = ?');
    $update->execute([$status, $note === '' ? null : $note, $id]);

    $student = $pdo->prepare(
        "SELECT id, CONCAT_WS(' ', surname, first_name, middle_name) AS full_name,
                email, phone, programme, application_type, session, guardian_name,
                address, COALESCE(review_status, 'pending') AS review_status,
                review_note, created_at
         FROM students WHERE id = ?"
    );
    $student->execute([$id]);
    dashboardResponse(true, 'Applicant review updated.', 200, ['student' => $student->fetch()]);
} catch (PDOException $error) {
    dashboardResponse(false, 'Dashboard database request failed.', 500);
}
