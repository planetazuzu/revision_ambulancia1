#!/bin/bash

# 🚀 Script de Despliegue para AmbuReview
# Sistema de Gestión de Ambulancias - Despliegue Automático

echo "🚀 Iniciando despliegue de AmbuReview..."
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
    print_status "Instalando Docker..."
    
    # Detectar el sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        sudo usermod -aG docker $USER
        print_success "Docker instalado en Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_warning "Por favor instala Docker Desktop para macOS desde https://docker.com"
        exit 1
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        print_warning "Por favor instala Docker Desktop para Windows desde https://docker.com"
        exit 1
    else
        print_error "Sistema operativo no soportado: $OSTYPE"
        exit 1
    fi
else
    print_success "Docker está instalado: $(docker --version)"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está instalado."
    print_status "Instalando Docker Compose..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose instalado"
    else
        print_warning "Por favor instala Docker Compose manualmente"
        exit 1
    fi
else
    print_success "Docker Compose está disponible"
fi

# Crear archivo .env si no existe
print_header "Configurando variables de entorno..."
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando desde env.example..."
    cp env.example .env
    print_success "Archivo .env creado. Puedes editarlo si necesitas cambiar configuraciones."
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
    docker-compose down
else
    docker compose down
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
print_header "Construyendo y levantando servicios..."
if command -v docker-compose &> /dev/null; then
    docker-compose up --build -d
else
    docker compose up --build -d
fi

# Esperar a que los servicios estén listos
print_status "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
print_header "Verificando estado de los servicios..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

# Ejecutar migraciones de base de datos
print_header "Configurando base de datos..."
print_status "Ejecutando migraciones de base de datos..."
if command -v docker-compose &> /dev/null; then
    docker-compose exec backend npm run db:deploy
else
    docker compose exec backend npm run db:deploy
fi

# Ejecutar seed de datos iniciales
print_status "Ejecutando seed de datos iniciales..."
if command -v docker-compose &> /dev/null; then
    docker-compose exec backend npm run db:seed
else
    docker compose exec backend npm run db:seed
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
check_service "http://localhost:3001/health" "Backend"
check_service "http://localhost:3000" "Frontend"

# Verificar base de datos
print_status "Verificando base de datos..."
if command -v docker-compose &> /dev/null; then
    if docker-compose exec db pg_isready -U app -d appdb > /dev/null 2>&1; then
        print_success "Base de datos PostgreSQL está funcionando"
    else
        print_warning "Base de datos PostgreSQL no responde"
    fi
else
    if docker compose exec db pg_isready -U app -d appdb > /dev/null 2>&1; then
        print_success "Base de datos PostgreSQL está funcionando"
    else
        print_warning "Base de datos PostgreSQL no responde"
    fi
fi

# Mostrar información de acceso
echo ""
print_success "🎉 ¡Despliegue completado!"
echo ""
print_header "📋 Información de acceso:"
echo -e "  🌐 ${CYAN}Frontend:${NC} http://localhost:3000"
echo -e "  🔧 ${CYAN}Backend API:${NC} http://localhost:3001"
echo -e "  📚 ${CYAN}API Docs:${NC} http://localhost:3001/api"
echo -e "  📧 ${CYAN}MailHog:${NC} http://localhost:8025"
echo -e "  🗄️  ${CYAN}Base de datos:${NC} localhost:5432"
echo ""
print_header "👤 Usuarios de prueba:"
echo -e "  📧 ${GREEN}admin@ambureview.com${NC} / ${YELLOW}admin123${NC}"
echo -e "  📧 ${GREEN}coordinador@ambureview.com${NC} / ${YELLOW}coord123${NC}"
echo -e "  📧 ${GREEN}usuario@ambureview.com${NC} / ${YELLOW}user123${NC}"
echo ""
print_header "🔧 Comandos útiles:"
echo -e "  ${BLUE}Ver logs:${NC} docker-compose logs -f [servicio]"
echo -e "  ${BLUE}Parar servicios:${NC} docker-compose down"
echo -e "  ${BLUE}Reiniciar servicios:${NC} docker-compose restart"
echo -e "  ${BLUE}Acceder a base de datos:${NC} docker-compose exec db psql -U app -d appdb"
echo -e "  ${BLUE}Backup:${NC} docker-compose exec backup /backup.sh"
echo ""
print_header "📊 Estado de los servicios:"
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi
echo ""
print_success "¡Sistema AmbuReview listo para usar! 🚀"
echo ""
print_status "Para más información, consulta la documentación en docs/"