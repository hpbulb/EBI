    <?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Content-Type: application/json');
    session_start();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

    function paymentResponse(bool $success, string $message, int $status = 200, array $extra = []): void {
        http_response_code($status);
        echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
        exit;
    }

    require __DIR__ . '/config.php';

    function ensurePaymentsTable(PDO $pdo): void {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `application_payments` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `reference` VARCHAR(100) NOT NULL UNIQUE,
            `email` VARCHAR(150) NOT NULL,
            `amount` INT UNSIGNED NOT NULL,
            `status` VARCHAR(30) NOT NULL DEFAULT 'initialized',
            `student_id` INT UNSIGNED DEFAULT NULL,
            `paid_at` TIMESTAMP NULL DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    function paystackRequest(string $url, string $secret, ?array $payload = null): array {
        if (!function_exists('curl_init')) paymentResponse(false, 'Server payment support is unavailable (cURL is required).', 500);
        $curl = curl_init($url);
        curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ["Authorization: Bearer $secret", 'Content-Type: application/json']]);
        if ($payload !== null) { curl_setopt($curl, CURLOPT_POST, true); curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($payload)); }
        $body = curl_exec($curl); $code = curl_getinfo($curl, CURLINFO_HTTP_CODE); $error = curl_error($curl); curl_close($curl);
        if ($body === false) paymentResponse(false, "Could not reach Paystack: $error", 502);
        $data = json_decode($body, true);
        if ($code < 200 || $code >= 300 || !is_array($data) || empty($data['status'])) paymentResponse(false, $data['message'] ?? 'Paystack could not process the request.', 502);
        return $data;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') paymentResponse(false, 'Invalid request.', 405);
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? '';
    $secret = envValue('PAYSTACK_SECRET_KEY');
    $feeNaira = (int) envValue('PAYSTACK_APPLICATION_FEE_NGN', '0');
    if ($secret === '' || str_contains($secret, 'replace_me') || $feeNaira < 1) paymentResponse(false, 'Payment is not configured. Please contact the school.', 503);

    try {
        ensurePaymentsTable($pdo);
        if ($action === 'initialize') {
            $email = $_SESSION['applicant_email'] ?? '';
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) paymentResponse(false, 'Please sign in before making a payment.', 401);
            $reference = 'EBI-' . date('Ymd') . '-' . bin2hex(random_bytes(6));
            $callback = envValue('PAYSTACK_CALLBACK_URL');
            if ($callback === '') paymentResponse(false, 'Payment callback URL is not configured.', 503);
            $amount = $feeNaira * 100;
            $paystack = paystackRequest('https://api.paystack.co/transaction/initialize', $secret, ['email' => $email, 'amount' => $amount, 'reference' => $reference, 'callback_url' => $callback]);
            $pdo->prepare('INSERT INTO application_payments (reference, email, amount) VALUES (?, ?, ?)')->execute([$reference, $email, $amount]);
            paymentResponse(true, 'Payment initialized.', 200, ['authorization_url' => $paystack['data']['authorization_url'], 'reference' => $reference]);
        }
    if ($action === 'verify') {
            $reference = preg_replace('/[^A-Za-z0-9_-]/', '', (string)($input['reference'] ?? ''));
            if ($reference === '') paymentResponse(false, 'Payment reference is required.', 422);
            $payment = $pdo->prepare('SELECT * FROM application_payments WHERE reference = ?'); $payment->execute([$reference]); $row = $payment->fetch();
            if (!$row) paymentResponse(false, 'Payment reference was not found.', 404);
            $paystack = paystackRequest('https://api.paystack.co/transaction/verify/' . rawurlencode($reference), $secret);
            $transaction = $paystack['data'];
            if (($transaction['status'] ?? '') !== 'success' || (int)($transaction['amount'] ?? 0) !== (int)$row['amount'] || strtolower((string)($transaction['customer']['email'] ?? '')) !== strtolower($row['email'])) paymentResponse(false, 'This payment has not been completed or could not be verified.', 402);
            $pdo->prepare("UPDATE application_payments SET status = 'paid', paid_at = COALESCE(paid_at, NOW()) WHERE reference = ?")->execute([$reference]);
        paymentResponse(true, 'Payment verified.', 200, ['reference' => $reference, 'email' => $row['email']]);
    }
    if ($action === 'lookup') {
        $email = $_SESSION['applicant_email'] ?? '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) paymentResponse(false, 'Please sign in before viewing payment status.', 401);

        $statement = $pdo->prepare("SELECT reference, email, status FROM application_payments WHERE email = ? AND student_id IS NULL ORDER BY (status = 'paid') DESC, created_at DESC LIMIT 1");
        $statement->execute([$email]);
        $payment = $statement->fetch();
        if (!$payment || $payment['status'] !== 'paid') {
            paymentResponse(true, 'No completed application payment was found for this email.', 200, ['paid' => false]);
        }
        paymentResponse(true, 'Completed application payment found.', 200, ['paid' => true, 'reference' => $payment['reference'], 'email' => $payment['email']]);
    }
        paymentResponse(false, 'Unknown payment action.', 400);
    } catch (PDOException $e) { paymentResponse(false, 'Payment setup failed: ' . $e->getMessage(), 500); }
