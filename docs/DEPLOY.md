# Desplegar Soveuro (Backend NestJS en Render / Railway)

Backend listo para despliegue con Postgres administrado y Prisma. El servidor escucha en **puerto dinámico** (`PORT`); la configuración es por **variables de entorno** con `@nestjs/config`.

---

## Variables de entorno (obligatorias)

Configurar en el panel de Render/Railway (o en `.env` en local):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL (Render/Railway la proveen si usas su Postgres) | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Secreto para tokens de acceso (string largo aleatorio) | Generar en [randomkeygen.com](https://randomkeygen.com) |
| `JWT_EXPIRES_IN` | Expiración del access token | `15m` |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens (otro string aleatorio) | Idem |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token | `7d` |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma (sin espacios o con espacios, se recortan) | `https://tu-app.vercel.app,https://otro.dominio.com` |

Opcionales:

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `PORT` | Puerto en el que escucha la API | `3000` (Render/Railway suelen inyectarlo) |
| `NODE_ENV` | `production` en prod | - |
| `SWAGGER_ENABLED` | Si es `true`, habilita `/docs` también en producción | En prod Swagger está desactivado salvo que sea `true` |

La API usa **solo** estas variables (y las de pagos si aplica); no se guardan secretos en código. **No loguear** en producción tokens, `Authorization` ni cuerpos con contraseñas (el código actual no lo hace).

---

## Comandos exactos

### Local (desarrollo)

1. Base de datos con Docker:
   ```bash
   cd infra/docker
   docker compose up -d
   ```
2. Desde la raíz del monorepo (o desde `packages/api`):
   ```bash
   cd packages/api
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npm run start:dev
   ```
   - Migraciones en local: `npm run prisma:migrate:dev` (equivale a `prisma migrate dev`).
   - API: http://localhost:3000  
   - Health: http://localhost:3000/health  
   - Swagger (solo en dev): http://localhost:3000/docs  

### Producción (Render / Railway)

1. **Build** (lo que debe ejecutar el servicio en el paso *Build*):
   ```bash
   npm install
   npm run build
   ```
   - `postinstall` ya ejecuta `prisma generate` tras `npm install`.

2. **Migraciones** (ejecutar **antes** del start en el primer deploy o en un paso separado):
   ```bash
   npx prisma migrate deploy
   ```
   En el `package.json` está el script: `npm run prisma:migrate` → `prisma migrate deploy`.

3. **Start** (comando de inicio del servicio):
   ```bash
   npm run start:prod
   ```
   Equivale a `node dist/main.js` y usa `process.env.PORT || 3000`.

Resumen prod: **Build** = `npm install && npm run build`. **Start** = `npm run prisma:migrate && npm run start:prod` (o ejecutar `prisma migrate deploy` en un release step y luego solo `npm run start:prod`).

---

## Render

1. **Nuevo Web Service** → Conectar repo GitHub (monorepo).
2. **Root Directory**: `packages/api`.
3. **Runtime**: Node.
4. **Build Command**:
   ```bash
   npm install && npm run build
   ```
5. **Start Command**:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```
   (O en Render: añadir un "Release Command" `npx prisma migrate deploy` y en Start solo `npm run start:prod` si lo soporta.)
6. **Variables**: Añadir todas las de la tabla anterior (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `CORS_ORIGIN`). `PORT` lo asigna Render.
7. **Postgres**: Crear base de datos Postgres en Render y usar la `DATABASE_URL` que proporciona.

---

## Railway

1. **New Project** → Deploy from GitHub repo (monorepo).
2. **Root Directory**: `packages/api`.
3. **Build Command**:
   ```bash
   npm install && npm run build
   ```
4. **Start Command**:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```
5. **Variables**: Igual que en Render. Si añades el addon Postgres de Railway, se inyecta `DATABASE_URL` automáticamente.
6. **Dominio**: Generate Domain en el servicio para obtener la URL pública (ej. `https://tu-api.up.railway.app`).

---

## Health check

- **GET** `/health` → `{ "status": "ok" }`  
Útil para load balancers y monitoreo. No requiere autenticación.

---

## Seed (opcional)

Para datos de prueba en la base desplegada (ejecutar una vez, con la misma `DATABASE_URL` de prod):

```bash
cd packages/api
# Usar DATABASE_URL de Render/Railway
npm run seed
```

No es obligatorio para el deploy.

---

## Resumen rápido

| Entorno | Migraciones | Arranque |
|---------|-------------|----------|
| Local | `npx prisma migrate dev` o `npm run prisma:migrate:dev` | `npm run start:dev` |
| Prod | `npm run prisma:migrate` (`prisma migrate deploy`) | `npm run start:prod` |

| Qué | Dónde | Resultado |
|-----|--------|-----------|
| API + Postgres | Render o Railway | `https://tu-api.onrender.com` o `https://tu-api.up.railway.app` |
| Health | Cualquiera | `GET /health` → `{ "status": "ok" }` |
| Swagger | Solo si `SWAGGER_ENABLED=true` en prod | `GET /docs` |

---

## App Flutter (web) en Vercel

Para ver la app en el navegador usando la API desplegada:

1. Build con la URL del backend:
   ```bash
   cd apps/mobile
   flutter pub get
   flutter build web --dart-define=API_BASE_URL=https://TU-API.onrender.com
   ```
2. Desplegar la carpeta `build/web` en Vercel (u otro host estático).
3. En el backend, configurar `CORS_ORIGIN` con la URL de la app (ej. `https://tu-app.vercel.app`).

Vercel no incluye Flutter por defecto; suele hacerse el build en local o en CI y desplegar solo `build/web`.
