<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();
require __DIR__ . '/config.php';

function portalResponse(bool $success, string $message, int $status = 200, array $extra = []): void {
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function studentProfile(PDO $pdo, int $studentId): ?array {
    $statement = $pdo->prepare('SELECT id, portal_username, first_name, middle_name, surname, programme, session, application_type, email, passport, created_at FROM students WHERE id = ?');
    $statement->execute([$studentId]);
    return $statement->fetch() ?: null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') portalResponse(false, 'Invalid request.', 405);
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$action = $input['action'] ?? '';

try {
    if ($action === 'login') {
        $username = strtoupper(trim((string)($input['username'] ?? '')));
        $password = (string)($input['password'] ?? '');
        if ($username === '' || $password === '') portalResponse(false, 'Enter your username and password.', 422);
        $statement = $pdo->prepare('SELECT id, portal_password_hash FROM students WHERE portal_username = ?');
        $statement->execute([$username]);
        $student = $statement->fetch();
        if (!$student || !$student['portal_password_hash'] || !password_verify($password, $student['portal_password_hash'])) {
            portalResponse(false, 'Incorrect username or password.', 401);
        }
        session_regenerate_id(true);
        $_SESSION['student_id'] = (int)$student['id'];
        portalResponse(true, 'Signed in.', 200, ['student' => studentProfile($pdo, (int)$student['id'])]);
    }

    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        portalResponse(true, 'Signed out.');
    }

    $studentId = (int)($_SESSION['student_id'] ?? 0);
    if ($studentId < 1) portalResponse(false, 'Please sign in to access the student portal.', 401);

    if ($action === 'session' || $action === 'profile') {
        $student = studentProfile($pdo, $studentId);
        if (!$student) portalResponse(false, 'Student account was not found.', 404);
        portalResponse(true, 'Student profile loaded.', 200, ['student' => $student]);
    }

    if ($action === 'change_password') {
        $currentPassword = (string)($input['currentPassword'] ?? '');
        $newPassword = (string)($input['newPassword'] ?? '');
        if (strlen($newPassword) < 8) portalResponse(false, 'Your new password must be at least 8 characters.', 422);
        $statement = $pdo->prepare('SELECT portal_password_hash FROM students WHERE id = ?');
        $statement->execute([$studentId]);
        $hash = $statement->fetchColumn();
        if (!$hash || !password_verify($currentPassword, $hash)) portalResponse(false, 'Your current password is incorrect.', 401);
        $pdo->prepare('UPDATE students SET portal_password_hash = ? WHERE id = ?')->execute([password_hash($newPassword, PASSWORD_DEFAULT), $studentId]);
        portalResponse(true, 'Password updated successfully.');
    }

    portalResponse(false, 'Unknown portal action.', 400);
} catch (PDOException $e) {
    portalResponse(false, 'Student portal is temporarily unavailable.', 500);
}
