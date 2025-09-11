# 📝 Instrucciones para Actualizar el Repositorio

## ✅ Cambios Listos para Commit

### 🔧 Archivos Modificados:
1. **`app/backend/Dockerfile`**
   - Cambiado `npm ci` por `npm install`
   - Corregido formato ENV

2. **`app/backend/package.json`**
   - Eliminada dependencia `@types/csv-parser`
   - Actualizada versión de `tsconfig-paths`

3. **`docker-compose.yml`**
   - Comentado servicio cron problemático

4. **`README.md`**
   - Agregada sección de despliegue rápido
   - Enlaces a nueva documentación

### ✨ Archivos Nuevos:
1. **`deploy-fix.sh`** - Script de despliegue con correcciones
2. **`ubuntu-deploy.sh`** - Instalador automático para Ubuntu
3. **`GUIA_DESPLIEGUE_UBUNTU.md`** - Guía completa para Ubuntu
4. **`CHANGELOG_FIXES.md`** - Registro de todas las correcciones
5. **`git-update.sh`** - Script para hacer commit/push

## 🚀 Pasos para Actualizar el Repositorio

### Opción 1: Usar el Script Automático
```bash
# En tu servidor o máquina local donde tienes el repositorio
cd /opt/revision_ambulancia1  # o donde tengas el repo

# Ejecutar el script de actualización
./git-update.sh
```

### Opción 2: Manualmente

```bash
# 1. Ir al directorio del repositorio
cd /opt/revision_ambulancia1

# 2. Verificar el estado
git status

# 3. Agregar los archivos modificados
git add app/backend/Dockerfile
git add app/backend/package.json
git add docker-compose.yml
git add README.md

# 4. Agregar los archivos nuevos
git add deploy-fix.sh
git add ubuntu-deploy.sh
git add GUIA_DESPLIEGUE_UBUNTU.md
git add CHANGELOG_FIXES.md

# 5. Hacer commit
git commit -m "🐛 Fix: Correcciones críticas de despliegue

- Corregido error npm ci por falta de package-lock.json
- Eliminada dependencia @types/csv-parser no existente
- Actualizada versión de tsconfig-paths
- Comentado servicio cron con imagen no accesible
- Corregidos warnings de formato ENV en Dockerfile
- Agregados scripts de instalación automatizada
- Agregada documentación completa para Ubuntu"

# 6. Push al repositorio
git push origin main  # o la rama que uses
```

## 📋 Verificación Post-Update

Después de actualizar el repositorio:

1. **Verifica en GitHub:**
   - Ve a https://github.com/planetazuzu/revision_ambulancia1
   - Revisa que todos los archivos estén actualizados

2. **En otros servidores:**
   ```bash
   # Actualizar el código
   git pull origin main
   
   # Reconstruir con las correcciones
   ./deploy-fix.sh
   ```

## 🎯 Resumen de Problemas Resueltos

✅ **Error "npm ci" en backend** - Ahora usa npm install
✅ **Dependencia no encontrada** - @types/csv-parser eliminada
✅ **Imagen cron no accesible** - Servicio comentado temporalmente
✅ **Warnings de Docker** - Formato ENV corregido
✅ **Falta documentación Ubuntu** - Guía completa agregada
✅ **Proceso manual complejo** - Scripts automáticos creados

## 📌 Notas Importantes

1. **Servicio Cron:** Está temporalmente deshabilitado. Considera:
   - Usar cron del host
   - Implementar con @nestjs/schedule
   - Buscar imagen alternativa

2. **package-lock.json:** Se genera durante el build, no es necesario en el repo

3. **Compatibilidad:** Probado en Ubuntu 20.04+ con Docker 24.0+

## 🆘 Si Hay Problemas

Si encuentras algún problema al hacer push:

1. **Permisos:** Verifica que tienes permisos en el repo
2. **Conflictos:** Si hay conflictos, haz pull primero:
   ```bash
   git pull origin main
   # Resolver conflictos si los hay
   git add .
   git commit -m "Merge conflicts resolved"
   git push origin main
   ```

3. **Credenciales:** Si pide credenciales:
   ```bash
   git config --global user.name "tu-usuario"
   git config --global user.email "tu-email@example.com"
   ```

---

¡Los cambios están listos para ser publicados! 🚀