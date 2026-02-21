# Desplegar Soveuro para visualizar el sistema

Para ver en la nube lo que creamos necesitas desplegar:
1. **Backend + base de datos** (API NestJS + Postgres)
2. **App web** (Flutter compilado para web, opcional)

**Opción rápida solo para ver la API:** despliega solo el backend en Railway; cuando esté en línea podrás abrir `https://tu-api.up.railway.app/docs` en el navegador y probar register, login, doctores y eventos desde Swagger.

Opciones gratuitas o con tier free: **Railway** (API + Postgres) y **Vercel** (app Flutter web).

---

## 1. Backend + Postgres en Railway

[Railway](https://railway.app) ofrece Postgres y despliegue de Node en un mismo proyecto (tier free limitado).

### Pasos

1. **Cuenta**: entra en [railway.app](https://railway.app) y regístrate (GitHub recomendado).

2. **Nuevo proyecto**  
   - "New Project" → "Deploy from GitHub repo" (conecta el repo donde está `soveuro`)  
   **O** "Empty Project" y luego subir el código manualmente o con CLI.

3. **Postgres**  
   - En el proyecto: "New" → "Database" → "PostgreSQL".  
   - Railway crea la base y te da una variable `DATABASE_URL`. Cópiala.

4. **Servicio API**  
   - "New" → "GitHub Repo" (o "Empty Service" y configurar después).  
   - Elige el repo y **Root Directory** pon: `packages/api` (o la ruta donde está el `package.json` del backend).  
   - En "Variables" agrega:
     - `DATABASE_URL` = la URL que te dio Postgres (ej. `postgresql://postgres:xxx@xxx.railway.app:5432/railway`)
     - `JWT_ACCESS_SECRET` = un string largo y aleatorio (ej. genera uno en [randomkeygen.com](https://randomkeygen.com))
     - `JWT_REFRESH_SECRET` = otro string largo y aleatorio
     - `JWT_ACCESS_EXPIRES_IN` = `15m`
     - `JWT_REFRESH_EXPIRES_IN` = `7d`
   - **Build command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`  
   - **Start command**: `npm run start:prod`  
   - **Root Directory**: debe ser la carpeta que contiene `package.json` y `prisma/` (ej. `packages/api` si el repo es el monorepo).

5. **Migraciones y seed**  
   - En Railway, en el servicio de la API, abre "Settings" → "Deploy" o la pestaña de consola.  
   - O en local, con la misma `DATABASE_URL` que usa Railway:
     ```bash
     cd packages/api
     set DATABASE_URL=postgresql://...  # la URL de Railway
     npx prisma migrate deploy
     npm run seed
     ```
   Así la base en Railway tendrá tablas y datos de prueba.

6. **URL de la API**  
   - En el servicio API, Railway asigna un dominio tipo `tu-api.up.railway.app`.  
   - Activa "Generate Domain" si no lo tiene. Esa será tu **API_BASE_URL** (ej. `https://tu-api.up.railway.app`).

7. **CORS (para la app web)**  
   - En Variables del servicio API añade:  
     `CORS_ORIGIN` = `https://tu-app.vercel.app`  
   (o la URL que tenga la app Flutter cuando la despliegues; si quieres permitir todo en desarrollo usa `*` solo para pruebas).

---

## 2. App Flutter (web) en Vercel

Así puedes **visualizar la app en el navegador** usando la API desplegada en Railway.

### Compilar Flutter para web

En tu máquina, con la URL del backend de Railway:

```bash
cd soveuro/apps/mobile
flutter pub get
flutter build web --dart-define=API_BASE_URL=https://TU-API.up.railway.app
```

Se genera la carpeta `build/web`. Esa carpeta es la que desplegarás.

### Desplegar en Vercel

1. Entra en [vercel.com](https://vercel.com) y conecta tu repo (o instala [Vercel CLI](https://vercel.com/cli)).
2. **Import Project** → elige el repo de Soveuro.
3. Configuración:
   - **Root Directory**: `apps/mobile`
   - **Build Command**:  
     `flutter pub get && flutter build web --dart-define=API_BASE_URL=https://TU-API.up.railway.app`  
     (sustituye por tu URL real de Railway.)
   - **Output Directory**: `build/web`
   - **Install Command**: si Vercel no tiene Flutter, en "Framework Preset" elige "Other" y asegúrate de tener Flutter instalado en el entorno (o usa un Docker/script que instale Flutter).

**Nota:** Vercel no incluye Flutter por defecto. Opciones:

- **Opción A – Build local + solo subir `build/web`**:  
  Ejecuta `flutter build web` en local (como arriba) y despliega solo la carpeta `build/web` como sitio estático (Vercel → "Import" → subir carpeta, o conecta un repo donde tengas solo los archivos de `build/web` en una rama).
- **Opción B – Netlify**:  
  Netlify permite configurar un comando de build; si tienes Flutter en CI (p. ej. GitHub Actions que ejecute `flutter build web` y suba `build/web`), puedes usar ese artefacto en Netlify.
- **Opción C – Firebase Hosting**:  
  `firebase init hosting` → directorio público `build/web`; después de `flutter build web`, `firebase deploy`.

Para **visualizar rápido** sin configurar CI: haz el build en local y despliega la carpeta `build/web` en Vercel (upload) o en Netlify (drag & drop de `build/web`).

---

## 3. Resumen rápido

| Qué              | Dónde   | Resultado                          |
|------------------|---------|------------------------------------|
| API + Postgres   | Railway | `https://tu-api.up.railway.app`    |
| App web (Flutter)| Vercel / Netlify / Firebase | URL tipo `https://soveuro.vercel.app` |

1. Despliega API en Railway y anota la URL.  
2. Ejecuta migraciones y seed contra la `DATABASE_URL` de Railway.  
3. `flutter build web --dart-define=API_BASE_URL=https://tu-api.up.railway.app`  
4. Sube `apps/mobile/build/web` a Vercel/Netlify/Firebase.  
5. En el backend, pon `CORS_ORIGIN` = URL de tu app web.  

Así puedes abrir la URL de la app en el navegador y ver el sistema (login, doctores, eventos, perfil) usando la API desplegada.
