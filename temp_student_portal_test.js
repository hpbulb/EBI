const http = require('http');
const data = JSON.stringify({ action: 'login', username: 'EBI000001', password: 'password123' });
const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/backend/student_portal.php',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    },
};

const req = http.request(options, (res) => {
    console.log('status', res.statusCode);
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => { console.log(body); });
});
req.on('error', (error) => {
    console.error('error', error.message);
});
req.write(data);
req.end();
