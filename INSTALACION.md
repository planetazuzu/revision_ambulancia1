# 🚀 Guía de Instalación - AmbuReview

## 📋 Opciones de Instalación

### **Opción 1: Con Docker (Recomendado para Producción)**

#### Prerrequisitos:
- Docker Desktop instalado
- Git instalado

#### Pasos:
```bash
# 1. Clonar el repositorio
git clone https://github.com/planetazuzu/revision_ambulancia1.git
cd revision_ambulancia1

# 2. Ejecutar script de despliegue
# En Windows:
deploy.bat

# En Linux/macOS:
./deploy.sh
```

### **Opción 1.1: Con Docker - Puertos Personalizados**

#### Para evitar conflictos de puertos:
```bash
# Backend en puerto 9990, Frontend en puerto 3001
# En Windows:
deploy-port9990-3001.bat

# En Linux/macOS:
./deploy-port9990-3001.sh
```

### **Opción 2: Sin Docker (Desarrollo Local)**

#### Prerrequisitos:
- Node.js 18+ instalado
- npm instalado
- Git instalado

#### Pasos:
```bash
# 1. Clonar el repositorio
git clone https://github.com/planetazuzu/revision_ambulancia1.git
cd revision_ambulancia1

# 2. Ejecutar script local
# En Windows:
start-local.bat

# En Linux/macOS:
./start-local.sh
```

### **Opción 2.1: Sin Docker - Puertos Personalizados**

#### Para evitar conflictos de puertos:
```bash
# Backend en puerto 9990, Frontend en puerto 3001
# En Windows:
start-local-port9990-3001.bat

# En Linux/macOS:
./start-local-port9990-3001.sh
```

### **Opción 3: Instalación Manual**

#### Backend:
```bash
cd app/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

#### Frontend (en otra terminal):
```bash
cd app/frontend
npm install
npm run dev
```

## 🌐 Acceso a la Aplicación

Una vez instalada, accede a:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api
- **MailHog:** http://localhost:8025 (solo con Docker)

## 👤 Usuarios de Prueba

- **Admin:** admin@ambureview.com / admin123
- **Coordinador:** coordinador@ambureview.com / coord123
- **Usuario:** usuario@ambureview.com / user123

## 🔧 Solución de Problemas

### **Error: "Docker no está instalado"**
- Instala Docker Desktop desde: https://docker.com
- Reinicia tu ordenador después de la instalación

### **Error: "Node.js no está instalado"**
- Instala Node.js desde: https://nodejs.org
- Asegúrate de instalar la versión LTS

### **Error: "Puerto ocupado"**
- Cambia los puertos en el archivo `.env`
- O detén otros servicios que usen los puertos 3000/3001

### **Error: "Base de datos no responde"**
- Verifica que PostgreSQL esté ejecutándose (con Docker)
- O usa SQLite para desarrollo local

## 📊 Requisitos del Sistema

### **Mínimos:**
- RAM: 4GB
- Espacio: 2GB libres
- CPU: Dual-core 2GHz

### **Recomendados:**
- RAM: 8GB
- Espacio: 5GB libres
- CPU: Quad-core 3GHz

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f [servicio]`
2. Verifica que todos los servicios estén ejecutándose
3. Consulta la documentación en `docs/`
4. Crea un issue en GitHub

## 🎯 Próximos Pasos

Después de la instalación:
1. Configura las variables de entorno en `.env`
2. Personaliza la configuración según tus necesidades
3. Configura SSL/HTTPS para producción
4. Configura backup automático de la base de datos
