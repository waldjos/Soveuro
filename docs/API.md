# Soveuro API

Base URL (desarrollo): `http://localhost:3000`  
Swagger: `http://localhost:3000/docs`

## Autenticación

### POST /auth/register
Registra un nuevo usuario (rol PATIENT).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "minimo8chars",
  "fullName": "Nombre Apellido"
}
```

**Response:** `200`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200` — Mismo formato que register.

### POST /auth/refresh
Renueva el access token usando el refresh token.

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response:** `200` — `{ "accessToken": "...", "refreshToken": "..." }`

---

## Usuario autenticado

### GET /me
Requiere header: `Authorization: Bearer <accessToken>`.

**Response:** `200`
```json
{
  "user": { "id": "...", "email": "...", "role": "PATIENT" },
  "profile": { "id": "...", "fullName": "...", "avatarUrl": null, "bio": null, "city": null },
  "doctor": null,
  "subscription": null
}
```
Si el usuario es doctor, `doctor` vendrá rellenado. Si tiene suscripción, `subscription` también.

---

## Doctores (público)

### GET /doctors
Listado paginado. Query params opcionales: `page`, `limit`, `specialty`, `city`.

**Response:** `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "Dra. María García",
      "avatarUrl": null,
      "specialty": "Medicina interna",
      "rating": 4.8,
      "yearsExp": 15,
      "verified": true,
      "city": "Madrid"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

### GET /doctors/:id
Detalle de un doctor (público).

**Response:** `200` — Mismo que item de lista más `bio` y `links` si existen.

---

## Eventos (público)

### GET /events
Listado de eventos/noticias.

**Response:** `200`
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Jornada de salud cardiovascular",
      "description": "...",
      "startsAt": "2025-02-25T10:00:00.000Z",
      "imageUrl": null
    }
  ]
}
```

---

## Códigos de error
- `400` — Validación (body incorrecto).
- `401` — No autenticado o token inválido/expirado.
- `403` — Sin permiso (roles).
- `404` — Recurso no encontrado.
- `409` — Conflicto (ej. email ya registrado).
