# 🚀 Despliegue en Servidor - AmbuReview

## 📋 **Opciones de Despliegue**

### **1. 🐳 Despliegue con Docker (Recomendado)**

#### **Requisitos del Servidor:**
- **OS:** Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **RAM:** Mínimo 4GB, Recomendado 8GB
- **CPU:** Mínimo 2 cores, Recomendado 4 cores
- **Almacenamiento:** Mínimo 20GB, Recomendado 50GB SSD
- **Docker:** 20.10+
- **Docker Compose:** 2.0+

#### **Pasos de Despliegue:**

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor.com

# 2. Instalar Docker (si no está instalado)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clonar el repositorio
git clone https://github.com/planetazuzu/revision_ambulancia1.git
cd revision_ambulancia1

# 5. Configurar variables de entorno
cp env.example .env
nano .env  # Editar con tus configuraciones

# 6. Ejecutar el script de despliegue
chmod +x deploy.sh
./deploy.sh
```

#### **Variables de Entorno Importantes:**
```env
# Base de Datos
DATABASE_URL="postgresql://app:app@db:5432/appdb?schema=public"

# JWT (¡CAMBIAR EN PRODUCCIÓN!)
JWT_SECRET="tu_clave_secreta_muy_segura_aqui"
JWT_EXPIRATION_TIME="1h"

# Email (para notificaciones)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu_email@gmail.com"
EMAIL_PASSWORD="tu_contraseña_app"

# Frontend
NEXT_PUBLIC_API_URL="http://tu-servidor.com:3001"
NEXT_PUBLIC_MOCK_MODE="false"

# Producción
NODE_ENV=production
```

---

### **2. 🌐 Despliegue con Nginx + SSL**

#### **Configurar Nginx:**
```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx

# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/ambureview
```

**Configuración Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **Activar el sitio:**
```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/ambureview /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### **Configurar SSL con Let's Encrypt:**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

---

### **3. ☁️ Despliegue en Servicios Cloud**

#### **A. DigitalOcean Droplet:**
```bash
# 1. Crear Droplet (Ubuntu 22.04, 4GB RAM, 2 CPU)
# 2. Conectar por SSH
ssh root@tu-droplet-ip

# 3. Seguir pasos de Docker
# 4. Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### **B. AWS EC2:**
```bash
# 1. Crear instancia EC2 (t3.medium, Ubuntu 22.04)
# 2. Configurar Security Groups:
#    - SSH (22) - Tu IP
#    - HTTP (80) - 0.0.0.0/0
#    - HTTPS (443) - 0.0.0.0/0
# 3. Conectar y seguir pasos de Docker
```

#### **C. Google Cloud Platform:**
```bash
# 1. Crear VM (e2-medium, Ubuntu 22.04)
# 2. Configurar firewall rules
# 3. Conectar y seguir pasos de Docker
```

---

### **4. 🔧 Despliegue Manual (Sin Docker)**

#### **Instalar Dependencias:**
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Redis
sudo apt install redis-server
```

#### **Configurar Base de Datos:**
```bash
# Crear base de datos
sudo -u postgres psql
CREATE DATABASE appdb;
CREATE USER app WITH PASSWORD 'app';
GRANT ALL PRIVILEGES ON DATABASE appdb TO app;
\q
```

#### **Desplegar Backend:**
```bash
cd app/backend
npm install
npm run build
npm run start:prod
```

#### **Desplegar Frontend:**
```bash
cd app/frontend
npm install
npm run build
npm start
```

---

## 🛠️ **Comandos de Mantenimiento**

### **Monitoreo:**
```bash
# Ver logs
docker-compose logs -f

# Estado de servicios
docker-compose ps

# Uso de recursos
docker stats

# Espacio en disco
df -h
```

### **Backup:**
```bash
# Backup de base de datos
docker-compose exec db pg_dump -U app appdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup de archivos
tar -czf ambureview_backup_$(date +%Y%m%d).tar.gz .
```

### **Actualizaciones:**
```bash
# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔒 **Configuración de Seguridad**

### **Firewall:**
```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **Variables de Entorno Seguras:**
```bash
# Generar JWT secret seguro
openssl rand -base64 32

# Configurar contraseñas seguras
# Cambiar contraseñas por defecto
# Usar HTTPS en producción
```

---

## 📊 **Monitoreo y Alertas**

### **Logs del Sistema:**
```bash
# Ver logs de Docker
docker-compose logs -f

# Logs del sistema
sudo journalctl -u docker -f

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Monitoreo de Recursos:**
```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Red
netstat -tulpn
```

---

## 🚨 **Solución de Problemas**

### **Problemas Comunes:**

#### **1. Puerto en uso:**
```bash
# Verificar puertos
sudo netstat -tulpn | grep :9002
sudo netstat -tulpn | grep :3001

# Matar proceso
sudo kill -9 PID
```

#### **2. Error de permisos:**
```bash
# Arreglar permisos
sudo chown -R $USER:$USER .
sudo chmod +x deploy.sh
```

#### **3. Error de memoria:**
```bash
# Verificar memoria
free -h

# Limpiar Docker
docker system prune -a
```

#### **4. Error de base de datos:**
```bash
# Verificar PostgreSQL
docker-compose logs db

# Reiniciar base de datos
docker-compose restart db
```

---

## 🎯 **URLs de Acceso**

Una vez desplegado, el sistema estará disponible en:

- **🌐 Frontend:** http://tu-servidor.com:9002
- **🔧 Backend API:** http://tu-servidor.com:3001
- **📚 Swagger Docs:** http://tu-servidor.com:3001/api
- **📧 MailHog:** http://tu-servidor.com:8025

### **Con SSL:**
- **🌐 Frontend:** https://tu-dominio.com
- **🔧 Backend API:** https://tu-dominio.com/api
- **📚 Swagger Docs:** https://tu-dominio.com/api

---

## 👤 **Cuentas de Prueba**

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | `admin@ambureview.com` | `123456` |
| **Coordinador** | `alicia@ambureview.com` | `123456` |
| **Usuario** | `amb001@ambureview.com` | `123456` |
| **Usuario** | `carlos@ambureview.com` | `123456` |

---

## 🏆 **¡Despliegue Completado!**

Tu sistema AmbuReview estará listo para usar en producción. Recuerda:

- ✅ **Configurar variables de entorno** seguras
- ✅ **Configurar SSL** para HTTPS
- ✅ **Configurar firewall** apropiadamente
- ✅ **Configurar backups** automáticos
- ✅ **Monitorear** el sistema regularmente

**¡Disfruta tu sistema AmbuReview en producción!** 🚀
