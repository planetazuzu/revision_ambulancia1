# 🚑 AmbuReview - Sistema de Gestión de Ambulancias

Sistema completo de gestión y revisión de ambulancias con **arquitectura monorepo**, backend NestJS, frontend Next.js y base de datos PostgreSQL.

## 🏗️ Arquitectura Monorepo

```
revision_ambulancia-main/
├── src/
│   ├── frontend/          # Next.js Frontend
│   ├── backend/           # NestJS Backend  
│   └── shared/            # Tipos y utilidades compartidas
├── .github/workflows/     # CI/CD con GitHub Actions
├── docker-compose.yml     # Orquestación de contenedores
└── package.json          # Workspaces configurados
```

## 🚀 CI/CD Pipeline

- ✅ **Detección inteligente** de cambios en el monorepo
- ✅ **Tests paralelos** para frontend y backend
- ✅ **Build automático** de imágenes Docker
- ✅ **Deploy automático** a producción
- ✅ **Análisis de seguridad** continuo
- ✅ **Actualizaciones automáticas** de dependencias

## 🎯 Características Principales

### 🔐 Autenticación y Autorización
- Sistema de autenticación JWT
- Roles: Admin, Coordinador, Usuario
- Autorización basada en roles
- Protección de rutas

### 🚑 Gestión de Ambulancias
- CRUD completo de ambulancias
- Revisión diaria de vehículos
- Revisión mecánica
- Registro de limpieza
- Control de inventario

### 📦 Gestión de Materiales
- Materiales consumibles y no consumibles
- Control de stock y caducidad
- Alertas automáticas
- Inventario centralizado (Ampulario)
- Kits USVB configurables

### 📋 Sistema de Checklists
- Plantillas configurables
- Respuestas de revisión
- Seguimiento de estado
- Historial completo

### 📊 Reportes y Notificaciones
- Reportes PDF y Excel
- Notificaciones por email
- WebSocket en tiempo real
- Sistema de alertas

### 🔧 Funcionalidades Técnicas
- API RESTful completa
- Base de datos PostgreSQL
- Cache con Redis
- Jobs automatizados
- Backup automático
- Docker containerizado

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • React Context │    │ • REST API      │    │ • Prisma ORM    │
│ • Tailwind CSS  │    │ • JWT Auth      │    │ • Migrations    │
│ • TypeScript    │    │ • WebSocket     │    │ • Seed Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Redis Cache   │
                    │   MailHog       │
                    │   Nginx         │
                    └─────────────────┘
```

## 🚀 Instalación y Despliegue

### Prerrequisitos
- Docker y Docker Compose
- Git
- Node.js 20+ (para desarrollo local)

### Despliegue Rápido

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/ambureview.git
cd ambureview
```

2. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

3. **Desplegar con Docker**
```bash
# Opción 1: Script automático
./deploy.sh

# Opción 2: Manual
docker-compose up --build -d
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api
- MailHog: http://localhost:8025

### Desarrollo Local

1. **Backend**
```bash
cd app/backend
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

2. **Frontend**
```bash
cd app/frontend
npm install
npm run dev
```

## 👤 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@ambureview.com | admin123 | Admin |
| coordinador@ambureview.com | coord123 | Coordinador |
| usuario@ambureview.com | user123 | Usuario |

## 📁 Estructura del Proyecto

```
ambureview/
├── app/
│   ├── backend/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/           # Autenticación
│   │   │   ├── ambulances/     # Gestión ambulancias
│   │   │   ├── materials/      # Gestión materiales
│   │   │   ├── checklists/     # Sistema checklists
│   │   │   ├── incidents/      # Gestión incidentes
│   │   │   ├── reports/        # Generación reportes
│   │   │   ├── notifications/  # Sistema notificaciones
│   │   │   ├── audit/          # Auditoría
│   │   │   ├── ampulario/      # Inventario central
│   │   │   ├── usvb/           # Kits USVB
│   │   │   ├── jobs/           # Tareas programadas
│   │   │   └── websocket/      # WebSocket
│   │   ├── prisma/             # Base de datos
│   │   └── Dockerfile
│   └── frontend/               # Frontend Next.js
│       ├── src/
│       │   ├── app/            # Páginas Next.js
│       │   ├── components/     # Componentes React
│       │   ├── contexts/       # Contextos React
│       │   ├── hooks/          # Hooks personalizados
│       │   ├── lib/            # Utilidades
│       │   └── types/          # Tipos TypeScript
│       └── Dockerfile
├── ops/                        # Configuración operacional
│   ├── nginx.conf             # Configuración Nginx
│   ├── crontab                # Tareas programadas
│   └── init-db.sql            # Script inicial DB
├── docs/                       # Documentación
├── docker-compose.yml          # Orquestación Docker
├── docker-compose.dev.yml      # Configuración desarrollo
└── deploy.sh                   # Script de despliegue
```

## 🔧 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión

### Ambulancias
- `GET /ambulances` - Listar ambulancias
- `POST /ambulances` - Crear ambulancia
- `GET /ambulances/:id` - Obtener ambulancia
- `PUT /ambulances/:id` - Actualizar ambulancia
- `DELETE /ambulances/:id` - Eliminar ambulancia

### Materiales
- `GET /materials` - Listar materiales
- `POST /materials` - Crear material
- `PUT /materials/:id` - Actualizar material
- `DELETE /materials/:id` - Eliminar material

### Checklists
- `GET /checklists` - Listar checklists
- `POST /checklists` - Crear checklist
- `PUT /checklists/:id` - Actualizar checklist
- `GET /checklists/templates` - Plantillas

### Reportes
- `GET /reports/ambulances` - Reporte ambulancias
- `GET /reports/materials` - Reporte materiales
- `GET /reports/incidents` - Reporte incidentes
- `POST /reports/generate` - Generar reporte

## 🛠️ Tecnologías Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **PostgreSQL** - Base de datos
- **Prisma** - ORM
- **JWT** - Autenticación
- **Redis** - Cache
- **Socket.IO** - WebSocket
- **Nodemailer** - Email
- **Puppeteer** - PDF
- **ExcelJS** - Excel

### Frontend
- **Next.js** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes
- **React Hook Form** - Formularios
- **Date-fns** - Fechas
- **Recharts** - Gráficos

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación
- **Nginx** - Proxy reverso
- **MailHog** - Email testing
- **Supercronic** - Cron jobs

## 📊 Base de Datos

### Modelos Principales
- **User** - Usuarios del sistema
- **Ambulance** - Ambulancias
- **Material** - Materiales
- **InventoryItem** - Items de inventario
- **Checklist** - Checklists
- **Incident** - Incidentes
- **AuditLog** - Logs de auditoría
- **Notification** - Notificaciones

### Relaciones
- Usuario → Ambulancia (asignación)
- Ambulancia → Materiales (inventario)
- Ambulancia → Checklists (revisiones)
- Ambulancia → Incidentes (reportes)

## 🔒 Seguridad

- Autenticación JWT
- Autorización basada en roles
- Validación de datos con DTOs
- Rate limiting
- CORS configurado
- Helmet para headers de seguridad
- Sanitización de inputs

## 📈 Monitoreo y Logs

- Logs estructurados
- Auditoría completa de acciones
- Health checks
- Métricas de rendimiento
- Alertas automáticas

## 🚀 Despliegue en Producción

### Variables de Entorno Requeridas
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
REDIS_URL=redis://host:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Comandos de Producción
```bash
# Migrar base de datos
docker-compose exec backend npm run db:deploy

# Ejecutar seed
docker-compose exec backend npm run db:seed

# Ver logs
docker-compose logs -f backend

# Backup
docker-compose exec backup /backup.sh
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Email: soporte@ambureview.com

## 🎉 Agradecimientos

- Equipo de desarrollo AmbuReview
- Comunidad NestJS
- Comunidad Next.js
- Contribuidores de código abierto

---

**Desarrollado con ❤️ para mejorar la gestión de ambulancias**