# Pagos (IAP) – Verificación server-side

## Resumen

- **POST /payments/verify**: recibe `provider` (APPLE | GOOGLE), `planId`, `productId` y según proveedor `receipt` (Apple) o `purchaseToken` (Google). Requiere JWT.
- La compra **siempre** se valida en backend; el cliente solo envía el token/receipt.
- La suscripción se guarda/actualiza en `Subscription` por `userId` (upsert) con `status`, `planId`, `expiresAt`, `externalRef`.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `PAYMENTS_STUB` | `true`: modo stub (simula ACTIVE 7 días sin credenciales). `false` o no definido: verificación real. |
| `APPLE_SHARED_SECRET` | (Apple) Shared secret de App Store Connect. |
| `APPLE_BUNDLE_ID` | (Apple) Bundle ID de la app, ej. `com.soveuro.app`. |
| `GOOGLE_PACKAGE_NAME` | (Google) Package name de la app en Play Console. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | (Google) JSON completo del service account con Android Publisher API. |

## Modo stub

Con `PAYMENTS_STUB=true` (por defecto en `.env.example`):

- No se llama a Apple ni Google.
- Cualquier body válido (receipt o purchaseToken según provider) devuelve suscripción **ACTIVE** con expiración en 7 días.
- Sirve para desarrollo y tests sin credenciales reales.

## Verificación manual (script)

Con el servidor levantado y un JWT de acceso válido:

```bash
# Sustituir YOUR_ACCESS_TOKEN y opcionalmente el body
curl -X POST http://localhost:3000/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "provider": "APPLE",
    "planId": "premium_monthly",
    "receipt": "base64_receipt_data",
    "productId": "com.soveuro.premium_monthly"
  }'
```

Google:

```bash
curl -X POST http://localhost:3000/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "provider": "GOOGLE",
    "planId": "premium_monthly",
    "purchaseToken": "token_from_play_billing",
    "productId": "premium_monthly"
  }'
```

Respuesta esperada (ejemplo):

```json
{
  "subscription": {
    "provider": "APPLE",
    "status": "ACTIVE",
    "planId": "premium_monthly",
    "expiresAt": "2025-03-02T12:00:00.000Z",
    "externalRef": "1000000123456789"
  }
}
```

## Producción Apple

1. App Store Connect → tu app → App Information → **App-Specific Shared Secret**.
2. Configurar `APPLE_SHARED_SECRET` y `APPLE_BUNDLE_ID`.
3. En producción usar `PAYMENTS_STUB=false` (o no definir `PAYMENTS_STUB`).

## Producción Google

1. Google Cloud Console: crear service account con rol **Android Publisher**.
2. En Play Console → API access enlazar el service account.
3. Descargar clave JSON y poner el contenido en `GOOGLE_SERVICE_ACCOUNT_JSON` (una línea o escapado).
4. Configurar `GOOGLE_PACKAGE_NAME` (package de la app en Play).
5. `PAYMENTS_STUB=false` en producción.

## Estados de suscripción

- **ACTIVE**: vigente.
- **EXPIRED**: `expiresAt` pasada.
- **CANCELLED**: cancelada por usuario o sistema.
- **PENDING**: no confirmada o no reconocida.

## Comandos

- Backend: `npm run start:dev` (desde `packages/api`).
- Migraciones: `npm run prisma:migrate`.
- Swagger: `http://localhost:3000/docs`.
