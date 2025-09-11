#!/bin/bash

# ============================================
# Script de Despliegue Automático para Ubuntu
# Sistema: AmbuReview
# Compatibilidad: Ubuntu 20.04 LTS, 22.04 LTS, 24.04 LTS
# ============================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }

# Verificar que se ejecuta con privilegios
check_root() {
    if [[ $EUID -ne 0 ]]; then
        if ! sudo -n true 2>/dev/null; then
            print_error "Este script requiere privilegios de sudo"
            echo "Por favor, ejecuta: sudo $0"
            exit 1
        fi
        SUDO="sudo"
    else
        SUDO=""
    fi
}

# Detectar la versión de Ubuntu
detect_ubuntu_version() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        print_info "Sistema detectado: $OS $VER"
        
        if [[ "$OS" != "Ubuntu" ]]; then
            print_warning "Este script está optimizado para Ubuntu. Puede funcionar en otras distribuciones basadas en Debian."
            read -p "¿Deseas continuar? (s/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                exit 1
            fi
        fi
    else
        print_error "No se puede detectar el sistema operativo"
        exit 1
    fi
}

# Actualizar el sistema
update_system() {
    print_header "Actualizando el Sistema"
    
    $SUDO apt update
    $SUDO apt upgrade -y
    $SUDO apt install -y \
        curl \
        wget \
        git \
        nano \
        vim \
        htop \
        net-tools \
        ca-certificates \
        gnupg \
        lsb-release \
        software-properties-common
    
    print_success "Sistema actualizado"
}

# Instalar Docker
install_docker() {
    print_header "Instalando Docker"
    
    # Verificar si Docker ya está instalado
    if command -v docker &> /dev/null; then
        print_warning "Docker ya está instalado"
        docker --version
        read -p "¿Deseas reinstalar Docker? (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            return
        fi
        
        # Desinstalar versión anterior
        $SUDO apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    fi
    
    # Instalar Docker
    print_info "Instalando Docker Engine..."
    
    # Agregar repositorio de Docker
    $SUDO mkdir -m 0755 -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    $SUDO apt update
    $SUDO apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Configurar Docker
    $SUDO systemctl enable docker
    $SUDO systemctl start docker
    
    # Agregar usuario al grupo docker
    if [ "$SUDO" != "" ]; then
        $SUDO usermod -aG docker $USER
        print_warning "Usuario agregado al grupo docker. Necesitarás cerrar sesión y volver a entrar para aplicar los cambios."
    fi
    
    # Verificar instalación
    $SUDO docker --version
    $SUDO docker compose version
    
    print_success "Docker instalado correctamente"
}

# Configurar firewall
configure_firewall() {
    print_header "Configurando Firewall"
    
    # Instalar ufw si no está instalado
    $SUDO apt install -y ufw
    
    # Configurar reglas
    $SUDO ufw default deny incoming
    $SUDO ufw default allow outgoing
    
    # SSH
    $SUDO ufw allow 22/tcp
    
    # HTTP y HTTPS
    $SUDO ufw allow 80/tcp
    $SUDO ufw allow 443/tcp
    
    # Puertos de la aplicación
    read -p "¿Deseas abrir los puertos 3000 y 3001 directamente? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        $SUDO ufw allow 3000/tcp
        $SUDO ufw allow 3001/tcp
        $SUDO ufw allow 8025/tcp  # MailHog
    fi
    
    # Habilitar firewall
    print_warning "Se va a habilitar el firewall. Asegúrate de que el puerto SSH esté abierto."
    read -p "¿Continuar? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        $SUDO ufw --force enable
        $SUDO ufw status verbose
        print_success "Firewall configurado"
    else
        print_warning "Firewall no habilitado"
    fi
}

# Clonar repositorio
clone_repository() {
    print_header "Clonando Repositorio"
    
    INSTALL_DIR="/opt/revision_ambulancia1"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "El directorio $INSTALL_DIR ya existe"
        read -p "¿Deseas eliminarlo y clonar de nuevo? (s/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            $SUDO rm -rf $INSTALL_DIR
        else
            cd $INSTALL_DIR
            git pull origin main
            print_success "Repositorio actualizado"
            return
        fi
    fi
    
    # Clonar
    $SUDO git clone https://github.com/planetazuzu/revision_ambulancia1.git $INSTALL_DIR
    
    # Cambiar permisos
    $SUDO chown -R $USER:$USER $INSTALL_DIR
    
    cd $INSTALL_DIR
    print_success "Repositorio clonado en $INSTALL_DIR"
}

# Configurar variables de entorno
configure_environment() {
    print_header "Configurando Variables de Entorno"
    
    cd /opt/revision_ambulancia1
    
    if [ -f .env ]; then
        print_warning "El archivo .env ya existe"
        read -p "¿Deseas reconfigurarlo? (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            return
        fi
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        print_info "Backup creado del .env anterior"
    fi
    
    # Copiar desde ejemplo
    cp env.example .env
    
    # Generar JWT_SECRET aleatorio
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Solicitar configuración básica
    echo ""
    print_info "Configuración básica (presiona Enter para usar valores por defecto)"
    echo ""
    
    read -p "Dominio o IP del servidor [localhost]: " DOMAIN
    DOMAIN=${DOMAIN:-localhost}
    
    read -p "Puerto del frontend [3000]: " FRONTEND_PORT
    FRONTEND_PORT=${FRONTEND_PORT:-3000}
    
    read -p "Puerto del backend [3001]: " BACKEND_PORT
    BACKEND_PORT=${BACKEND_PORT:-3001}
    
    read -p "¿Configurar email SMTP? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Host SMTP [smtp.gmail.com]: " EMAIL_HOST
        EMAIL_HOST=${EMAIL_HOST:-smtp.gmail.com}
        
        read -p "Puerto SMTP [587]: " EMAIL_PORT
        EMAIL_PORT=${EMAIL_PORT:-587}
        
        read -p "Usuario email: " EMAIL_USER
        read -s -p "Contraseña email: " EMAIL_PASSWORD
        echo
    else
        EMAIL_HOST="smtp.gmail.com"
        EMAIL_PORT="587"
        EMAIL_USER="noreply@ambureview.com"
        EMAIL_PASSWORD="password"
    fi
    
    # Actualizar .env
    cat > .env << EOF
# Base de Datos
DATABASE_URL="postgresql://app:app@db:5432/appdb?schema=public"

# JWT
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRATION_TIME="1h"

# Email
EMAIL_HOST="$EMAIL_HOST"
EMAIL_PORT=$EMAIL_PORT
EMAIL_USER="$EMAIL_USER"
EMAIL_PASSWORD="$EMAIL_PASSWORD"
EMAIL_FROM="$EMAIL_USER"

# Frontend
NEXT_PUBLIC_API_URL="http://$DOMAIN:$BACKEND_PORT"
NEXT_PUBLIC_MOCK_MODE="false"

# Configuración
NODE_ENV="production"
PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT

# Redis
REDIS_URL="redis://redis:6379"
EOF
    
    print_success "Variables de entorno configuradas"
}

# Instalar Nginx
install_nginx() {
    print_header "Instalando Nginx (Opcional)"
    
    read -p "¿Deseas instalar Nginx como proxy reverso? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        return
    fi
    
    $SUDO apt install -y nginx
    
    read -p "Ingresa tu dominio (ej: ambureview.com): " DOMAIN
    
    # Crear configuración
    $SUDO tee /etc/nginx/sites-available/ambureview > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Habilitar sitio
    $SUDO ln -sf /etc/nginx/sites-available/ambureview /etc/nginx/sites-enabled/
    $SUDO rm -f /etc/nginx/sites-enabled/default
    
    # Verificar y reiniciar
    $SUDO nginx -t
    $SUDO systemctl restart nginx
    $SUDO systemctl enable nginx
    
    print_success "Nginx configurado"
    
    # Configurar SSL
    read -p "¿Deseas configurar SSL con Let's Encrypt? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        $SUDO apt install -y certbot python3-certbot-nginx
        $SUDO certbot --nginx -d $DOMAIN
        print_success "SSL configurado"
    fi
}

# Desplegar aplicación
deploy_application() {
    print_header "Desplegando Aplicación"
    
    cd /opt/revision_ambulancia1
    
    # Hacer ejecutable el script de despliegue
    chmod +x deploy-fix.sh
    
    print_info "Construyendo y desplegando contenedores..."
    
    # Limpiar contenedores antiguos
    $SUDO docker compose down --volumes --remove-orphans 2>/dev/null || true
    
    # Construir imágenes
    $SUDO docker compose build --no-cache
    
    # Iniciar servicios
    $SUDO docker compose up -d
    
    # Esperar a que los servicios estén listos
    print_info "Esperando a que los servicios estén listos..."
    sleep 15
    
    # Ejecutar migraciones
    print_info "Ejecutando migraciones de base de datos..."
    $SUDO docker compose exec -T backend npx prisma generate
    $SUDO docker compose exec -T backend npx prisma migrate deploy
    
    # Cargar datos de prueba
    read -p "¿Deseas cargar datos de prueba? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        $SUDO docker compose exec -T backend npx prisma db seed
        print_success "Datos de prueba cargados"
    fi
    
    # Verificar estado
    $SUDO docker compose ps
    
    print_success "Aplicación desplegada"
}

# Configurar backups automáticos
configure_backups() {
    print_header "Configurando Backups Automáticos"
    
    read -p "¿Deseas configurar backups automáticos de la base de datos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        return
    fi
    
    # Crear directorio de backups
    $SUDO mkdir -p /opt/backups/ambureview
    
    # Crear script de backup
    $SUDO tee /opt/backups/ambureview/backup.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/ambureview"
DATE=$(date +%Y%m%d_%H%M%S)
cd /opt/revision_ambulancia1
docker compose exec -T db pg_dump -U app appdb > $BACKUP_DIR/backup_$DATE.sql
# Mantener solo los últimos 30 backups
ls -t $BACKUP_DIR/backup_*.sql | tail -n +31 | xargs rm -f 2>/dev/null
EOF
    
    $SUDO chmod +x /opt/backups/ambureview/backup.sh
    
    # Agregar a crontab
    (crontab -l 2>/dev/null; echo "0 3 * * * /opt/backups/ambureview/backup.sh") | crontab -
    
    print_success "Backups automáticos configurados (diariamente a las 3 AM)"
}

# Mostrar información final
show_final_info() {
    print_header "🎉 ¡Instalación Completada!"
    
    echo -e "${GREEN}La aplicación AmbuReview ha sido instalada exitosamente${NC}"
    echo ""
    echo "📱 URLs de acceso:"
    echo "   - Frontend: http://$DOMAIN:3000"
    echo "   - Backend API: http://$DOMAIN:3001"
    echo "   - Documentación API: http://$DOMAIN:3001/api"
    echo "   - MailHog: http://$DOMAIN:8025"
    echo ""
    echo "👤 Cuentas de prueba (si cargaste los datos):"
    echo "   - Admin: admin@ambureview.com / 123456"
    echo "   - Coordinador: alicia@ambureview.com / 123456"
    echo "   - Usuario: carlos@ambureview.com / 123456"
    echo ""
    echo "📝 Comandos útiles:"
    echo "   - Ver logs: docker compose logs -f"
    echo "   - Ver estado: docker compose ps"
    echo "   - Reiniciar: docker compose restart"
    echo "   - Detener: docker compose down"
    echo ""
    echo "📂 Ubicación: /opt/revision_ambulancia1"
    echo ""
    
    if [ "$SUDO" != "" ]; then
        print_warning "Recuerda cerrar sesión y volver a entrar para aplicar los cambios del grupo docker"
    fi
}

# Función principal
main() {
    clear
    echo -e "${MAGENTA}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║            🚑 AmbuReview - Instalador                 ║"
    echo "║         Sistema de Revisión de Ambulancias           ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    # Verificaciones iniciales
    check_root
    detect_ubuntu_version
    
    # Preguntar modo de instalación
    echo "Selecciona el modo de instalación:"
    echo "1) Instalación completa (recomendado)"
    echo "2) Instalación personalizada"
    echo "3) Solo desplegar (Docker ya instalado)"
    read -p "Opción [1]: " INSTALL_MODE
    INSTALL_MODE=${INSTALL_MODE:-1}
    
    case $INSTALL_MODE in
        1)
            update_system
            install_docker
            configure_firewall
            clone_repository
            configure_environment
            deploy_application
            install_nginx
            configure_backups
            ;;
        2)
            read -p "¿Actualizar sistema? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && update_system
            
            read -p "¿Instalar Docker? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && install_docker
            
            read -p "¿Configurar firewall? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && configure_firewall
            
            read -p "¿Clonar repositorio? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && clone_repository
            
            read -p "¿Configurar variables de entorno? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && configure_environment
            
            read -p "¿Desplegar aplicación? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && deploy_application
            
            read -p "¿Instalar Nginx? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && install_nginx
            
            read -p "¿Configurar backups? (s/n): " -n 1 -r
            echo
            [[ $REPLY =~ ^[Ss]$ ]] && configure_backups
            ;;
        3)
            clone_repository
            configure_environment
            deploy_application
            ;;
        *)
            print_error "Opción no válida"
            exit 1
            ;;
    esac
    
    # Mostrar información final
    DOMAIN=${DOMAIN:-localhost}
    show_final_info
}

# Ejecutar función principal
main