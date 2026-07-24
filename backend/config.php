<?php

$host = "localhost";
$dbname = "school_db";
$username = "root";
$password = "";

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
