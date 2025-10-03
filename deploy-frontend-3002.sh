#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    DESPLIEGUE CON FRONTEND EN PUERTO 3002${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Función para mostrar info
show_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Función para mostrar success
show_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Función para mostrar error
show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_info "Parando servicios actuales..."
docker-compose down
show_success "Servicios parados"

show_info "Construyendo y levantando servicios con puerto 3002..."
docker-compose -f docker-compose.frontend-3002.yml up --build -d
show_success "Servicios iniciados"

show_info "Esperando a que los servicios estén listos..."
sleep 30

show_info "Verificando estado de los servicios..."
docker-compose -f docker-compose.frontend-3002.yml ps

show_info "Probando conectividad..."
echo "Probando backend en puerto 3001..."
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    show_success "Backend responde correctamente"
else
    show_error "Backend no responde"
fi

echo "Probando frontend en puerto 3002..."
if curl -f http://localhost:3002 >/dev/null 2>&1; then
    show_success "Frontend responde correctamente"
else
    show_error "Frontend no responde"
fi

echo
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    DESPLIEGUE COMPLETADO${NC}"
echo -e "${BLUE}========================================${NC}"
echo
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3002"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:3001"
echo -e "${GREEN}📚 API Docs:${NC} http://localhost:3001/api"
echo -e "${GREEN}📧 MailHog:${NC} http://localhost:8025"
echo -e "${GREEN}🗄️ Base de datos:${NC} localhost:5432"
echo
echo -e "${YELLOW}Comandos útiles:${NC}"
echo -e "  Ver logs: ${BLUE}docker-compose -f docker-compose.frontend-3002.yml logs -f${NC}"
echo -e "  Parar: ${BLUE}docker-compose -f docker-compose.frontend-3002.yml down${NC}"
echo -e "  Reiniciar: ${BLUE}docker-compose -f docker-compose.frontend-3002.yml restart${NC}"
echo
