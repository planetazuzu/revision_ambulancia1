#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    DESPLIEGUE SIMPLIFICADO AMBUREVIEW${NC}"
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

show_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    show_error "Docker no está instalado"
    echo "Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi
show_success "Docker está instalado"

show_info "Construyendo imagen simplificada..."
docker build -f Dockerfile.simple -t ambureview-simple .
if [ $? -ne 0 ]; then
    show_error "Error al construir la imagen"
    exit 1
fi
show_success "Imagen construida exitosamente"

show_info "Parando contenedores existentes..."
docker stop ambureview-simple 2>/dev/null || true
docker rm ambureview-simple 2>/dev/null || true
show_success "Contenedores anteriores eliminados"

show_info "Creando directorio de datos..."
mkdir -p data
show_success "Directorio de datos creado"

show_info "Ejecutando contenedor..."
docker run -d \
  --name ambureview-simple \
  -p 3001:3001 \
  -p 9990:9990 \
  -v "$(pwd)/data:/app/data" \
  ambureview-simple
show_success "Contenedor ejecutándose"

show_info "Esperando a que la aplicación esté lista..."
sleep 10

show_info "Verificando estado..."
docker ps | grep ambureview-simple

show_info "Probando conectividad..."
echo "Probando backend..."
if curl -f http://localhost:9990/health >/dev/null 2>&1; then
    show_success "Backend funcionando"
else
    show_error "Backend no responde"
fi

echo "Probando frontend..."
if curl -f http://localhost:3001 >/dev/null 2>&1; then
    show_success "Frontend funcionando"
else
    show_error "Frontend no responde"
fi

echo
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    DESPLIEGUE COMPLETADO${NC}"
echo -e "${BLUE}========================================${NC}"
echo
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:3001"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:9990"
echo -e "${GREEN}📊 Base de datos:${NC} SQLite en ./data/ambureview.db"
echo
echo -e "${YELLOW}Comandos útiles:${NC}"
echo -e "  Ver logs: ${BLUE}docker logs -f ambureview-simple${NC}"
echo -e "  Parar: ${BLUE}docker stop ambureview-simple${NC}"
echo -e "  Iniciar: ${BLUE}docker start ambureview-simple${NC}"
echo -e "  Eliminar: ${BLUE}docker rm -f ambureview-simple${NC}"
echo
