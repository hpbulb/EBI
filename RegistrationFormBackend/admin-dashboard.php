<?php
header('Content-Type: application/json');
require __DIR__ . '/../backend/cors.php';
configureCors(['GET', 'POST', 'PATCH', 'OPTIONS']);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

configureSessionCookie();
session_start();

function dashboardResponse(bool $success, string $message, int $status = 200, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function ensureReviewColumns(TursoConnection $pdo): void
{
    $columns = [
        'review_status' => "VARCHAR(20) NOT NULL DEFAULT 'pending'",
        'review_note' => 'TEXT DEFAULT NULL',
    ];
    $existingColumns = $pdo->columns('students');

    foreach ($columns as $name => $definition) {
        if (!in_array($name, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE `students` ADD COLUMN `$name` $definition");
        }
    }
}

function ensureAdminAccountsTable(TursoConnection $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS `admin_accounts` (
        `id` INTEGER PRIMARY KEY AUTOINCREMENT,
        `full_name` VARCHAR(150) NOT NULL,
        `email` VARCHAR(150) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `admin_block` VARCHAR(100) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $existingColumns = $pdo->columns('admin_accounts');

    if (!in_array('admin_block', $existingColumns, true)) {
        $pdo->exec("ALTER TABLE `admin_accounts` ADD COLUMN `admin_block` VARCHAR(100) NOT NULL DEFAULT ''");
    }
}

function requireAdminSession(): void
{
    if (empty($_SESSION['admin_username'])) {
        dashboardResponse(false, 'Please sign in to access the administration dashboard.', 401);
    }
}

try {
    require __DIR__ . '/config.php';
    ensureReviewColumns($pdo);
    ensureAdminAccountsTable($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            dashboardResponse(false, 'Invalid request body.', 400);
        }

        $action = $input['action'] ?? '';

        if ($action === 'session') {
            if (empty($_SESSION['admin_username'])) {
                dashboardResponse(true, 'No active administrator session.', 200, ['authenticated' => false]);
            }
            dashboardResponse(true, 'Administrator session active.', 200, [
                'authenticated' => true,
                'username' => $_SESSION['admin_username'],
                'admin_block' => $_SESSION['admin_block'] ?? '',
                'full_name' => $_SESSION['admin_full_name'] ?? $_SESSION['admin_username'],
            ]);
        }

        if ($action === 'logout') {
            $_SESSION = [];
            session_destroy();
            dashboardResponse(true, 'Signed out.');
        }

        if ($action === 'register') {
            $fullName = trim((string)($input['fullName'] ?? ''));
            $email = strtolower(trim((string)($input['email'] ?? '')));
            $password = (string)($input['password'] ?? '');
            $adminBlock = trim((string)($input['adminBlock'] ?? ''));
            $registrationCode = (string)($input['registrationCode'] ?? '');
            $expectedRegistrationCode = envValue('ADMIN_REGISTRATION_CODE');

            if ($fullName === '' || $email === '' || $password === '' || $adminBlock === '') {
                dashboardResponse(false, 'All fields are required.', 400);
            }
            if ($expectedRegistrationCode === '' || !hash_equals($expectedRegistrationCode, $registrationCode)) {
                dashboardResponse(false, 'A valid administrator registration code is required.', 403);
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                dashboardResponse(false, 'Enter a valid email address.', 422);
            }
            if (strlen($password) < 8) {
                dashboardResponse(false, 'Password must be at least 8 characters.', 422);
            }
            $validBlocks = ['Admissions', 'Academics', 'Student Affairs', 'Finance', 'Administration', 'Examinations', 'ICT', 'Library'];
            if (!in_array($adminBlock, $validBlocks, true)) {
                dashboardResponse(false, 'Please select a valid admin block.', 422);
            }

            $check = $pdo->prepare('SELECT id FROM admin_accounts WHERE email = ?');
            $check->execute([$email]);
            if ($check->fetch()) {
                dashboardResponse(false, 'An account with this email already exists.', 409);
            }

            $insert = $pdo->prepare('INSERT INTO admin_accounts (full_name, email, password_hash, admin_block) VALUES (?, ?, ?, ?)');
            $insert->execute([$fullName, $email, password_hash($password, PASSWORD_DEFAULT), $adminBlock]);

            session_regenerate_id(true);
            $_SESSION['admin_username'] = $email;
            $_SESSION['admin_full_name'] = $fullName;
            $_SESSION['admin_block'] = $adminBlock;

            dashboardResponse(true, 'Administrator account created and signed in.', 200, [
                'username' => $email,
                'full_name' => $fullName,
                'admin_block' => $adminBlock,
            ]);
        }

        if ($action === 'login') {
            $username = trim((string)($input['username'] ?? ''));
            $password = (string)($input['password'] ?? '');

            // Check environment-based super admin first
            $envUsername = envValue('ADMIN_USERNAME');
            $envPasswordHash = envValue('ADMIN_PASSWORD_HASH');
            if ($envUsername !== '' && $envPasswordHash !== '' && hash_equals($envUsername, $username) && password_verify($password, $envPasswordHash)) {
                session_regenerate_id(true);
                $_SESSION['admin_username'] = $envUsername;
                $_SESSION['admin_full_name'] = $envUsername;
                $_SESSION['admin_block'] = 'Super Admin';
                dashboardResponse(true, 'Signed in.', 200, ['username' => $envUsername, 'admin_block' => 'Super Admin', 'full_name' => $envUsername]);
            }

            // Check database admin accounts
            $stmt = $pdo->prepare('SELECT id, full_name, email, password_hash, admin_block FROM admin_accounts WHERE email = ?');
            $stmt->execute([strtolower($username)]);
            $admin = $stmt->fetch();

            if (!$admin || !password_verify($password, $admin['password_hash'])) {
                dashboardResponse(false, 'Incorrect administrator email or password.', 401);
            }

            session_regenerate_id(true);
            $_SESSION['admin_username'] = $admin['email'];
            $_SESSION['admin_full_name'] = $admin['full_name'];
            $_SESSION['admin_block'] = $admin['admin_block'];
            dashboardResponse(true, 'Signed in.', 200, [
                'username' => $admin['email'],
                'full_name' => $admin['full_name'],
                'admin_block' => $admin['admin_block'],
            ]);
        }

        dashboardResponse(false, 'Unknown administrator action.', 400);
    }

    requireAdminSession();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->query(
            "SELECT id, trim(surname || ' ' || first_name || ' ' || COALESCE(middle_name, '')) AS full_name,
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
        "SELECT id, trim(surname || ' ' || first_name || ' ' || COALESCE(middle_name, '')) AS full_name,
                email, phone, programme, application_type, session, guardian_name,
                address, COALESCE(review_status, 'pending') AS review_status,
                review_note, created_at
         FROM students WHERE id = ?"
    );
    $student->execute([$id]);
    dashboardResponse(true, 'Applicant review updated.', 200, ['student' => $student->fetch()]);
} catch (Throwable $error) {
    dashboardResponse(false, 'Dashboard database request failed.', 500);
}
