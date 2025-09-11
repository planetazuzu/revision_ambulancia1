# 📋 Changelog - Correcciones de Despliegue

## 🔧 Cambios Realizados (2024-12-XX)

### 🐛 Bugs Corregidos

#### 1. **Backend - Dockerfile**
- **Problema**: El comando `npm ci` fallaba por falta de `package-lock.json`
- **Solución**: 
  - Cambiado `npm ci --only=production` por `npm install --omit=dev`
  - Actualizada etapa builder para usar `npm install` completo
  - Archivo: `app/backend/Dockerfile`

#### 2. **Backend - Dependencias**
- **Problema**: `@types/csv-parser@^1.3.0` no existe en npm registry
- **Solución**: 
  - Eliminada dependencia problemática del `package.json`
  - Archivo: `app/backend/package.json`

#### 3. **Backend - Versiones**
- **Problema**: `tsconfig-paths@^4.2.1` versión no encontrada
- **Solución**: 
  - Actualizada a versión `^4.2.0`
  - Archivo: `app/backend/package.json`

#### 4. **Docker Compose - Servicio Cron**
- **Problema**: Imagen `ghcr.io/aptible/supercronic` no accesible (denied)
- **Solución**: 
  - Comentado temporalmente el servicio cron
  - Archivo: `docker-compose.yml`

#### 5. **Docker - Warnings**
- **Problema**: Formato legacy de ENV en Dockerfile
- **Solución**: 
  - Cambiado `ENV NODE_ENV production` a `ENV NODE_ENV=production`
  - Cambiado `ENV PORT 3001` a `ENV PORT=3001`
  - Archivo: `app/backend/Dockerfile`

### ✨ Nuevas Características

#### 1. **Scripts de Despliegue**
- `deploy-fix.sh`: Script mejorado con todas las correcciones
- `ubuntu-deploy.sh`: Instalador automático interactivo para Ubuntu
- Ambos scripts incluyen:
  - Verificación de requisitos
  - Manejo de errores
  - Interfaz colorida
  - Configuración automática

#### 2. **Documentación**
- `GUIA_DESPLIEGUE_UBUNTU.md`: Guía completa paso a paso para Ubuntu
- `CHANGELOG_FIXES.md`: Este archivo con todos los cambios

### 📁 Archivos Modificados

```
app/backend/Dockerfile          # Corregido npm ci y formato ENV
app/backend/package.json        # Eliminadas dependencias problemáticas
docker-compose.yml              # Comentado servicio cron problemático
```

### 📁 Archivos Nuevos

```
deploy-fix.sh                   # Script de despliegue corregido
ubuntu-deploy.sh                # Instalador automático para Ubuntu
GUIA_DESPLIEGUE_UBUNTU.md      # Guía completa de instalación
CHANGELOG_FIXES.md              # Registro de cambios
```

### 🔄 Comandos de Actualización

Para aplicar estos cambios en un despliegue existente:

```bash
# Actualizar el código
git pull origin main

# Reconstruir contenedores
docker compose down
docker compose build --no-cache
docker compose up -d
```

### ⚠️ Notas Importantes

1. **Servicio Cron**: Temporalmente deshabilitado. Considerar alternativas:
   - Usar imagen oficial de Alpine con crond
   - Implementar cron jobs directamente en el host
   - Usar el scheduler interno de NestJS

2. **package-lock.json**: No incluido en el repositorio. Se genera durante el build de Docker.

3. **Compatibilidad**: Probado en:
   - Ubuntu 20.04 LTS
   - Ubuntu 22.04 LTS
   - Docker 24.0+
   - Docker Compose v2

### 🎯 Próximos Pasos Recomendados

1. Generar y commitear `package-lock.json` para ambos proyectos
2. Buscar alternativa para el servicio cron
3. Implementar CI/CD con GitHub Actions
4. Agregar tests automatizados

---

## Autor
- Correcciones realizadas el: 2024-12-XX
- Sistema: AmbuReview v1.0.0