# Soveuro - Script para dejar todo listo (ejecutar con Docker Desktop iniciado)
# Uso: desde la raiz del repo soveuro: .\scripts\run-all.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot + "\.."

Write-Host "1. Levantando Postgres..." -ForegroundColor Cyan
Set-Location "$root\infra\docker"
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fallo Docker. ¿Está Docker Desktop en ejecucion?" -ForegroundColor Red
    exit 1
}

Write-Host "Esperando 5s a que Postgres arranque..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "2. Migraciones Prisma..." -ForegroundColor Cyan
Set-Location "$root\packages\api"
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "3. Seed (datos de prueba)..." -ForegroundColor Cyan
npm run seed
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "4. Backend en modo desarrollo (Ctrl+C para detener)..." -ForegroundColor Cyan
npm run start:dev
