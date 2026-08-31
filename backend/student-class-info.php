<?php
/**
 * Mobile API for a student's class and subjects.
 * GET/POST /backend/student-class-info
 * Authorization: Bearer <access_token>
 */
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/cors.php';
configureCors(['GET', 'POST', 'OPTIONS']);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function classInfoResponse(bool $success, string $message, int $status = 200, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra), JSON_UNESCAPED_SLASHES);
    exit;
}

function authenticatedClassInfoStudentId(TursoConnection $pdo): int
{
    $authorization = trim((string)($_SERVER['HTTP_AUTHORIZATION'] ?? ''));
    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $authorization, $matches)) {
        classInfoResponse(false, 'A valid Bearer token is required.', 401);
    }
    $statement = $pdo->prepare('SELECT student_id FROM student_api_tokens WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP');
    $statement->execute([hash('sha256', $matches[1])]);
    $studentId = (int)$statement->fetchColumn();
    if ($studentId < 1) classInfoResponse(false, 'Your access token is invalid or has expired.', 401);
    return $studentId;
}

function ensureClassInfoTables(TursoConnection $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS student_class_info (
        student_id INTEGER PRIMARY KEY,
        class_name VARCHAR(150) NOT NULL,
        grade_level VARCHAR(150) DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS student_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
}

function classInfoForStudent(TursoConnection $pdo, int $studentId): array
{
    $info = $pdo->prepare('SELECT class_name, grade_level, updated_at FROM student_class_info WHERE student_id = ?');
    $info->execute([$studentId]);
    $classInfo = $info->fetch() ?: null;
    $subjects = $pdo->prepare('SELECT subject_name FROM student_subjects WHERE student_id = ? ORDER BY subject_name');
    $subjects->execute([$studentId]);
    return [
        'className' => $classInfo['class_name'] ?? '',
        'gradeLevel' => $classInfo['grade_level'] ?? '',
        'subjects' => array_map(static fn(array $row): string => $row['subject_name'], $subjects->fetchAll()),
        'updatedAt' => $classInfo['updated_at'] ?? null,
    ];
}

try {
    if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) classInfoResponse(false, 'Only GET and POST requests are allowed.', 405);
    require __DIR__ . '/config.php';
    ensureClassInfoTables($pdo);
    $studentId = authenticatedClassInfoStudentId($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') classInfoResponse(true, 'Class information loaded.', 200, classInfoForStudent($pdo, $studentId));

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) classInfoResponse(false, 'Send a JSON request body.', 400);
    $student = $pdo->prepare('SELECT id, portal_username FROM students WHERE id = ?');
    $student->execute([$studentId]);
    $studentRecord = $student->fetch();
    if (!$studentRecord) classInfoResponse(false, 'Student account was not found.', 404);
    $submittedStudentId = trim((string)($input['studentId'] ?? ''));
    $validIds = [(string)$studentRecord['id'], (string)($studentRecord['portal_username'] ?? '')];
    if ($submittedStudentId !== '' && !in_array($submittedStudentId, $validIds, true)) classInfoResponse(false, 'You can only update your own class information.', 403);

    $className = trim((string)($input['className'] ?? ''));
    $gradeLevel = trim((string)($input['gradeLevel'] ?? ''));
    $submittedSubjects = $input['subjects'] ?? [];
    if (!is_array($submittedSubjects)) classInfoResponse(false, 'Subjects must be an array.', 422);
    $subjects = array_values(array_unique(array_filter(array_map(static fn(mixed $subject): string => trim((string)$subject), $submittedSubjects))));
    if ($className === '' || $subjects === []) classInfoResponse(false, 'A class and at least one subject are required.', 422);
    if (mb_strlen($className) > 150 || mb_strlen($gradeLevel) > 150 || count($subjects) > 30 || array_filter($subjects, static fn(string $subject): bool => mb_strlen($subject) > 150)) classInfoResponse(false, 'Class, grade level, or subject information is too long.', 422);

    $pdo->prepare('INSERT OR REPLACE INTO student_class_info (student_id, class_name, grade_level, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')->execute([$studentId, $className, $gradeLevel === '' ? null : $gradeLevel]);
    $pdo->prepare('DELETE FROM student_subjects WHERE student_id = ?')->execute([$studentId]);
    $insertSubject = $pdo->prepare('INSERT INTO student_subjects (student_id, subject_name) VALUES (?, ?)');
    foreach ($subjects as $subject) $insertSubject->execute([$studentId, $subject]);
    classInfoResponse(true, 'Class information saved.', 200, classInfoForStudent($pdo, $studentId));
} catch (Throwable $error) {
    error_log('Student class information API failed: ' . $error->getMessage());
    classInfoResponse(false, 'Class information is temporarily unavailable.', 500);
}
