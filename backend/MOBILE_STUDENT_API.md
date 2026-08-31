# Mobile Student Portal API

Base path: `/backend`

## Sign in

`POST /student_login.php`

```json
{
  "username": "EBI000001",
  "password": "student-password"
}
```

The successful response contains `access_token`, `token_type` (`Bearer`), and `expires_at`. Store the token in the platform's secure storage.

## Fetch the signed-in student's registration information

`GET /student_profile.php`

Include this header:

```text
Authorization: Bearer <access_token>
```

The response includes a `student` summary and a `registration` object containing personal information, programme, guardian and emergency contacts, medical information, uploaded-document URLs, and registration date.

## Example response

```json
{
  "success": true,
  "student": { "student_id": "EBI000001", "fullname": "Ada Okafor" },
  "registration": { "programme": "JSS 1", "session": "2026/2027" }
}
```

Tokens expire after 30 days. A missing, expired, or invalid token returns HTTP `401`.
