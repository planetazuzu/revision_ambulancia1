# 🚀 Guía de Despliegue - AmbuReview

## 📋 **Índice**
1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Configuración Inicial](#configuración-inicial)
3. [Despliegue con Docker](#despliegue-con-docker)
4. [Despliegue Manual](#despliegue-manual)
5. [Configuración de Producción](#configuración-de-producción)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 **Requisitos del Sistema**

### **Mínimos:**
- **CPU:** 2 cores
- **RAM:** 4GB
- **Almacenamiento:** 20GB
- **OS:** Linux (Ubuntu 20.04+), Windows 10+, macOS 10.15+

### **Recomendados:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Almacenamiento:** 50GB SSD
- **OS:** Ubuntu 22.04 LTS

### **Software Requerido:**
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **Git:** 2.30+
- **Node.js:** 18+ (para desarrollo)

---

## ⚙️ **Configuración Inicial**

### **1. Clonar el Repositorio:**
```bash
git clone https://github.com/planetazuzu/revision_ambulancia1.git
cd revision_ambulancia1
```

### **2. Configurar Variables de Entorno:**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables según tu entorno
nano .env
```

### **3. Variables de Entorno Importantes:**
```env
# Base de Datos
DATABASE_URL="postgresql://app:app@db:5432/appdb?schema=public"

# JWT
JWT_SECRET="tu_clave_secreta_muy_segura_aqui"
JWT_EXPIRATION_TIME="1h"

# Email (para notificaciones)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="tu_email@gmail.com"
EMAIL_PASSWORD="tu_contraseña_app"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_MOCK_MODE="false"
```

---

## 🐳 **Despliegue con Docker (Recomendado)**

### **1. Despliegue Completo:**
```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### **2. Verificar Servicios:**
```bash
# Ver estado de contenedores
docker-compose ps

# Verificar que todos estén funcionando
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### **3. Acceder a la Aplicación:**
- **Frontend:** http://localhost:9002
- **Backend API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/api
- **MailHog:** http://localhost:8025

### **4. Comandos Útiles:**
```bash
# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🛠️ **Despliegue Manual**

### **1. Base de Datos PostgreSQL:**
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE appdb;
CREATE USER app WITH PASSWORD 'app';
GRANT ALL PRIVILEGES ON DATABASE appdb TO app;
\q
```

### **2. Backend (NestJS):**
```bash
cd app/backend

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Ejecutar en producción
npm run build
npm run start:prod
```

### **3. Frontend (Next.js):**
```bash
cd app/frontend

# Instalar dependencias
npm install

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

### **4. Redis (Opcional):**
```bash
# Instalar Redis
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

---

## 🌐 **Configuración de Producción**

### **1. Nginx (Reverse Proxy):**
```bash
# Instalar Nginx
sudo apt install nginx

# Configurar sitio
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

### **2. SSL con Let's Encrypt:**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **3. Variables de Producción:**
```env
# Producción
NODE_ENV=production
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"
JWT_SECRET="clave_super_secreta_produccion"
NEXT_PUBLIC_API_URL="https://tu-dominio.com/api"
NEXT_PUBLIC_MOCK_MODE="false"
```

---

## 📊 **Monitoreo y Mantenimiento**

### **1. Logs del Sistema:**
```bash
# Ver logs de Docker
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend | grep ERROR
docker-compose logs -f frontend | grep ERROR

# Logs del sistema
sudo journalctl -u docker -f
```

### **2. Backup de Base de Datos:**
```bash
# Backup automático
docker-compose exec db pg_dump -U app appdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T db psql -U app appdb < backup_20241201_120000.sql
```

### **3. Monitoreo de Recursos:**
```bash
# Uso de recursos
docker stats

# Espacio en disco
df -h

# Memoria
free -h
```

### **4. Actualizaciones:**
```bash
# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔧 **Solución de Problemas**

### **Problemas Comunes:**

#### **1. Error de Conexión a Base de Datos:**
```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose logs db

# Reiniciar base de datos
docker-compose restart db

# Verificar conexión
docker-compose exec db psql -U app -d appdb -c "SELECT 1;"
```

#### **2. Frontend No Carga:**
```bash
# Verificar logs del frontend
docker-compose logs frontend

# Verificar que el puerto esté libre
netstat -tlnp | grep :9002

# Reiniciar frontend
docker-compose restart frontend
```

#### **3. Backend No Responde:**
```bash
# Verificar logs del backend
docker-compose logs backend

# Verificar migraciones
docker-compose exec backend npx prisma migrate status

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy
```

#### **4. Problemas de Permisos:**
```bash
# Arreglar permisos de Docker
sudo chown -R $USER:$USER .

# Limpiar contenedores
docker-compose down -v
docker system prune -a
```

### **Comandos de Diagnóstico:**
```bash
# Estado general
docker-compose ps
docker-compose logs --tail=50

# Verificar conectividad
curl http://localhost:9002
curl http://localhost:3001/api

# Verificar base de datos
docker-compose exec db psql -U app -d appdb -c "\dt"
```

---

## 🚀 **Despliegue Rápido**

### **Script de Despliegue Automático:**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando despliegue de AmbuReview..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

# Clonar repositorio
git clone https://github.com/planetazuzu/revision_ambulancia1.git
cd revision_ambulancia1

# Configurar variables de entorno
cp env.example .env
echo "⚠️  Configura las variables en .env antes de continuar"

# Construir y ejecutar
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado
docker-compose ps

echo "✅ Despliegue completado!"
echo "🌐 Frontend: http://localhost:9002"
echo "🔧 Backend: http://localhost:3001"
echo "📧 MailHog: http://localhost:8025"
```

---

## 📱 **Acceso a la Aplicación**

### **URLs de Acceso:**
- **Aplicación Principal:** http://localhost:9002
- **API Backend:** http://localhost:3001
- **Documentación API:** http://localhost:3001/api
- **Email Testing:** http://localhost:8025

### **Cuentas de Prueba:**
- **Admin:** `admin@ambureview.com` / `123456`
- **Coordinador:** `alicia@ambureview.com` / `123456`
- **Usuario:** `amb001@ambureview.com` / `123456`
- **Usuario:** `carlos@ambureview.com` / `123456`

---

## 🎯 **Próximos Pasos**

1. **Configurar dominio** y SSL
2. **Implementar monitoreo** (Prometheus, Grafana)
3. **Configurar backups** automáticos
4. **Implementar CI/CD** (GitHub Actions)
5. **Configurar alertas** de sistema

---

## 📞 **Soporte**

Si tienes problemas con el despliegue:

1. **Revisa los logs:** `docker-compose logs -f`
2. **Verifica la configuración:** Variables de entorno
3. **Consulta la documentación:** README.md
4. **Revisa issues:** GitHub Issues

---

## 🏆 **¡Despliegue Completado!**

Tu sistema AmbuReview está listo para usar. Recuerda:
- ✅ **Configurar variables de entorno**
- ✅ **Verificar que todos los servicios estén ejecutándose**
- ✅ **Probar la aplicación** con las cuentas de prueba
- ✅ **Configurar backups** regulares
- ✅ **Monitorear** el sistema

**¡Disfruta tu sistema AmbuReview!** 🚀
