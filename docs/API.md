# API reference

Base URL (local): `http://127.0.0.1:8000`. All endpoints return JSON. Interactive docs: `/docs`.

## Conventions

- Successful responses wrap their payload in a `data` key.
- Errors use one consistent shape:

```json
{ "error": { "code": "validation_error", "message": "Human-readable summary", "fields": { "email": "Enter a valid email address" } } }
```

`fields` is only present for validation errors (HTTP 422). Error codes: `validation_error`, `not_found`,
`http_error`, `internal_error`.

## `GET /api/health`

Returns `200` when the service is running.

```json
{ "status": "ok", "service": "service-request-api", "version": "1.0.0", "storage": "file", "time": "2026-10-11T10:00:00Z" }
```

`storage` is `file` or `memory` (memory means the data file could not be used).

## `GET /api/requests`

Returns every stored request, newest first.

```json
{
  "data": [
    {
      "id": 3,
      "name": "Mei Tanaka",
      "email": "mei.tanaka@example.com",
      "subject": "VPN disconnects every hour",
      "description": "When working remotely the VPN drops roughly once an hour…",
      "status": "resolved",
      "created_at": "2026-09-30T16:05:00Z"
    }
  ],
  "count": 1
}
```

`status` is one of `open`, `in_progress`, `resolved`.

## `POST /api/requests`

Creates a request. Body (`Content-Type: application/json`):

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | 2–80 characters |
| `email` | string | valid email address, max 254 characters (stored lower-case) |
| `subject` | string | 3–120 characters |
| `description` | string | 10–1000 characters |

Text is trimmed and control characters are removed. Responses:

- `201 Created`: `{ "data": { …the stored request… }, "message": "Service request created." }`
- `422 Unprocessable Entity`: validation error with per-field messages (shape above)

Example:

```bash
curl -X POST http://127.0.0.1:8000/api/requests \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","subject":"Laptop will not boot","description":"The laptop shows a black screen after the logo."}'
```

## CORS

The API only accepts browser calls from the origins listed in `CORS_ORIGINS`. Requests made with `curl`
or from server code are not affected by CORS.
