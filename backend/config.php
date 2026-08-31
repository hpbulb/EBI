<?php

function loadEnvironment(string $path): void
{
    if (!is_readable($path)) return;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (strlen($value) >= 2 && $value[0] === '"' && substr($value, -1) === '"') $value = substr($value, 1, -1);
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

final class TursoResult
{
    private int $position = 0;
    public function __construct(private array $rows = []) {}
    public function fetch(): array|false
    {
        return $this->rows[$this->position++] ?? false;
    }
    public function fetchAll(): array
    {
        return $this->rows;
    }
    public function fetchColumn(int $column = 0): mixed
    {
        $row = $this->fetch();
        return $row === false ? false : array_values($row)[$column] ?? false;
    }
}

final class TursoStatement
{
    private ?TursoResult $result = null;
    public function __construct(private TursoConnection $connection, private string $sql) {}
    public function execute(array $parameters = []): bool
    {
        $this->result = $this->connection->run($this->sql, $parameters);
        return true;
    }
    public function fetch(): array|false
    {
        return $this->result?->fetch() ?? false;
    }
    public function fetchAll(): array
    {
        return $this->result?->fetchAll() ?? [];
    }
    public function fetchColumn(int $column = 0): mixed
    {
        return $this->result?->fetchColumn($column) ?? false;
    }
}

final class TursoConnection
{
    private string $endpoint;
    private ?string $lastInsertId = null;
    public function __construct(private string $url, private string $authToken)
    {
        $this->endpoint = rtrim(preg_replace('#^libsql://#', 'https://', $url), '/') . '/v2/pipeline';
    }
    public function prepare(string $sql): TursoStatement
    {
        return new TursoStatement($this, $sql);
    }
    public function query(string $sql): TursoResult
    {
        return $this->run($sql);
    }
    public function exec(string $sql): int
    {
        $this->run($sql);
        return 0;
    }
    public function lastInsertId(): string
    {
        return $this->lastInsertId ?? '0';
    }
    public function columns(string $table): array
    {
        return array_column($this->query("PRAGMA table_info(`$table`)")->fetchAll(), 'name');
    }
    public function run(string $sql, array $parameters = []): TursoResult
    {
        if (!function_exists('curl_init')) throw new RuntimeException('The cURL PHP extension is required for Turso.');
        $statement = ['sql' => $sql];
        if ($parameters !== []) {
            if (array_is_list($parameters)) $statement['args'] = array_map([$this, 'encodeValue'], $parameters);
            else {
                $statement['named_args'] = [];
                foreach ($parameters as $name => $value) $statement['named_args'][] = ['name' => ltrim((string) $name, ':@$'), 'value' => $this->encodeValue($value)];
            }
        }
        $curl = curl_init($this->endpoint);
        curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $this->authToken, 'Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['requests' => [['type' => 'execute', 'stmt' => $statement], ['type' => 'close']]], JSON_THROW_ON_ERROR)]);
        $body = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        if ($body === false) throw new RuntimeException("Could not reach Turso: $error");
        $payload = json_decode($body, true);
        $entry = $payload['results'][0] ?? [];
        if ($status < 200 || $status >= 300 || ($entry['type'] ?? '') !== 'ok') throw new RuntimeException($entry['error']['message'] ?? $payload['message'] ?? 'Turso database request failed.');
        $result = $entry['response']['result'] ?? [];
        $this->lastInsertId = isset($result['last_insert_rowid']) ? (string) $result['last_insert_rowid'] : $this->lastInsertId;
        $names = array_column($result['cols'] ?? [], 'name');
        $rows = [];
        foreach ($result['rows'] ?? [] as $row) {
            $decoded = [];
            foreach ($row as $index => $value) $decoded[$names[$index] ?? (string) $index] = $this->decodeValue($value);
            $rows[] = $decoded;
        }
        return new TursoResult($rows);
    }
    private function encodeValue(mixed $value): array
    {
        if ($value === null) return ['type' => 'null'];
        if (is_int($value)) return ['type' => 'integer', 'value' => (string) $value];
        if (is_float($value)) return ['type' => 'float', 'value' => (string) $value];
        return ['type' => 'text', 'value' => (string) $value];
    }
    private function decodeValue(array $value): mixed
    {
        if (($value['type'] ?? '') === 'null') return null;
        if (($value['type'] ?? '') === 'integer') return (int) $value['value'];
        if (($value['type'] ?? '') === 'float') return (float) $value['value'];
        return $value['value'] ?? null;
    }
}

function isDirectConfigRequest(): bool
{
    return basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__);
}
function configJsonResponse(bool $success, string $message, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'message' => $message]);
}

loadEnvironment(dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env');
$url = envValue('TURSO_DATABASE_URL');
$token = envValue('TURSO_AUTH_TOKEN');
if ($url === '' || $token === '') {
    $message = $url === '' ? 'TURSO_DATABASE_URL is not configured.' : 'TURSO_AUTH_TOKEN is not configured.';
    if (isDirectConfigRequest()) {
        configJsonResponse(false, $message, 503);
        exit;
    }
    throw new RuntimeException($message);
}
$pdo = new TursoConnection($url, $token);
if (isDirectConfigRequest()) {
    $pdo->query('SELECT 1');
    configJsonResponse(true, 'Turso database connection ready.');
}
