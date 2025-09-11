#!/bin/bash

# ============================================
# Script para actualizar el repositorio con las correcciones
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

print_header "Actualización del Repositorio AmbuReview"

# Verificar que estamos en un repositorio git
if [ ! -d .git ]; then
    print_error "No estás en un repositorio git"
    print_info "Primero clona el repositorio:"
    echo "git clone https://github.com/planetazuzu/revision_ambulancia1.git"
    exit 1
fi

# Verificar el estado actual
print_info "Estado actual del repositorio:"
git status --short

# Preguntar si queremos ver los cambios
read -p "¿Deseas ver los cambios en detalle? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    git diff
fi

# Lista de archivos modificados y nuevos
print_header "Archivos a Actualizar"

echo "📝 Archivos Modificados:"
echo "  - app/backend/Dockerfile"
echo "  - app/backend/package.json"
echo "  - docker-compose.yml"
echo ""
echo "✨ Archivos Nuevos:"
echo "  - deploy-fix.sh"
echo "  - ubuntu-deploy.sh"
echo "  - GUIA_DESPLIEGUE_UBUNTU.md"
echo "  - CHANGELOG_FIXES.md"
echo "  - git-update.sh (este archivo)"
echo ""

# Confirmar antes de continuar
read -p "¿Deseas continuar con el commit? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_warning "Operación cancelada"
    exit 0
fi

# Agregar archivos al staging
print_info "Agregando archivos al staging..."

# Archivos modificados
git add app/backend/Dockerfile
git add app/backend/package.json
git add docker-compose.yml

# Archivos nuevos
git add deploy-fix.sh
git add ubuntu-deploy.sh
git add GUIA_DESPLIEGUE_UBUNTU.md
git add CHANGELOG_FIXES.md
git add git-update.sh

# Verificar lo que se va a commitear
print_info "Archivos en staging:"
git status --short

# Crear el commit
print_info "Creando commit..."

COMMIT_MESSAGE="🐛 Fix: Correcciones críticas de despliegue

## Problemas Resueltos:
- ✅ Corregido error npm ci por falta de package-lock.json
- ✅ Eliminada dependencia @types/csv-parser no existente
- ✅ Actualizada versión de tsconfig-paths
- ✅ Comentado servicio cron con imagen no accesible
- ✅ Corregidos warnings de formato ENV en Dockerfile

## Nuevas Características:
- ✨ Script de despliegue mejorado (deploy-fix.sh)
- ✨ Instalador automático para Ubuntu (ubuntu-deploy.sh)
- ✨ Guía completa de despliegue en Ubuntu
- ✨ Changelog con todas las correcciones

## Archivos Modificados:
- app/backend/Dockerfile
- app/backend/package.json
- docker-compose.yml

## Archivos Nuevos:
- deploy-fix.sh
- ubuntu-deploy.sh
- GUIA_DESPLIEGUE_UBUNTU.md
- CHANGELOG_FIXES.md

Estos cambios resuelven todos los problemas de despliegue reportados
y facilitan la instalación en servidores Ubuntu."

git commit -m "$COMMIT_MESSAGE"

print_success "Commit creado exitosamente"

# Preguntar si hacer push
print_warning "El siguiente paso es hacer push al repositorio remoto"
echo "Esto actualizará el repositorio en GitHub con todos los cambios"
read -p "¿Deseas hacer push ahora? (s/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Ss]$ ]]; then
    # Verificar la rama actual
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Rama actual: $CURRENT_BRANCH"
    
    # Preguntar a qué rama hacer push
    read -p "¿Hacer push a esta rama? (s/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Haciendo push a origin/$CURRENT_BRANCH..."
        git push origin $CURRENT_BRANCH
        print_success "Push completado exitosamente"
        
        echo ""
        print_success "¡Repositorio actualizado!"
        echo ""
        echo "📌 Próximos pasos:"
        echo "1. Verifica los cambios en: https://github.com/planetazuzu/revision_ambulancia1"
        echo "2. Si estás en una rama diferente a 'main', considera crear un Pull Request"
        echo "3. Notifica al equipo sobre las correcciones realizadas"
    else
        print_info "Puedes hacer push manualmente con:"
        echo "git push origin $CURRENT_BRANCH"
    fi
else
    print_info "Puedes hacer push más tarde con:"
    echo "git push origin $(git branch --show-current)"
fi

echo ""
print_header "Resumen de Cambios"
echo "Los siguientes problemas han sido resueltos:"
echo "✅ Error de npm ci en el backend"
echo "✅ Dependencias no existentes"
echo "✅ Imagen de cron no accesible"
echo "✅ Warnings de Docker"
echo ""
echo "Se han agregado:"
echo "✨ Scripts de instalación automatizada"
echo "✨ Documentación completa para Ubuntu"
echo "✨ Registro de cambios"
echo ""
print_success "¡Proceso completado!"