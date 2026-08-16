<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

function authResponse(bool $success, string $message, int $status = 200, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function ensureApplicantAccounts(TursoConnection $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS applicant_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') authResponse(false, 'Invalid request.', 405);
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$action = $input['action'] ?? '';

try {
    require __DIR__ . '/config.php';
    ensureApplicantAccounts($pdo);
    if ($action === 'session') {
        if (empty($_SESSION['applicant_email'])) authResponse(true, 'No active session.', 200, ['authenticated' => false]);
        authResponse(true, 'Signed in.', 200, ['authenticated' => true, 'email' => $_SESSION['applicant_email']]);
    }
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        authResponse(true, 'Signed out.');
    }

    $email = filter_var(trim((string)($input['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    $password = (string)($input['password'] ?? '');
    if (!$email) authResponse(false, 'Enter a valid parent or guardian email address.', 422);
    if (strlen($password) < 8) authResponse(false, 'Password must be at least 8 characters.', 422);

    if ($action === 'signup') {
        $check = $pdo->prepare('SELECT id FROM applicant_accounts WHERE email = ?');
        $check->execute([$email]);
        if ($check->fetch()) authResponse(false, 'An account already exists for this email. Please sign in.', 409);
        $pdo->prepare('INSERT INTO applicant_accounts (email, password_hash) VALUES (?, ?)')->execute([$email, password_hash($password, PASSWORD_DEFAULT)]);
    } elseif ($action === 'login') {
        $check = $pdo->prepare('SELECT password_hash FROM applicant_accounts WHERE email = ?');
        $check->execute([$email]);
        $account = $check->fetch();
        if (!$account || !password_verify($password, $account['password_hash'])) authResponse(false, 'Incorrect email or password.', 401);
    } else {
        authResponse(false, 'Unknown account action.', 400);
    }
    session_regenerate_id(true);
    $_SESSION['applicant_email'] = $email;
    authResponse(true, $action === 'signup' ? 'Account created.' : 'Signed in.', 200, ['authenticated' => true, 'email' => $email]);
} catch (Throwable $e) {
    authResponse(false, 'Account setup failed: ' . $e->getMessage(), 500);
}
