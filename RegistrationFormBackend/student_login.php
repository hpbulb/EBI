<?php
/**
 * Backward-compatible Railway entrypoint for the student login API.
 *
 * The implementation lives in ../backend so it can share the portal CORS
 * helper. Keep this file because the Railway service is configured to run
 * /app/RegistrationFormBackend/student_login.php.
 */
require __DIR__ . '/../backend/student_login.php';
