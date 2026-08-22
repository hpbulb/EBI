<?php

/** Allows credentialed requests only from explicitly configured browser origins. */
function configureCors(array $methods): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $configuredOrigins = getenv('ALLOWED_ORIGINS') ?: '';
    $allowedOrigins = array_filter(array_map('trim', explode(',', $configuredOrigins)));
    $allowedOrigins[] = 'http://localhost:5173';

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Methods: ' . implode(', ', $methods));
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

/** Makes PHP session cookies usable from the configured cross-site frontend. */
function configureSessionCookie(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $isLocal = str_starts_with($origin, 'http://localhost');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'secure' => !$isLocal,
        'samesite' => $isLocal ? 'Lax' : 'None',
    ]);
}
