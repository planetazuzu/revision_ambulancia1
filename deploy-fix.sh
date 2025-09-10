#!/bin/bash

# Script de despliegue con correcciones para AmbuReview
# Este script resuelve los problemas identificados durante el despliegue

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue corregido de AmbuReview..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "No se encuentra docker-compose.yml. Asegúrate de ejecutar este script desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# Verificar Docker Compose
if ! docker compose version &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor, instala Docker Compose primero."
        exit 1
    fi
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

print_success "Docker y Docker Compose detectados"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Archivo .env creado desde env.example"
        print_warning "Por favor, edita .env y configura las variables necesarias antes de continuar"
        echo ""
        echo "Variables importantes a configurar:"
        echo "  - JWT_SECRET (una clave secreta segura)"
        echo "  - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD (para notificaciones)"
        echo ""
        read -p "Presiona Enter cuando hayas configurado el archivo .env..."
    else
        print_error "No se encuentra env.example. Por favor, crea un archivo .env manualmente."
        exit 1
    fi
else
    print_success "Archivo .env encontrado"
fi

# Limpiar contenedores antiguos si existen
print_info "Limpiando contenedores antiguos..."
$COMPOSE_CMD down --volumes --remove-orphans 2>/dev/null || true

# Limpiar imágenes antiguas
print_info "Limpiando imágenes antiguas..."
docker system prune -f

# Construir las imágenes
print_info "Construyendo imágenes Docker..."
echo ""

# Construir backend
print_info "Construyendo backend..."
if $COMPOSE_CMD build backend --no-cache; then
    print_success "Backend construido exitosamente"
else
    print_error "Error al construir el backend"
    exit 1
fi

# Construir frontend
print_info "Construyendo frontend..."
if $COMPOSE_CMD build frontend --no-cache; then
    print_success "Frontend construido exitosamente"
else
    print_error "Error al construir el frontend"
    exit 1
fi

# Iniciar servicios base primero (DB y Redis)
print_info "Iniciando servicios base (PostgreSQL y Redis)..."
$COMPOSE_CMD up -d db redis

# Esperar a que PostgreSQL esté listo
print_info "Esperando a que PostgreSQL esté listo..."
for i in {1..30}; do
    if $COMPOSE_CMD exec -T db pg_isready -U app -d appdb &>/dev/null; then
        print_success "PostgreSQL está listo"
        break
    fi
    echo -n "."
    sleep 2
done

# Iniciar el backend
print_info "Iniciando backend..."
$COMPOSE_CMD up -d backend

# Esperar a que el backend esté listo
print_info "Esperando a que el backend esté listo..."
sleep 10

# Ejecutar migraciones de Prisma
print_info "Ejecutando migraciones de base de datos..."
if $COMPOSE_CMD exec -T backend npx prisma migrate deploy; then
    print_success "Migraciones ejecutadas exitosamente"
else
    print_warning "Error al ejecutar migraciones, intentando generar cliente Prisma..."
    $COMPOSE_CMD exec -T backend npx prisma generate
    $COMPOSE_CMD exec -T backend npx prisma migrate deploy
fi

# Ejecutar seed si es necesario
read -p "¿Deseas cargar datos de prueba? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_info "Cargando datos de prueba..."
    if $COMPOSE_CMD exec -T backend npx prisma db seed; then
        print_success "Datos de prueba cargados"
    else
        print_warning "No se pudieron cargar los datos de prueba"
    fi
fi

# Iniciar todos los demás servicios
print_info "Iniciando todos los servicios..."
$COMPOSE_CMD up -d

# Verificar el estado de todos los servicios
print_info "Verificando estado de los servicios..."
echo ""
$COMPOSE_CMD ps

# Esperar un momento para que todos los servicios estén completamente iniciados
sleep 5

# Verificar que los servicios principales estén funcionando
echo ""
print_info "Verificando servicios..."

# Verificar backend
if curl -f http://localhost:3001/health &>/dev/null; then
    print_success "Backend respondiendo en http://localhost:3001"
else
    print_warning "Backend no responde aún, puede tardar unos segundos más"
fi

# Verificar frontend
if curl -f http://localhost:3000 &>/dev/null; then
    print_success "Frontend respondiendo en http://localhost:3000"
else
    print_warning "Frontend no responde aún, puede tardar unos segundos más"
fi

# Mostrar logs de los últimos errores si los hay
if [ "$1" == "--show-logs" ]; then
    print_info "Mostrando logs recientes..."
    $COMPOSE_CMD logs --tail=50
fi

echo ""
echo "=============================================="
print_success "¡Despliegue completado!"
echo "=============================================="
echo ""
echo "📱 URLs de acceso:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Documentación API: http://localhost:3001/api"
echo "   - MailHog (correos): http://localhost:8025"
echo ""
echo "👤 Cuentas de prueba (si cargaste los datos):"
echo "   - Admin: admin@ambureview.com / 123456"
echo "   - Coordinador: alicia@ambureview.com / 123456"
echo "   - Usuario: carlos@ambureview.com / 123456"
echo ""
echo "📝 Comandos útiles:"
echo "   - Ver logs: $COMPOSE_CMD logs -f"
echo "   - Ver logs de un servicio: $COMPOSE_CMD logs -f backend"
echo "   - Reiniciar servicios: $COMPOSE_CMD restart"
echo "   - Detener todo: $COMPOSE_CMD down"
echo "   - Ver estado: $COMPOSE_CMD ps"
echo ""
print_warning "Nota: El servicio de cron ha sido deshabilitado temporalmente debido a problemas con la imagen."
echo ""