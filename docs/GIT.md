# Repositorio Git de Soveuro

Repositorio en GitHub: **https://github.com/waldjos/Soveuro**

---

## Subir el proyecto completo a GitHub

Si ya creaste el repo en GitHub (por ejemplo con "first commit") y quieres subir **todo** el código del proyecto, abre PowerShell en la carpeta **soveuro** y ejecuta estos comandos en orden:

```powershell
cd C:\Users\Usuario\OneDrive\Desktop\Soveuro\soveuro

git remote add origin https://github.com/waldjos/Soveuro.git
git branch -M main
git add .
git status
git commit -m "Soveuro MVP: NestJS + Flutter + Prisma (backend, app, docs)"
git push -u origin main --force
```

- **`--force`** solo hace falta si en GitHub ya había un "first commit" (por ejemplo solo README). Con `--force` el historial de GitHub pasa a ser el de tu carpeta local (todo el proyecto).
- Si es la primera vez que subes y el repo está vacío, puedes usar `git push -u origin main` **sin** `--force`.

---

## Si el remote ya existe

Si ya habías hecho `git remote add origin` antes:

```powershell
git remote set-url origin https://github.com/waldjos/Soveuro.git
git add .
git commit -m "Soveuro MVP: NestJS + Flutter + Prisma"
git push -u origin main --force
```

---

## A partir de aquí

Para seguir trabajando:

```powershell
git add .
git commit -m "Descripción del cambio"
git push
```
