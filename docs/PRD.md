# Soveuro — Product Requirements Document (MVP)

## Objetivo
MVP funcional para publicar en Play Store y App Store.

## Funcionalidades MVP
- Usuarios con roles: PATIENT, DOCTOR, ADMIN
- Autenticación: register, login, refresh, me
- Listado de doctores + perfil doctor
- Listado de eventos/noticias
- Sección de pagos (placeholder), arquitectura lista para IAP (Apple/Google) y opcional Stripe
- Admin web: fuera del MVP

## Stack
- Mobile: Flutter + Riverpod + GoRouter + Dio + flutter_secure_storage
- Backend: NestJS + Prisma + PostgreSQL + JWT (access + refresh) + Swagger
- Infra: Docker Compose para Postgres

## Entregables
- Monorepo con apps/mobile, packages/api, infra/docker, docs
- API documentada en Swagger y docs/API.md
- App que corre en iOS/Android con flujo completo de auth y listados
