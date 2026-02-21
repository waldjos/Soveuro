# Soveuro

MVP móvil (Flutter) + backend (NestJS) en monorepo.

## Estructura

```
soveuro/
  apps/mobile       # Flutter (iOS/Android)
  packages/api      # NestJS + Prisma + PostgreSQL
  infra/docker      # Docker Compose (Postgres)
  docs/             # PRD, API, DB, PAYMENTS
```

## Requisitos

- Node.js 20+
- Flutter 3.x
- Docker y Docker Compose
- PostgreSQL 16 (o usar Docker)

---

## 1. Levantar la base de datos

```bash
cd infra/docker
docker compose up -d
```

Variables opcionales (por defecto): `POSTGRES_USER=soveuro`, `POSTGRES_PASSWORD=soveuro_secret`, `POSTGRES_DB=soveuro`, `POSTGRES_PORT=5432`.

Comprobar que Postgres está listo:

```bash
docker compose ps
```

---

## 2. Backend (NestJS)

```bash
cd packages/api
cp .env.example .env   # si existe; editar DATABASE_URL y JWT si hace falta
npm install
npx prisma migrate dev
npm run start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

---

## 3. App móvil (Flutter)

```bash
cd apps/mobile
flutter pub get
flutter run
```

Configurar `lib/core/config/env.dart` (o `.env`) con la URL del backend (ej. `http://10.0.2.2:3000` para Android emulator, `http://localhost:3000` para iOS simulator).

---

## Todo en uno (Windows)

Con **Docker Desktop iniciado**, desde la raíz del repo `soveuro`:

```powershell
.\scripts\run-all.ps1
```
Levanta Postgres, aplica migraciones, ejecuta el seed y arranca el backend. Para la app: en otra terminal `cd apps\mobile` y `flutter run`.

---

## Comandos útiles

En Windows PowerShell puedes usar `;` en lugar de `&&` para encadenar comandos.

| Acción              | Comando                          |
|---------------------|----------------------------------|
| DB up               | `cd infra/docker; docker compose up -d` |
| DB down             | `cd infra/docker && docker compose down`  |
| Backend dev         | `cd packages/api && npm run start:dev`    |
| Backend build       | `cd packages/api && npm run build`        |
| Prisma migrate      | `cd packages/api && npx prisma migrate dev` |
| Prisma seed         | `cd packages/api && npm run seed`         |
| Flutter run         | `cd apps/mobile && flutter run`           |
| Flutter build apk   | `cd apps/mobile && flutter build apk`     |

## Repositorio Git

Si aún no tienes Git inicializado ni repo remoto: [Instrucciones en docs/GIT.md](docs/GIT.md).

## Documentación

- [Probar en local](docs/LOCAL.md) – pasos para ver y probar todo en tu máquina
- [PRD](docs/PRD.md)
- [API](docs/API.md)
- [DB](docs/DB.md)
- [Pagos](docs/PAYMENTS.md)
- [Despliegue (ver en la nube)](docs/DEPLOY.md)
