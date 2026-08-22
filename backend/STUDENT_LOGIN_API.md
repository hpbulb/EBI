# Student login API

`POST /backend/student_login.php` authenticates a student for a mobile app or any web client that uses bearer tokens.

On the Railway deployment, use:

```text
https://ebi-production-16d.up.railway.app/backend/student_login.php
```

Do not use `/RegistrationFormBackend/student_login.php`: no login endpoint is deployed in that directory.

For a browser client hosted on another domain, add its exact origin to the comma-separated `ALLOWED_ORIGINS` value in `.env` (for example, `ALLOWED_ORIGINS=https://portal.example.com`). Native mobile clients do not use browser CORS.

Request body:

```json
{ "username": "EBI-000001", "password": "student-password" }
```

Successful response (`200`):

```json
{
  "success": true,
  "message": "Signed in.",
  "access_token": "...",
  "token_type": "Bearer",
  "expires_at": "2026-09-21 12:00:00",
  "student": { "id": 1, "username": "EBI-000001" }
}
```

Use the token when calling the existing protected student portal endpoints:

```http
POST /backend/student_portal.php
Authorization: Bearer <access_token>
Content-Type: application/json

{ "action": "profile" }
```

Tokens expire after 30 days. Keep them in platform-secure storage (for example, Keychain/Keystore); do not put them in a URL or source control. Login errors are `400`, `401`, `405`, or `422`, with a JSON `message` explaining the problem.
