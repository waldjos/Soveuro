# Ver la app en Vercel (diseño y funciones)

## Si ves "404: NOT_FOUND" en soveuro-xxx.vercel.app

Ese error aparece cuando Vercel está sirviendo la **raíz del repo** (o la carpeta `apps/mobile`) en lugar del **sitio ya compilado**. En el repo no hay un `index.html` listo para web; ese archivo se genera al ejecutar `flutter build web` y queda en `apps/mobile/build/web`.

**Solución:** desplegar siempre la carpeta **compilada** `apps/mobile/build/web`, no el repo ni `apps/mobile`:

1. En tu PC: `cd apps\mobile` → `flutter build web --dart-define=API_BASE_URL=https://tu-api...`
2. Luego: `cd build\web` → `vercel --prod` (o subir esa carpeta en vercel.com).

Si conectaste el proyecto de Vercel a GitHub con "Root Directory" = vacío o `apps/mobile`, **no** se puede usar así para Flutter (Vercel no compila Flutter). Tienes que desplegar desde `build/web` como en el paso anterior, o usar el GitHub Action que compila y despliega esa carpeta.

---

Para ver en el navegador cómo quedó el diseño y probar las funciones necesitas:

1. **API en línea** (Railway) para que login, doctores, eventos y perfil funcionen.
2. **App web en Vercel** (Flutter compilado para web).

---

## Paso 1: API en Railway (si aún no la tienes)

1. Entra en [railway.app](https://railway.app) y crea un proyecto.
2. Añade **PostgreSQL** (New → Database → PostgreSQL) y copia la `DATABASE_URL`.
3. Añade un **servicio** desde tu repo de GitHub: repo **waldjos/Soveuro**, **Root Directory** = `packages/api`.
4. En el servicio, **Variables**:
   - `DATABASE_URL` = (la de Postgres)
   - `JWT_ACCESS_SECRET` = un texto largo aleatorio
   - `JWT_REFRESH_SECRET` = otro texto largo aleatorio
   - `CORS_ORIGIN` = `*` (para pruebas; luego puedes poner la URL de Vercel)
5. **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
6. **Start Command**: `npm run start:prod`
7. En **Settings** del servicio, activa **Generate Domain**. Anota la URL (ej. `https://soveuro-api.up.railway.app`).
8. Una vez desplegado, ejecuta migraciones y seed contra esa base (desde tu PC con esa `DATABASE_URL` o desde la consola de Railway si está disponible).

Esa URL es tu **API_BASE_URL** para el siguiente paso.

---

## Paso 2: Compilar la app para web

En tu PC, en la raíz del repo (o donde tengas el proyecto):

```powershell
cd apps\mobile
flutter pub get
flutter build web --dart-define=API_BASE_URL=https://TU-URL-RAILWAY.app
```

Sustituye `https://TU-URL-RAILWAY.app` por la URL real del paso 1 (sin barra final).  
Se genera la carpeta `build\web`.

---

## Paso 3: Subir a Vercel

### Opción A: Vercel desde la carpeta compilada (recomendado)

1. Instala Vercel CLI (una vez): `npm i -g vercel`
2. Después de `flutter build web`, copia la config de Vercel y despliega:

```powershell
copy apps\mobile\vercel.json apps\mobile\build\web\vercel.json
cd apps\mobile\build\web
vercel --prod
```

3. Si te pide login, inicia sesión en el navegador. Cuando pida proyecto, crea uno nuevo (ej. `soveuro`).
4. Al terminar te dará una URL tipo `https://soveuro-xxx.vercel.app`. Ahí verás la app (diseño y funciones).

### Opción B: Vercel desde la web (arrastrar carpeta)

1. Entra en [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. En lugar de importar Git, usa **Upload** (o “Deploy” con drag & drop si está disponible).
3. Comprime la carpeta `apps\mobile\build\web` en un ZIP y súbela, o arrastra la carpeta si Vercel lo permite.
4. Vercel te dará una URL para ver la app.

---

## Resumen

| Paso | Acción |
|------|--------|
| 1 | API en Railway → anotar URL |
| 2 | `flutter build web --dart-define=API_BASE_URL=https://tu-api...` |
| 3 | `cd apps\mobile\build\web` → `vercel --prod` (o subir la carpeta en vercel.com) |

Con eso podrás abrir la URL de Vercel en el navegador, ver el diseño y probar registro, login, listado de doctores, eventos y perfil.

---

## Opción C: Despliegue automático (GitHub Actions)

En el repo hay un workflow (`.github/workflows/deploy-vercel.yml`) que, en cada push a `main`, compila Flutter web y despliega en Vercel.

**Qué necesitas:**

1. **Un despliegue manual primero** (Opción A), para tener un proyecto en Vercel y obtener los IDs.
2. En ese proyecto, en Vercel: **Settings** → **General** → anota **Project ID** y **Org ID** (o desde la URL de Vercel).
3. En GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Crea:
   - `API_BASE_URL` = URL de tu API (Railway), ej. `https://soveuro-api.up.railway.app`
   - `VERCEL_TOKEN` = token de Vercel (Account → Settings → Tokens → Create)
   - `VERCEL_ORG_ID` = el Org ID de Vercel
   - `VERCEL_PROJECT_ID` = el Project ID del proyecto Soveuro en Vercel

Después de eso, cada `git push` a `main` construirá la app y la desplegará en Vercel.
