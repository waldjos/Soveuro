# Soveuro — Pagos (IAP implementado)

Pagos por suscripción con **In-App Purchases** (Apple / Google). La compra se valida siempre en el backend.

## Estado actual

- **Backend**: `POST /payments/verify` (JWT requerido). Verificación Apple (App Store Server API), Google (Play Developer API) o **modo stub** si no hay credenciales.
- **Flutter**: Pantalla Pagos con estado desde `/me.subscription`, listado de productos, botón “Suscribirme” (IAP) y “Restaurar compras”. Tras compra se envía receipt/purchaseToken al backend y se refresca `/me`.
- **Modelo**: Tabla `Subscription` con upsert por `userId`; `status` (ACTIVE, EXPIRED, CANCELLED, PENDING), `planId`, `expiresAt`, `externalRef`.

## Flujo

1. **Cliente (Flutter)**  
   - Usa `in_app_purchase`. Tras compra exitosa envía a `POST /payments/verify`: `provider`, `planId`, `productId` y `receipt` (Apple) o `purchaseToken` (Google).

2. **Backend (NestJS)**  
   - Valida con Apple o Google (o modo stub con `PAYMENTS_STUB=true`).  
   - Crea o actualiza `Subscription` por `userId` y devuelve el estado.

3. **UI**  
   - Estado de suscripción en Pantalla Pagos y en `/me` (perfil).

## Seguridad

- **Nunca confiar en el cliente**: toda compra se valida en el backend con Apple/Google (o stub en desarrollo).
- No guardar secretos en código: variables de entorno y `ConfigService`.

## Variables de entorno y verificación manual

Variables necesarias, modo stub y script de verificación manual con `curl` están en:

- **[packages/api/docs/PAYMENTS.md](../packages/api/docs/PAYMENTS.md)**

Resumen de variables:

| Variable | Uso |
|----------|-----|
| `PAYMENTS_STUB` | `true` = modo stub (ACTIVE 7 días). Sin credenciales reales usar `true`. |
| `APPLE_SHARED_SECRET`, `APPLE_BUNDLE_ID` | Apple (solo si `PAYMENTS_STUB=false`). |
| `GOOGLE_PACKAGE_NAME`, `GOOGLE_SERVICE_ACCOUNT_JSON` | Google (solo si `PAYMENTS_STUB=false`). |

## Comandos

- **Backend**: `cd packages/api && npm run start:dev`
- **App**: `cd apps/mobile && flutter run`
- **Swagger**: http://localhost:3000/docs
