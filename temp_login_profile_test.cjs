const http = require('http');

function request(port, path, { method = 'GET', body = null, headers = {} } = {}) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
                ...headers,
            },
        };
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(raw); } catch (_) {}
                resolve({ status: res.statusCode, body: json, raw });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

(async () => {
    const port = 8000;
    const base = '/backend';

    console.log('--- 1) LOGIN (send JSON body) ---');
    const login = await request(port, `${base}/student_login.php`, {
        method: 'POST',
        body: { username: 'EBI000001', password: 'password123' },
    });
    console.log('status', login.status);
    console.log(login.raw);

    if (!login.body || !login.body.success) {
        console.error('Login failed, cannot continue to profile.');
        process.exit(1);
    }

    const token = login.body.access_token;

    console.log('\n--- 2) PROFILE (send Bearer token) ---');
    const profile = await request(port, `${base}/student_profile.php`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log('status', profile.status);
    console.log(profile.raw);
})();
