<?php

function loadEnvironment(string $path): void
{
    if (!is_readable($path)) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (strlen($value) >= 2 && $value[0] === '"' && substr($value, -1) === '"') {
            $value = substr($value, 1, -1);
        }
        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

function envValue(string $key, string $default = ''): string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

loadEnvironment(dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env');

$host = envValue('DB_HOST', 'localhost');
$dbname = envValue('DB_NAME', 'school_db');
$username = envValue('DB_USER', 'root');
$password = envValue('DB_PASSWORD', '');

function isDirectConfigRequest(): bool
{
    return basename($_SERVER["SCRIPT_FILENAME"] ?? "") === basename(__FILE__);
}

function configJsonResponse(bool $success, string $message, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header("Content-Type: application/json");

    echo json_encode([
        "success" => $success,
        "message" => $message,
    ]);
}

function quoteDatabaseName(string $name): string
{
    return "`" . str_replace("`", "``", $name) . "`";
}

try {
    $pdo = new PDO(
        "mysql:host=$host;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $pdo->exec(
        "CREATE DATABASE IF NOT EXISTS " . quoteDatabaseName($dbname) .
        " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    $pdo->exec("USE " . quoteDatabaseName($dbname));

    if (isDirectConfigRequest()) {
        configJsonResponse(true, "Database connection ready: $dbname");
    }
} catch (PDOException $e) {
    if (isDirectConfigRequest()) {
        configJsonResponse(false, "Connection failed: " . $e->getMessage(), 500);
        exit;
    }

    throw $e;
}
