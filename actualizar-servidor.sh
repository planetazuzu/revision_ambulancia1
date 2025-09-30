#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    ACTUALIZACION SERVIDOR AMBUREVIEW${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Función para mostrar headers
show_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Función para mostrar info
show_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Función para mostrar success
show_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Función para mostrar warning
show_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para mostrar error
show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_header "Verificando directorio de trabajo..."
if [ ! -d "revision_ambulancia1" ]; then
    show_info "Clonando repositorio..."
    git clone https://github.com/planetazuzu/revision_ambulancia1.git
    cd revision_ambulancia1
else
    show_info "Actualizando repositorio existente..."
    cd revision_ambulancia1
    git pull origin main
fi

show_header "Verificando archivos de configuración..."
if [ ! -f "docker-compose.port9990-3001.yml" ]; then
    show_error "Archivo docker-compose.port9990-3001.yml no encontrado"
    show_info "Verificando archivos disponibles..."
    ls -la docker-compose*.yml
    exit 1
fi

if [ ! -f "env.port9990-3001" ]; then
    show_error "Archivo env.port9990-3001 no encontrado"
    show_info "Verificando archivos de entorno disponibles..."
    ls -la env*
    exit 1
fi

show_success "Archivos de configuración encontrados"

show_header "Parando servicios existentes..."
docker compose down 2>/dev/null || true
docker compose -f docker-compose.port9990-3001.yml down 2>/dev/null || true
show_success "Servicios parados"

show_header "Limpiando contenedores e imágenes antiguas..."
docker container prune -f
docker image prune -f
show_success "Limpieza completada"

show_header "Configurando variables de entorno..."
cp env.port9990-3001 .env
show_success "Variables de entorno configuradas"

show_header "Construyendo y levantando servicios..."
docker compose -f docker-compose.port9990-3001.yml up --build -d

show_header "Esperando a que los servicios estén listos..."
sleep 30

show_header "Verificando estado de los servicios..."
docker compose -f docker-compose.port9990-3001.yml ps

show_header "Verificando logs del backend..."
echo -e "${YELLOW}=== LOGS BACKEND ===${NC}"
docker compose -f docker-compose.port9990-3001.yml logs backend | tail -20

show_header "Verificando logs de la base de datos..."
echo -e "${YELLOW}=== LOGS BASE DE DATOS ===${NC}"
docker compose -f docker-compose.port9990-3001.yml logs db | tail -20

show_header "Probando conectividad..."
show_info "Probando backend en puerto 9990..."
if curl -f http://localhost:9990/health >/dev/null 2>&1; then
    show_success "Backend responde correctamente"
else
    show_warning "Backend no responde - revisando logs..."
    docker compose -f docker-compose.port9990-3001.yml logs backend | tail -10
fi

show_info "Probando frontend en puerto 3001..."
if curl -f http://localhost:3001 >/dev/null 2>&1; then
    show_success "Frontend responde correctamente"
else
    show_warning "Frontend no responde - revisando logs..."
    docker compose -f docker-compose.port9990-3001.yml logs frontend | tail -10
fi

show_header "Información de acceso:"
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3001"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:9990"
echo -e "${GREEN}📚 API Docs:${NC} http://localhost:9990/api"
echo -e "${GREEN}📧 MailHog:${NC} http://localhost:8025"
echo -e "${GREEN}🗄️ Base de datos:${NC} localhost:5432"

show_header "Comandos útiles:"
echo -e "${YELLOW}Ver logs:${NC} docker compose -f docker-compose.port9990-3001.yml logs -f [servicio]"
echo -e "${YELLOW}Parar servicios:${NC} docker compose -f docker-compose.port9990-3001.yml down"
echo -e "${YELLOW}Reiniciar servicios:${NC} docker compose -f docker-compose.port9990-3001.yml restart"
echo -e "${YELLOW}Acceder a base de datos:${NC} docker compose -f docker-compose.port9990-3001.yml exec db psql -U app -d appdb"

show_success "¡Actualización completada! 🚀"
