# 🚀 CI/CD Pipeline - AmbuReview Monorepo

## 📋 Resumen

Este documento describe el sistema de CI/CD implementado para el proyecto AmbuReview, que utiliza GitHub Actions para automatizar el desarrollo, testing y despliegue.

## 🔄 Flujo de CI/CD

### 1. **Desarrollo (Development)**
- **Trigger**: Push a `develop` o `feature/*`
- **Acciones**:
  - ✅ Análisis de código (linting)
  - ✅ Tests unitarios
  - ✅ Verificación de builds
  - ✅ Tests de Docker
  - ✅ Reportes de cobertura

### 2. **Integración Continua (CI)**
- **Trigger**: Push a `main` o Pull Request
- **Acciones**:
  - ✅ Detección de cambios en el monorepo
  - ✅ Tests paralelos (frontend/backend)
  - ✅ Build de imágenes Docker
  - ✅ Análisis de seguridad
  - ✅ Escaneo de vulnerabilidades

### 3. **Despliegue Continuo (CD)**
- **Trigger**: Push a `main` (solo en rama principal)
- **Acciones**:
  - ✅ Build de imágenes Docker
  - ✅ Push a GitHub Container Registry
  - ✅ Deploy automático al servidor
  - ✅ Notificaciones de estado

## 📁 Estructura de Workflows

```
.github/workflows/
├── ci-cd.yml          # Pipeline principal
├── dev.yml            # Desarrollo y testing
├── security.yml       # Seguridad y dependencias
└── codeql.yml         # Análisis de código
```

## 🔧 Configuración Requerida

### Variables de Entorno en GitHub

#### Para Deploy:
- `SERVER_HOST`: IP o dominio del servidor
- `SERVER_USER`: Usuario SSH del servidor
- `SERVER_SSH_KEY`: Clave privada SSH

#### Para Seguridad (Opcional):
- `SNYK_TOKEN`: Token de Snyk para análisis de vulnerabilidades

### Configuración del Servidor

El servidor debe tener:
- ✅ Docker y Docker Compose instalados
- ✅ Git configurado
- ✅ Usuario SSH con permisos
- ✅ Proyecto clonado en `/opt/ambureview`

## 🐳 Docker Registry

Las imágenes se almacenan en GitHub Container Registry:
- `ghcr.io/planetazuzu/revision_ambulancia1-frontend`
- `ghcr.io/planetazuzu/revision_ambulancia1-backend`

## 📊 Monitoreo y Notificaciones

### Estados de Build:
- ✅ **Success**: Deploy exitoso
- ❌ **Failure**: Error en el pipeline
- ⚠️ **Warning**: Advertencias no críticas

### Notificaciones:
- 📧 Email automático en fallos
- 🔔 Notificaciones en GitHub
- 📱 Integración con Slack/Discord (configurable)

## 🔒 Seguridad

### Análisis Automático:
- 🔍 **npm audit**: Vulnerabilidades en dependencias
- 🛡️ **Snyk**: Análisis avanzado de seguridad
- 🐳 **Trivy**: Escaneo de imágenes Docker
- 🔍 **CodeQL**: Análisis de código estático

### Actualizaciones Automáticas:
- 🔄 **Dependabot**: Actualizaciones semanales
- 📦 **Auto-merge**: PRs de dependencias menores
- 🛡️ **Security patches**: Parches de seguridad prioritarios

## 🚀 Comandos Útiles

### Desarrollo Local:
```bash
# Configurar entorno
./scripts/setup.sh

# Desarrollo
npm run dev

# Tests
npm run test

# Build
npm run build
```

### Docker:
```bash
# Build local
docker-compose build

# Desarrollo con Docker
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Métricas y Reportes

### Cobertura de Tests:
- 📊 Reportes automáticos en cada PR
- 📈 Tendencias de cobertura
- 🎯 Objetivo: >80% cobertura

### Performance:
- ⚡ Tiempo de build < 5 minutos
- 🚀 Deploy < 2 minutos
- 📊 Métricas de uptime

## 🔧 Troubleshooting

### Problemas Comunes:

1. **Build falla por dependencias**:
   ```bash
   npm ci --force
   ```

2. **Docker build falla**:
   ```bash
   docker system prune -f
   docker-compose build --no-cache
   ```

3. **Deploy falla**:
   - Verificar conectividad SSH
   - Revisar logs del servidor
   - Verificar variables de entorno

### Logs y Debugging:
- 📋 Logs de GitHub Actions en la pestaña "Actions"
- 🐳 Logs de Docker: `docker-compose logs`
- 📊 Métricas del servidor: `/opt/ambureview/logs/`

## 🔄 Actualizaciones

Para actualizar el pipeline:
1. Modificar archivos en `.github/workflows/`
2. Hacer commit y push
3. Los cambios se aplican automáticamente

## 📞 Soporte

Para problemas con el CI/CD:
- 📋 Crear issue en GitHub
- 📧 Contactar al equipo de DevOps
- 📚 Revisar documentación en `/docs/`
