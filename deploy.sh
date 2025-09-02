#!/bin/bash

# Script de despliegue para AmbuReview
echo "🚀 Iniciando despliegue de AmbuReview..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando desde env.example..."
    cp env.example .env
    print_success "Archivo .env creado. Puedes editarlo si necesitas cambiar configuraciones."
fi

# Crear directorios necesarios
print_status "Creando directorios necesarios..."
mkdir -p app/backend/uploads
mkdir -p ops/ssl

# Parar contenedores existentes
print_status "Parando contenedores existentes..."
docker-compose down

# Limpiar imágenes antiguas (opcional)
read -p "¿Deseas limpiar imágenes Docker antiguas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Limpiando imágenes antiguas..."
    docker system prune -f
fi

# Construir y levantar servicios
print_status "Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
print_status "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
print_status "Verificando estado de los servicios..."
docker-compose ps

# Ejecutar migraciones de base de datos
print_status "Ejecutando migraciones de base de datos..."
docker-compose exec backend npm run db:deploy

# Ejecutar seed de datos iniciales
print_status "Ejecutando seed de datos iniciales..."
docker-compose exec backend npm run db:seed

# Verificar que los servicios estén funcionando
print_status "Verificando que los servicios estén funcionando..."

# Verificar backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend está funcionando en http://localhost:3001"
else
    print_warning "Backend no responde en http://localhost:3001"
fi

# Verificar frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend está funcionando en http://localhost:3000"
else
    print_warning "Frontend no responde en http://localhost:3000"
fi

# Verificar base de datos
if docker-compose exec db pg_isready -U app -d appdb > /dev/null 2>&1; then
    print_success "Base de datos PostgreSQL está funcionando"
else
    print_warning "Base de datos PostgreSQL no responde"
fi

# Mostrar información de acceso
echo ""
print_success "🎉 ¡Despliegue completado!"
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
echo "  Ver logs: docker-compose logs -f [servicio]"
echo "  Parar servicios: docker-compose down"
echo "  Reiniciar servicios: docker-compose restart"
echo "  Acceder a base de datos: docker-compose exec db psql -U app -d appdb"
echo ""
print_status "¡Sistema listo para usar! 🚀"
