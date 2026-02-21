# Probar Soveuro en local

Pasos para tener todo corriendo en tu máquina y hacer pruebas.

---

## Requisitos

- **Docker Desktop** abierto y en ejecución
- **Node.js 20+** (para el backend)
- **Flutter** (para la app; opcional si solo quieres probar la API)

---

## 1. Base de datos

En una terminal, desde la carpeta **soveuro** (raíz del proyecto):

```powershell
cd soveuro\infra\docker
docker compose up -d
```

Comprueba que el contenedor está arriba:

```powershell
docker compose ps
```

---

## 2. Backend (API)

En la misma terminal (o una nueva), desde la raíz **soveuro**:

```powershell
cd soveuro\packages\api
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

Cuando veas algo como `Nest application successfully started`:

- **API:** http://localhost:3000  
- **Swagger (pruebas desde el navegador):** http://localhost:3000/docs  

En Swagger puedes probar:

- **POST /auth/register** – Crear usuario (email, password, fullName)
- **POST /auth/login** – Iniciar sesión
- **GET /doctors** – Listar doctores (público)
- **GET /events** – Listar eventos (público)
- **GET /me** – Tu perfil (necesitas pegar el `accessToken` en "Authorize")

**Usuarios del seed** (contraseña: `password123`):

- dr.garcia@soveuro.com  
- dr.martin@soveuro.com  
- admin@soveuro.com  

---

## 3. App Flutter (opcional)

Con el backend ya corriendo, en **otra terminal**:

```powershell
cd soveuro\apps\mobile
flutter pub get
flutter run
```

Elige el dispositivo (Chrome para web, o un emulador Android/iOS).

- **Android emulador:** la app ya usa `http://10.0.2.2:3000` (equivale a localhost del PC).
- **iOS simulador:** puede usar `localhost`. Si no conecta, en `lib/core/config/env.dart` cambia temporalmente el `defaultValue` a `http://localhost:3000`.
- **Chrome (web):** para que apunte al backend en local, compila con:
  ```powershell
  flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:3000
  ```

Desde la app puedes: registrarte, iniciar sesión, ver listado de doctores y detalle, eventos, perfil y cerrar sesión.

---

## Resumen rápido

| Paso | Comando (desde raíz soveuro) |
|------|------------------------------|
| 1. DB | `cd soveuro\infra\docker` → `docker compose up -d` |
| 2. Migrar + seed | `cd soveuro\packages\api` → `npx prisma migrate dev --name init` → `npm run seed` |
| 3. Backend | `npm run start:dev` |
| 4. Probar API | Abrir http://localhost:3000/docs |
| 5. App | En otra terminal: `cd soveuro\apps\mobile` → `flutter pub get` → `flutter run` |

Si algo falla (puerto ocupado, Docker no arranca, error de Prisma), dime en qué paso y el mensaje de error y lo vemos.
