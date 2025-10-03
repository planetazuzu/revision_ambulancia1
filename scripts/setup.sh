#!/bin/bash

# 🚀 Script de configuración para AmbuReview Monorepo
# Configura el entorno de desarrollo completo

set -e

echo "🚀 Configurando AmbuReview Monorepo..."
echo "========================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
print_status "Verificando prerrequisitos..."

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Por favor instala npm"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_warning "Docker no está instalado. Algunas funcionalidades no estarán disponibles"
fi

print_success "Prerrequisitos verificados"

# Instalar dependencias raíz
print_status "Instalando dependencias raíz..."
npm install
print_success "Dependencias raíz instaladas"

# Instalar dependencias del frontend
print_status "Instalando dependencias del frontend..."
cd src/frontend
npm install
print_success "Dependencias del frontend instaladas"

# Instalar dependencias del backend
print_status "Instalando dependencias del backend..."
cd ../backend
npm install
print_success "Dependencias del backend instaladas"

# Volver al directorio raíz
cd ../..

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    print_status "Creando archivo .env..."
    cp env.example .env
    print_warning "Archivo .env creado. Por favor configura las variables de entorno"
fi

# Crear directorios necesarios
print_status "Creando directorios necesarios..."
mkdir -p src/backend/uploads
mkdir -p ops/ssl
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p backups
print_success "Directorios creados"

# Configurar Git hooks (opcional)
if [ -d .git ]; then
    print_status "Configurando Git hooks..."
    # Aquí puedes agregar hooks personalizados
    print_success "Git hooks configurados"
fi

print_success "🎉 Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno en .env"
echo "2. Ejecuta 'npm run dev' para iniciar el desarrollo"
echo "3. Visita http://localhost:3000 para el frontend"
echo "4. Visita http://localhost:3001 para el backend"
echo ""
echo "🔧 Comandos útiles:"
echo "- npm run dev          # Iniciar desarrollo"
echo "- npm run build        # Construir para producción"
echo "- npm run test         # Ejecutar tests"
echo "- npm run db:migrate   # Ejecutar migraciones"
echo "- npm run db:studio    # Abrir Prisma Studio"
