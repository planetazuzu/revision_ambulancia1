#!/bin/bash

# 🚀 Script de Despliegue para AmbuReview - Puerto 9990
echo "🚀 Iniciando despliegue de AmbuReview en puerto 9990..."
echo "📅 $(date)"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
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

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Verificar que Docker esté instalado
print_header "Verificando prerrequisitos..."
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi
print_success "Docker está instalado: $(docker --version)"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está instalado."
    exit 1
fi
print_success "Docker Compose está disponible"

# Crear archivo .env si no existe
print_header "Configurando variables de entorno..."
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando desde env.port9990..."
    cp env.port9990 .env
    print_success "Archivo .env creado para puerto 9990"
else
    print_success "Archivo .env encontrado"
fi

# Crear directorios necesarios
print_status "Creando directorios necesarios..."
mkdir -p app/backend/uploads
mkdir -p ops/ssl
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p backups
print_success "Directorios creados"

# Parar contenedores existentes
print_header "Parando contenedores existentes..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.port9990.yml down
else
    docker compose -f docker-compose.port9990.yml down
fi

# Limpiar imágenes antiguas (opcional)
print_status "¿Deseas limpiar imágenes Docker antiguas? (y/N)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    print_status "Limpiar imágenes antiguas..."
    docker system prune -f
    print_success "Imágenes limpiadas"
fi

# Construir y levantar servicios
print_header "Construyendo y levantando servicios en puerto 9990..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.port9990.yml up --build -d
else
    docker compose -f docker-compose.port9990.yml up --build -d
fi

# Esperar a que los servicios estén listos
print_status "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
print_header "Verificando estado de los servicios..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.port9990.yml ps
else
    docker compose -f docker-compose.port9990.yml ps
fi

# Ejecutar migraciones de base de datos
print_header "Configurando base de datos..."
print_status "Ejecutando migraciones de base de datos..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.port9990.yml exec backend npm run db:deploy
else
    docker compose -f docker-compose.port9990.yml exec backend npm run db:deploy
fi

# Ejecutar seed de datos iniciales
print_status "Ejecutando seed de datos iniciales..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.port9990.yml exec backend npm run db:seed
else
    docker compose -f docker-compose.port9990.yml exec backend npm run db:seed
fi

# Verificar que los servicios estén funcionando
print_header "Verificando que los servicios estén funcionando..."

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
check_service "http://localhost:9990/health" "Backend (Puerto 9990)"
check_service "http://localhost:3000" "Frontend"

# Mostrar información de acceso
echo ""
print_success "🎉 ¡Despliegue en puerto 9990 completado!"
echo ""
print_header "📋 Información de acceso:"
echo -e "  🌐 ${CYAN}Frontend:${NC} http://localhost:3000"
echo -e "  🔧 ${CYAN}Backend API:${NC} http://localhost:9990"
echo -e "  📚 ${CYAN}API Docs:${NC} http://localhost:9990/api"
echo -e "  📧 ${CYAN}MailHog:${NC} http://localhost:8025"
echo -e "  🗄️  ${CYAN}Base de datos:${NC} localhost:5432"
echo ""
print_header "👤 Usuarios de prueba:"
echo -e "  📧 ${GREEN}admin@ambureview.com${NC} / ${YELLOW}admin123${NC}"
echo -e "  📧 ${GREEN}coordinador@ambureview.com${NC} / ${YELLOW}coord123${NC}"
echo -e "  📧 ${GREEN}usuario@ambureview.com${NC} / ${YELLOW}user123${NC}"
echo ""
print_header "🔧 Comandos útiles:"
echo -e "  ${BLUE}Ver logs:${NC} docker compose -f docker-compose.port9990.yml logs -f [servicio]"
echo -e "  ${BLUE}Parar servicios:${NC} docker compose -f docker-compose.port9990.yml down"
echo -e "  ${BLUE}Reiniciar servicios:${NC} docker compose -f docker-compose.port9990.yml restart"
echo -e "  ${BLUE}Acceder a base de datos:${NC} docker compose -f docker-compose.port9990.yml exec db psql -U app -d appdb"
echo ""
print_success "¡Sistema AmbuReview listo en puerto 9990! 🚀"
