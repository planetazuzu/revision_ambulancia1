# 🚀 Guía Completa de Despliegue en Ubuntu Server

## 📋 Requisitos Previos

- **Ubuntu Server 20.04 LTS o superior** (recomendado 22.04 LTS)
- **Mínimo 4GB RAM** (recomendado 8GB)
- **Mínimo 20GB de espacio en disco**
- **Acceso root o usuario con sudo**
- **Puertos abiertos**: 80, 443, 3000, 3001 (configurables)

---

## 📦 Paso 1: Actualizar el Sistema

```bash
# Actualizar repositorios y paquetes
sudo apt update && sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install -y curl wget git nano vim htop net-tools
```

---

## 🐳 Paso 2: Instalar Docker

```bash
# Eliminar versiones antiguas de Docker si existen
sudo apt remove docker docker-engine docker.io containerd runc 2>/dev/null

# Instalar dependencias
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Agregar clave GPG oficial de Docker
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configurar repositorio
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar repositorios
sudo apt update

# Instalar Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalación
sudo docker --version
sudo docker compose version

# Agregar usuario actual al grupo docker (opcional)
sudo usermod -aG docker $USER

# Aplicar cambios de grupo (requiere cerrar sesión y volver a entrar)
newgrp docker
```

---

## 🔧 Paso 3: Configurar Docker

```bash
# Habilitar Docker para iniciar con el sistema
sudo systemctl enable docker
sudo systemctl start docker

# Verificar que Docker esté funcionando
sudo docker run hello-world
```

---

## 📂 Paso 4: Clonar el Repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /opt
cd /opt

# Clonar el repositorio
sudo git clone https://github.com/planetazuzu/revision_ambulancia1.git
cd revision_ambulancia1

# Dar permisos al usuario actual
sudo chown -R $USER:$USER /opt/revision_ambulancia1
```

---

## 🔐 Paso 5: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar el archivo .env
nano .env
```

**Configuraciones importantes en .env:**

```env
# Base de Datos
DATABASE_URL="postgresql://app:app@db:5432/appdb?schema=public"

# JWT - IMPORTANTE: Cambia esta clave
JWT_SECRET="tu_clave_super_secreta_aqui_minimo_32_caracteres"
JWT_EXPIRATION_TIME="1h"

# Email (Configurar con tu servidor SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu_correo@gmail.com"
EMAIL_PASSWORD="tu_contraseña_de_aplicacion"
EMAIL_FROM="noreply@ambureview.com"

# Frontend
NEXT_PUBLIC_API_URL="http://tu-dominio.com:3001"
NEXT_PUBLIC_MOCK_MODE="false"

# Configuración de producción
NODE_ENV="production"
```

**Para Gmail:**
1. Habilita verificación en 2 pasos
2. Genera una contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Usa esa contraseña en EMAIL_PASSWORD

---

## 🚀 Paso 6: Desplegar la Aplicación

```bash
# Hacer ejecutable el script de despliegue
chmod +x deploy-fix.sh

# Ejecutar el script de despliegue
./deploy-fix.sh
```

**O manualmente:**

```bash
# Construir y ejecutar con Docker Compose
docker compose build --no-cache
docker compose up -d

# Ver logs
docker compose logs -f

# Verificar que todos los contenedores estén ejecutándose
docker compose ps
```

---

## 🌐 Paso 7: Configurar Firewall

```bash
# Instalar ufw si no está instalado
sudo apt install -y ufw

# Configurar reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (IMPORTANTE: no te bloquees)
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir puertos de la aplicación (opcional si usas Nginx)
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Habilitar firewall
sudo ufw enable

# Verificar estado
sudo ufw status verbose
```

---

## 🔒 Paso 8: Configurar Nginx como Proxy Reverso (Opcional pero Recomendado)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración para el sitio
sudo nano /etc/nginx/sites-available/ambureview
```

**Contenido del archivo:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    client_max_body_size 100M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/ambureview /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔐 Paso 9: Configurar SSL con Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Renovación automática (se configura automáticamente)
sudo systemctl status certbot.timer

# Probar renovación
sudo certbot renew --dry-run
```

---

## 📊 Paso 10: Monitoreo y Mantenimiento

### Ver logs en tiempo real:
```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f backend
docker compose logs -f frontend
```

### Comandos útiles:
```bash
# Reiniciar servicios
docker compose restart

# Detener todo
docker compose down

# Iniciar todo
docker compose up -d

# Ver uso de recursos
docker stats

# Limpiar recursos no utilizados
docker system prune -a
```

### Backup de base de datos:
```bash
# Crear backup
docker compose exec db pg_dump -U app appdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose exec -T db psql -U app appdb < backup_20240101_120000.sql
```

### Actualizar la aplicación:
```bash
cd /opt/revision_ambulancia1

# Obtener últimos cambios
git pull origin main

# Reconstruir y reiniciar
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 🎯 Paso 11: Verificación Final

### URLs de acceso:
- **Frontend**: http://tu-servidor:3000 (o http://tu-dominio.com si configuraste Nginx)
- **Backend API**: http://tu-servidor:3001/api
- **Documentación Swagger**: http://tu-servidor:3001/api
- **MailHog** (correos de prueba): http://tu-servidor:8025

### Cuentas de prueba (si cargaste datos de seed):
- **Admin**: admin@ambureview.com / 123456
- **Coordinador**: alicia@ambureview.com / 123456
- **Usuario**: carlos@ambureview.com / 123456

---

## 🚨 Solución de Problemas Comunes

### Error: "Cannot connect to Docker daemon"
```bash
sudo systemctl start docker
sudo systemctl status docker
```

### Error: "Port already in use"
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000
sudo lsof -i :3001

# Matar el proceso si es necesario
sudo kill -9 [PID]
```

### Error: "Permission denied"
```bash
# Dar permisos al directorio
sudo chown -R $USER:$USER /opt/revision_ambulancia1

# O ejecutar con sudo
sudo docker compose up -d
```

### Base de datos no se conecta:
```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps db

# Ver logs de la base de datos
docker compose logs db

# Reiniciar solo la base de datos
docker compose restart db
```

### Frontend no carga:
```bash
# Verificar logs del frontend
docker compose logs frontend

# Verificar que el backend esté respondiendo
curl http://localhost:3001/health

# Reiniciar frontend
docker compose restart frontend
```

---

## 🔄 Script de Instalación Automática

Para automatizar todo el proceso, crea este script:

```bash
nano install-ambureview.sh
```

Contenido:
```bash
#!/bin/bash

set -e

echo "🚀 Instalación automática de AmbuReview"
echo "========================================"

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Clonar repositorio
cd /opt
sudo git clone https://github.com/planetazuzu/revision_ambulancia1.git
cd revision_ambulancia1
sudo chown -R $USER:$USER /opt/revision_ambulancia1

# Configurar .env
cp env.example .env
echo "⚠️  Por favor, edita el archivo .env con tus configuraciones"
echo "Presiona Enter cuando hayas terminado..."
read

# Desplegar
chmod +x deploy-fix.sh
./deploy-fix.sh

echo "✅ Instalación completada!"
```

```bash
chmod +x install-ambureview.sh
./install-ambureview.sh
```

---

## 📝 Notas Finales

1. **Seguridad**: Siempre cambia las contraseñas por defecto y el JWT_SECRET
2. **Backups**: Configura backups automáticos de la base de datos
3. **Monitoreo**: Considera instalar herramientas como Prometheus/Grafana
4. **Logs**: Configura rotación de logs para evitar llenar el disco
5. **Actualizaciones**: Mantén el sistema y Docker actualizados

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker compose logs -f`
2. Verifica el estado: `docker compose ps`
3. Consulta la documentación en `/opt/revision_ambulancia1/README.md`
4. Revisa el repositorio: https://github.com/planetazuzu/revision_ambulancia1

¡Tu sistema AmbuReview está listo para producción! 🎉