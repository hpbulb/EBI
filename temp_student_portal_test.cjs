const http = require('http');

function sendRequest(port, path, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: '127.0.0.1',
            port,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                resolve({ status: res.statusCode, body });
            });
        });
        req.on('error', (err) => reject(err));
        req.write(data);
        req.end();
    });
}

(async () => {
    for (const port of [8000, 5173]) {
        try {
            const result = await sendRequest(port, '/backend/student_portal.php', { action: 'login', username: 'EBI000001', password: 'password123' });
            console.log('port', port, 'result', result);
        } catch (error) {
            console.error('port', port, 'error', error.message);
        }
    }
})();
