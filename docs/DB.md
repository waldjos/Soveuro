# Soveuro — Modelo de base de datos

PostgreSQL. ORM: Prisma.

## Diagrama de relaciones

```
User 1──1 Profile
User 1──0..1 Doctor
User 1──0..1 Subscription
User 1──* RefreshToken
```

## Tablas

### User
| Campo         | Tipo     | Notas                    |
|---------------|----------|--------------------------|
| id            | UUID     | PK                       |
| email         | string   | UNIQUE                   |
| password_hash | string   | bcrypt                   |
| role          | enum     | PATIENT, DOCTOR, ADMIN   |
| is_active     | boolean  | default true             |
| created_at    | timestamp|                          |
| updated_at    | timestamp|                          |

### Profile
| Campo      | Tipo   | Notas    |
|------------|--------|----------|
| id         | UUID   | PK       |
| user_id    | UUID   | FK, UNIQUE |
| full_name  | string |          |
| avatar_url | string?|          |
| bio        | string?|          |
| city       | string?|          |
| created_at | timestamp |       |
| updated_at | timestamp |       |

### Doctor
| Campo      | Tipo   | Notas    |
|------------|--------|----------|
| id         | UUID   | PK       |
| user_id    | UUID   | FK, UNIQUE |
| specialty  | string |          |
| rating     | float  | default 0 |
| years_exp  | int    | default 0 |
| verified   | boolean| default false |
| links      | jsonb? | { website?, linkedIn?, ... } |
| created_at | timestamp |       |
| updated_at | timestamp |       |

### Event
| Campo       | Tipo     | Notas |
|-------------|----------|-------|
| id          | UUID     | PK    |
| title       | string   |       |
| description | string?  |       |
| starts_at   | timestamp|       |
| image_url   | string?  |       |
| created_at  | timestamp|       |
| updated_at  | timestamp|       |

### Subscription
| Campo        | Tipo     | Notas                          |
|--------------|----------|--------------------------------|
| id           | UUID     | PK                             |
| user_id      | UUID     | FK, UNIQUE                     |
| provider     | enum     | APPLE, GOOGLE, STRIPE          |
| status       | enum     | ACTIVE, EXPIRED, CANCELLED, PENDING |
| plan_id      | string?  |                                |
| expires_at   | timestamp? |                              |
| external_ref | string?  | ID en proveedor                 |
| created_at   | timestamp|                                |
| updated_at   | timestamp|                                |

### RefreshToken
| Campo      | Tipo     | Notas |
|------------|----------|-------|
| id         | UUID     | PK    |
| token      | string   | UNIQUE |
| user_id    | UUID     | FK    |
| expires_at | timestamp|       |
| created_at | timestamp|       |

## Migraciones
- Crear: `cd packages/api && npx prisma migrate dev --name <nombre>`
- Aplicar en prod: `npx prisma migrate deploy`

## Seed
- Ejecutar: `cd packages/api && npm run seed`
- Crea doctores de ejemplo (dr.garcia@soveuro.com, dr.martin@soveuro.com), admin (admin@soveuro.com) y eventos. Contraseña de prueba: `password123`.
