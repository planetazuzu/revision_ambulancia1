#!/bin/bash

# 🚀 Script de Despliegue Automático - AmbuReview
# Este script automatiza el despliegue completo del sistema

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de AmbuReview..."
echo "=================================="

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

# Verificar si Docker está instalado
check_docker() {
    print_status "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi
    
    print_success "Docker y Docker Compose están instalados"
}

# Verificar si el archivo .env existe
check_env() {
    print_status "Verificando configuración..."
    if [ ! -f ".env" ]; then
        print_warning "Archivo .env no encontrado. Creando desde env.example..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "⚠️  IMPORTANTE: Configura las variables en .env antes de continuar"
            print_warning "   Especialmente: JWT_SECRET, DATABASE_URL, EMAIL_*"
            read -p "¿Has configurado el archivo .env? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_error "Por favor configura el archivo .env y ejecuta el script nuevamente"
                exit 1
            fi
        else
            print_error "No se encontró env.example. Por favor crea el archivo .env manualmente"
            exit 1
        fi
    fi
    print_success "Configuración verificada"
}

# Limpiar contenedores anteriores
cleanup() {
    print_status "Limpiando contenedores anteriores..."
    docker-compose down -v 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    print_success "Limpieza completada"
}

# Construir y ejecutar servicios
deploy_services() {
    print_status "Construyendo y ejecutando servicios..."
    docker-compose up -d --build
    
    print_success "Servicios iniciados"
}

# Esperar a que los servicios estén listos
wait_for_services() {
    print_status "Esperando a que los servicios estén listos..."
    
    # Esperar a que la base de datos esté lista
    print_status "Esperando base de datos..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T db pg_isready -U app -d appdb 2>/dev/null; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Timeout esperando la base de datos"
        exit 1
    fi
    
    print_success "Base de datos lista"
    
    # Esperar a que el backend esté listo
    print_status "Esperando backend..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:3001/api >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Backend no responde, pero continuando..."
    else
        print_success "Backend listo"
    fi
    
    # Esperar a que el frontend esté listo
    print_status "Esperando frontend..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:9002 >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Frontend no responde, pero continuando..."
    else
        print_success "Frontend listo"
    fi
}

# Verificar estado de los servicios
check_services() {
    print_status "Verificando estado de los servicios..."
    echo
    docker-compose ps
    echo
    
    # Verificar que todos los servicios estén ejecutándose
    if docker-compose ps | grep -q "Exit"; then
        print_warning "Algunos servicios no están ejecutándose correctamente"
        print_status "Logs de servicios con problemas:"
        docker-compose ps | grep "Exit" | awk '{print $1}' | xargs -I {} docker-compose logs {}
    else
        print_success "Todos los servicios están ejecutándose"
    fi
}

# Mostrar información de acceso
show_access_info() {
    echo
    echo "🎉 ¡Despliegue completado!"
    echo "=========================="
    echo
    echo "🌐 URLs de Acceso:"
    echo "   Frontend:     http://localhost:9002"
    echo "   Backend API:  http://localhost:3001"
    echo "   Swagger:      http://localhost:3001/api"
    echo "   MailHog:      http://localhost:8025"
    echo
    echo "👤 Cuentas de Prueba:"
    echo "   Admin:        admin@ambureview.com / 123456"
    echo "   Coordinador:  alicia@ambureview.com / 123456"
    echo "   Usuario:      amb001@ambureview.com / 123456"
    echo "   Usuario:      carlos@ambureview.com / 123456"
    echo
    echo "🔧 Comandos Útiles:"
    echo "   Ver logs:     docker-compose logs -f"
    echo "   Reiniciar:    docker-compose restart"
    echo "   Detener:      docker-compose down"
    echo "   Estado:       docker-compose ps"
    echo
}

# Función principal
main() {
    echo "🚀 AmbuReview - Despliegue Automático"
    echo "====================================="
    echo
    
    check_docker
    check_env
    cleanup
    deploy_services
    wait_for_services
    check_services
    show_access_info
    
    print_success "¡Despliegue completado exitosamente!"
}

# Ejecutar función principal
main "$@"
