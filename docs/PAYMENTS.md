# Soveuro — Arquitectura de pagos (MVP)

El MVP deja la sección de pagos como **placeholder** en la app y el estado de suscripción se obtiene de `GET /me` (campo `subscription`).

## Objetivo futuro
- **IAP**: Apple App Store y Google Play (compras in-app).
- **Opcional**: Stripe para pagos web o complementarios.

## Modelo ya existente
- Tabla **Subscription**: `userId`, `provider` (APPLE | GOOGLE | STRIPE), `status`, `planId`, `expiresAt`, `externalRef`.
- El cliente muestra el estado en la pantalla Pagos usando los datos de `/me`.

## Flujo previsto (sin implementar aún)

1. **Cliente (Flutter)**  
   - Usar paquetes oficiales: `in_app_purchase` (Flutter) para Apple/Google.  
   - Tras compra exitosa, enviar el token o recibo al backend.

2. **Backend (NestJS)**  
   - Endpoint tipo `POST /payments/verify` que reciba:  
     - `provider`: APPLE | GOOGLE  
     - `receipt` o `purchaseToken` (según plataforma)  
     - `planId`  
   - Validar el recibo con Apple/Google APIs (servidor a servidor).  
   - Crear o actualizar **Subscription** y devolver estado.

3. **Stripe (opcional)**  
   - Webhook para `checkout.session.completed` (o equivalente).  
   - Crear/actualizar **Subscription** con `provider: STRIPE` y `externalRef` = id de Stripe.

## Seguridad
- No confiar solo en el cliente: siempre validar compras en el backend con Apple/Google.  
- No guardar datos de tarjeta en nuestro servidor; Stripe/Apple/Google los manejan.  
- Guardar solo `externalRef`, `planId`, `expiresAt` y `status` en nuestra DB.

## Resumen
- **MVP**: UI de pagos + lectura de `subscription` desde `/me`.  
- **Siguiente paso**: Implementar verificación de recibos IAP en el backend y cliente con `in_app_purchase`.
