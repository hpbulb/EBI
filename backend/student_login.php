<?php
/**
 * Student API login endpoint for native apps and third-party web clients.
 * POST JSON: { "username": "...", "password": "..." }
 */
header('Content-Type: application/json');
require __DIR__ . '/cors.php';
configureCors(['POST', 'OPTIONS']);
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/config.php';

function loginApiResponse(bool $success, string $message, int $status = 200, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function ensureStudentLoginTokens(TursoConnection $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS student_api_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') loginApiResponse(false, 'Only POST requests are allowed.', 405);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) loginApiResponse(false, 'Send a JSON request body.', 400);

    $username = strtoupper(trim((string)($input['username'] ?? '')));
    $password = (string)($input['password'] ?? '');
    if ($username === '' || $password === '') loginApiResponse(false, 'Username and password are required.', 422);

    $statement = $pdo->prepare('SELECT id, portal_password_hash FROM students WHERE portal_username = ?');
    $statement->execute([$username]);
    $student = $statement->fetch();
    if (!$student || empty($student['portal_password_hash']) || !password_verify($password, $student['portal_password_hash'])) {
        loginApiResponse(false, 'Incorrect username or password.', 401);
    }

    ensureStudentLoginTokens($pdo);
    $token = bin2hex(random_bytes(32));
    $expiresAt = gmdate('Y-m-d H:i:s', time() + (60 * 60 * 24 * 30));
    $pdo->prepare('INSERT INTO student_api_tokens (student_id, token_hash, expires_at) VALUES (?, ?, ?)')
        ->execute([(int)$student['id'], hash('sha256', $token), $expiresAt]);

    loginApiResponse(true, 'Signed in.', 200, [
        'access_token' => $token,
        'token_type' => 'Bearer',
        'expires_at' => $expiresAt,
        'student' => ['id' => (int)$student['id'], 'username' => $username],
    ]);
} catch (Throwable $e) {
    // Keep implementation details out of the API response, but retain the
    // exception in Railway's runtime logs for diagnosis.
    error_log(sprintf('Student login API error: %s in %s:%d', $e->getMessage(), $e->getFile(), $e->getLine()));
    loginApiResponse(false, 'Student login service is temporarily unavailable.', 500);
}
