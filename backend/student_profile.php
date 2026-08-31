<?php
/**
 * Student profile API for mobile clients.
 *
 * GET /backend/student_profile.php
 * Authorization: Bearer <access_token>
 */
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/cors.php';
configureCors(['GET', 'OPTIONS']);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function profileApiResponse(bool $success, int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success], $payload), JSON_UNESCAPED_SLASHES);
    exit;
}

function profilePictureUrl(?string $path): ?string
{
    if (!$path) return null;

    $host = preg_replace('/[^A-Za-z0-9.:-]/', '', (string)($_SERVER['HTTP_HOST'] ?? ''));
    if ($host === '') return $path;

    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $scheme = $isHttps ? 'https' : 'http';
    $applicationPath = rtrim(dirname(dirname((string)($_SERVER['SCRIPT_NAME'] ?? '/backend/student_profile.php'))), '/\\');
    return $scheme . '://' . $host . $applicationPath . '/backend/' . ltrim($path, '/');
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        profileApiResponse(false, 405, ['message' => 'Only GET requests are allowed.']);
    }

    require __DIR__ . '/config.php';

    $authorization = trim((string)($_SERVER['HTTP_AUTHORIZATION'] ?? ''));
    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $authorization, $matches)) {
        profileApiResponse(false, 401, ['message' => 'A valid Bearer token is required.']);
    }

    $tokenStatement = $pdo->prepare(
        'SELECT student_id FROM student_api_tokens WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP'
    );
    $tokenStatement->execute([hash('sha256', $matches[1])]);
    $studentId = (int)$tokenStatement->fetchColumn();
    if ($studentId < 1) {
        profileApiResponse(false, 401, ['message' => 'Your access token is invalid or has expired.']);
    }

    $studentStatement = $pdo->prepare(
        'SELECT id, portal_username, first_name, middle_name, surname, dob, gender,
                nationality, state_of_origin, lga, city, religion,
                application_type, programme, session, previous_school, last_class, start_date,
                email, phone, address, guardian_name, relationship, guardian_phone, guardian_email,
                emergency_name, emergency_phone, blood_group, medical_information,
                passport, birth_certificate, created_at
         FROM students WHERE id = ?'
    );
    $studentStatement->execute([$studentId]);
    $student = $studentStatement->fetch();
    if (!$student) {
        profileApiResponse(false, 404, ['message' => 'Student profile was not found.']);
    }

    profileApiResponse(true, 200, [
        'student' => [
            'id' => (int)$student['id'],
            'student_id' => $student['portal_username'] ?: 'EBI' . str_pad((string)$student['id'], 6, '0', STR_PAD_LEFT),
            'fullname' => trim(implode(' ', array_filter([
                $student['first_name'], $student['middle_name'], $student['surname'],
            ]))),
            'email' => $student['email'],
            'phone' => $student['phone'],
            'class' => $student['programme'] ?: $student['last_class'],
            'address' => $student['address'],
            'guardian_name' => $student['guardian_name'],
            'guardian_phone' => $student['guardian_phone'],
            'profile_picture' => profilePictureUrl($student['passport']),
        ],
        'registration' => [
            'date_of_birth' => $student['dob'],
            'gender' => $student['gender'],
            'nationality' => $student['nationality'],
            'state_of_origin' => $student['state_of_origin'],
            'lga' => $student['lga'],
            'city' => $student['city'],
            'religion' => $student['religion'],
            'application_type' => $student['application_type'],
            'programme' => $student['programme'],
            'session' => $student['session'],
            'previous_school' => $student['previous_school'],
            'last_class' => $student['last_class'],
            'start_date' => $student['start_date'],
            'guardian' => [
                'name' => $student['guardian_name'],
                'relationship' => $student['relationship'],
                'phone' => $student['guardian_phone'],
                'email' => $student['guardian_email'],
            ],
            'emergency_contact' => [
                'name' => $student['emergency_name'],
                'phone' => $student['emergency_phone'],
            ],
            'medical' => [
                'blood_group' => $student['blood_group'],
                'information' => $student['medical_information'],
            ],
            'passport_url' => profilePictureUrl($student['passport']),
            'birth_certificate_url' => profilePictureUrl($student['birth_certificate']),
            'registered_at' => $student['created_at'],
        ],
    ]);
} catch (Throwable $e) {
    profileApiResponse(false, 500, ['message' => 'Student profile is temporarily unavailable.']);
}
