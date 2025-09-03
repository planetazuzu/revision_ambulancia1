# 🚀 Guía de Despliegue en Servidor - AmbuReview

## 📋 **Opciones de Despliegue**

### **1. 🐳 Despliegue con Docker (Recomendado)**

#### **Requisitos del Servidor:**
- **OS:** Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **CPU:** 2 cores mínimo, 4 cores recomendado
- **RAM:** 4GB mínimo, 8GB recomendado
- **Almacenamiento:** 20GB mínimo, 50GB recomendado
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

#### **Variables de Entorno para Producción:**
```env
# Base de Datos
DATABASE_URL="postgresql://app:app@db:5432/appdb?schema=public"

# JWT (¡CAMBIAR EN PRODUCCIÓN!)
JWT_SECRET="tu_clave_secreta_muy_segura_aqui"
JWT_EXPIRATION_TIME="1h"

# Email (configurar con tu proveedor)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu_email@gmail.com"
EMAIL_PASSWORD="tu_contraseña_app"

# Frontend
NEXT_PUBLIC_API_URL="https://tu-dominio.com"
NEXT_PUBLIC_MOCK_MODE="false"

# Producción
NODE_ENV=production
```

---

### **2. 🌐 Despliegue con Nginx + SSL**

#### **Configuración de Nginx:**
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
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **Configurar SSL con Let's Encrypt:**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

### **3. ☁️ Despliegue en Servicios Cloud**

#### **A. DigitalOcean Droplet:**
```bash
# Crear droplet Ubuntu 22.04
# Conectar via SSH
ssh root@tu-droplet-ip

# Seguir pasos de Docker
```

#### **B. AWS EC2:**
```bash
# Crear instancia EC2 (t3.medium recomendado)
# Conectar via SSH
ssh -i tu-key.pem ubuntu@tu-ec2-ip

# Seguir pasos de Docker
```

#### **C. Google Cloud Platform:**
```bash
# Crear instancia Compute Engine
# Conectar via SSH
gcloud compute ssh tu-instancia --zone=tu-zona

# Seguir pasos de Docker
```

#### **D. Azure Virtual Machine:**
```bash
# Crear VM Ubuntu
# Conectar via SSH
ssh azureuser@tu-vm-ip

# Seguir pasos de Docker
```

---

### **4. 🐳 Despliegue con Docker Swarm (Alta Disponibilidad)**

```bash
# Inicializar Docker Swarm
docker swarm init

# Crear stack
docker stack deploy -c docker-compose.yml ambureview

# Verificar servicios
docker service ls
```

---

### **5. ☸️ Despliegue con Kubernetes**

#### **Archivo de configuración Kubernetes:**
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ambureview-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ambureview-backend
  template:
    metadata:
      labels:
        app: ambureview-backend
    spec:
      containers:
      - name: backend
        image: ambureview/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          value: "postgresql://app:app@postgres:5432/appdb"
---
apiVersion: v1
kind: Service
metadata:
  name: ambureview-backend-service
spec:
  selector:
    app: ambureview-backend
  ports:
  - port: 3001
    targetPort: 3001
  type: LoadBalancer
```

---

## 🔧 **Configuración de Producción**

### **Variables de Entorno Críticas:**
```env
# ¡IMPORTANTE! Cambiar en producción
JWT_SECRET="clave_super_secreta_produccion_2024"
DATABASE_PASSWORD="contraseña_super_segura_db"

# Configuración de email real
EMAIL_HOST="smtp.tu-proveedor.com"
EMAIL_USER="noreply@tu-dominio.com"
EMAIL_PASSWORD="contraseña_email"

# URLs de producción
NEXT_PUBLIC_API_URL="https://tu-dominio.com"
NEXT_PUBLIC_MOCK_MODE="false"
```

### **Configuración de Firewall:**
```bash
# Configurar UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### **Monitoreo y Logs:**
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitorear recursos
docker stats
```

---

## 📊 **Backup y Mantenimiento**

### **Backup de Base de Datos:**
```bash
# Backup automático diario
docker-compose exec db pg_dump -U app appdb > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T db psql -U app appdb < backup_20241201.sql
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

## 🚨 **Solución de Problemas**

### **Problemas Comunes:**

#### **1. Puerto ya en uso:**
```bash
# Verificar puertos en uso
sudo netstat -tlnp | grep :9002
sudo netstat -tlnp | grep :3001

# Matar proceso
sudo kill -9 PID
```

#### **2. Error de permisos Docker:**
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Reiniciar sesión
```

#### **3. Error de memoria:**
```bash
# Verificar memoria disponible
free -h

# Aumentar swap si es necesario
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 🎯 **Recomendaciones de Producción**

### **Servidor Mínimo Recomendado:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Almacenamiento:** 50GB SSD
- **Ancho de banda:** 1TB/mes
- **OS:** Ubuntu 22.04 LTS

### **Servicios Adicionales:**
- **CDN:** Cloudflare (gratis)
- **Monitoreo:** UptimeRobot (gratis)
- **Backup:** Automático diario
- **SSL:** Let's Encrypt (gratis)

---

## 🏆 **¡Despliegue Completado!**

Una vez desplegado, tu sistema estará disponible en:
- **Frontend:** https://tu-dominio.com
- **Backend API:** https://tu-dominio.com/api
- **Swagger:** https://tu-dominio.com/api

**¡Tu sistema AmbuReview estará listo para producción!** 🚀
