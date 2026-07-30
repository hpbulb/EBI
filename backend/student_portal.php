    <?php
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    session_start();
    require __DIR__ . '/config.php';

    function ensureStudentPortalColumns(PDO $pdo): void
    {
        $columns = $pdo->query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'"
        )->fetchAll(PDO::FETCH_COLUMN);

        if (!in_array('birth_certificate', $columns, true)) {
            $pdo->exec('ALTER TABLE students ADD COLUMN birth_certificate VARCHAR(255) DEFAULT NULL');
        }
    }

    ensureStudentPortalColumns($pdo);

    function portalResponse(bool $success, string $message, int $status = 200, array $extra = []): void
    {
        http_response_code($status);
        echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
        exit;
    }

    function studentProfile(PDO $pdo, int $studentId): ?array
    {
        $statement = $pdo->prepare(
            'SELECT id, portal_username, first_name, middle_name, surname, dob, gender,
                    nationality, state_of_origin, lga, city, religion,
                    application_type, programme, session, previous_school, last_class, start_date,
                    email, phone, address,
                    guardian_name, relationship, guardian_phone, guardian_email,
                    emergency_name, emergency_phone,
                    blood_group, medical_information,
                    passport, birth_certificate, created_at
            FROM students WHERE id = ?'
        );
        $statement->execute([$studentId]);
        return $statement->fetch() ?: null;
    }

    /**
     * Handle a document upload (passport or birth_certificate).
     * Accepts images for both; also accepts PDF for birth certificates.
     */
    function handleDocumentUpload(string $fieldName, bool $allowPdf = false): string
    {
        if (!isset($_FILES[$fieldName]) || $_FILES[$fieldName]['error'] === UPLOAD_ERR_NO_FILE) {
            portalResponse(false, 'No file was uploaded.', 422);
        }
        if ($_FILES[$fieldName]['error'] !== UPLOAD_ERR_OK) {
            portalResponse(false, 'File upload failed. Please try again.', 400);
        }

        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];
        if ($allowPdf) {
            $allowedTypes['application/pdf'] = 'pdf';
        }

        $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($_FILES[$fieldName]['tmp_name']);
        if (!isset($allowedTypes[$mimeType])) {
            $formats = $allowPdf ? 'JPG, PNG, WEBP, GIF, or PDF' : 'JPG, PNG, WEBP, or GIF';
            portalResponse(false, "File must be a $formats.", 400);
        }

        // Limit file size to 5 MB
        if ($_FILES[$fieldName]['size'] > 5 * 1024 * 1024) {
            portalResponse(false, 'File size must not exceed 5 MB.', 400);
        }

        $uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
            portalResponse(false, 'Could not create upload folder.', 500);
        }

        $fileName = date('YmdHis') . '_' . bin2hex(random_bytes(4)) . '.' . $allowedTypes[$mimeType];
        $targetFile = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

        if (!move_uploaded_file($_FILES[$fieldName]['tmp_name'], $targetFile)) {
            portalResponse(false, 'Could not save the uploaded file.', 500);
        }

        return 'uploads/' . $fileName;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') portalResponse(false, 'Invalid request.', 405);

    // Support both JSON and multipart form data
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'multipart/form-data')) {
        $input = $_POST;
    } else {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    }
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

        // ── Upload document (passport or birth certificate) ─────────────
        if ($action === 'upload_document') {
            $documentType = $input['document_type'] ?? '';
            if ($documentType === 'passport') {
                $filePath = handleDocumentUpload('file', false);
                $pdo->prepare('UPDATE students SET passport = ? WHERE id = ?')->execute([$filePath, $studentId]);
                $student = studentProfile($pdo, $studentId);
                portalResponse(true, 'Passport photograph uploaded successfully.', 200, ['student' => $student]);
            } elseif ($documentType === 'birth_certificate') {
                $filePath = handleDocumentUpload('file', true);
                $pdo->prepare('UPDATE students SET birth_certificate = ? WHERE id = ?')->execute([$filePath, $studentId]);
                $student = studentProfile($pdo, $studentId);
                portalResponse(true, 'Birth certificate uploaded successfully.', 200, ['student' => $student]);
            } else {
                portalResponse(false, 'Invalid document type. Use "passport" or "birth_certificate".', 422);
            }
        }

        // ── Update profile details ──────────────────────────────────────
        if ($action === 'update_profile') {
            // Whitelist of editable fields: camelCase key => DB column name
            $editableFields = [
                'firstName'          => 'first_name',
                'middleName'         => 'middle_name',
                'surname'            => 'surname',
                'dob'                => 'dob',
                'gender'             => 'gender',
                'nationality'        => 'nationality',
                'stateOfOrigin'      => 'state_of_origin',
                'lga'                => 'lga',
                'city'               => 'city',
                'religion'           => 'religion',
                'phone'              => 'phone',
                'address'            => 'address',
                'email'              => 'email',
                'previousSchool'     => 'previous_school',
                'lastClass'          => 'last_class',
                'bloodGroup'         => 'blood_group',
                'medicalInformation' => 'medical_information',
                'guardianName'       => 'guardian_name',
                'relationship'       => 'relationship',
                'guardianPhone'      => 'guardian_phone',
                'guardianEmail'      => 'guardian_email',
                'emergencyName'      => 'emergency_name',
                'emergencyPhone'     => 'emergency_phone',
            ];

            $updates = [];
            $params = [];
            foreach ($editableFields as $inputKey => $column) {
                if (array_key_exists($inputKey, $input)) {
                    $value = trim((string)$input[$inputKey]);
                    $updates[] = "`$column` = ?";
                    $params[] = $value === '' ? null : $value;
                }
            }

            if (empty($updates)) {
                portalResponse(false, 'No fields to update.', 422);
            }

            $params[] = $studentId;
            $pdo->prepare('UPDATE students SET ' . implode(', ', $updates) . ' WHERE id = ?')->execute($params);
            $student = studentProfile($pdo, $studentId);
            portalResponse(true, 'Profile updated successfully.', 200, ['student' => $student]);
        }

        portalResponse(false, 'Unknown portal action.', 400);
    } catch (PDOException $e) {
        portalResponse(false, 'Student portal is temporarily unavailable.', 500);
    }
