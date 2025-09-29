#!/bin/bash

# 🚀 Script de Despliegue para Desarrollo - AmbuReview
echo "🚀 Iniciando despliegue de desarrollo de AmbuReview..."
echo "📅 $(date)"
echo "================================================"

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

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está instalado."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando desde env.example..."
    cp env.example .env
    print_success "Archivo .env creado"
fi

# Crear directorios necesarios
print_status "Creando directorios necesarios..."
mkdir -p app/backend/uploads
mkdir -p ops/ssl
print_success "Directorios creados"

# Parar contenedores existentes
print_status "Parando contenedores existentes..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml down
else
    docker compose -f docker-compose.dev.yml down
fi

# Construir y levantar servicios
print_status "Construyendo y levantando servicios de desarrollo..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml up --build -d
else
    docker compose -f docker-compose.dev.yml up --build -d
fi

# Esperar a que los servicios estén listos
print_status "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
print_status "Verificando estado de los servicios..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml ps
else
    docker compose -f docker-compose.dev.yml ps
fi

# Ejecutar migraciones de base de datos
print_status "Configurando base de datos..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.dev.yml exec backend npm run db:deploy
    docker-compose -f docker-compose.dev.yml exec backend npm run db:seed
else
    docker compose -f docker-compose.dev.yml exec backend npm run db:deploy
    docker compose -f docker-compose.dev.yml exec backend npm run db:seed
fi

# Verificar que los servicios estén funcionando
print_status "Verificando servicios..."

# Función para verificar servicio
check_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_success "$name está funcionando en $url"
            return 0
        fi
        print_status "Esperando $name... (intento $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    print_warning "$name no responde en $url después de $max_attempts intentos"
    return 1
}

# Verificar servicios
check_service "http://localhost:3001/health" "Backend"
check_service "http://localhost:3000" "Frontend"

# Mostrar información de acceso
echo ""
print_success "🎉 ¡Despliegue de desarrollo completado!"
echo ""
echo "📋 Información de acceso:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔧 Backend API: http://localhost:3001"
echo "  📚 API Docs: http://localhost:3001/api"
echo "  📧 MailHog: http://localhost:8025"
echo "  🗄️  Base de datos: localhost:5432"
echo ""
echo "👤 Usuarios de prueba:"
echo "  📧 admin@ambureview.com / admin123"
echo "  📧 coordinador@ambureview.com / coord123"
echo "  📧 usuario@ambureview.com / user123"
echo ""
echo "🔧 Comandos útiles:"
echo "  Ver logs: docker-compose -f docker-compose.dev.yml logs -f [servicio]"
echo "  Parar servicios: docker-compose -f docker-compose.dev.yml down"
echo "  Reiniciar servicios: docker-compose -f docker-compose.dev.yml restart"
echo ""
print_success "¡Sistema de desarrollo listo! 🚀"
