# Configuración de Desarrollo

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"

# JWT
JWT_SECRET="dev-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-nextauth-secret-change-in-production"

# Email (Development - MailHog)
SMTP_HOST="mailhog"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="AmbuReview <no-reply@ambureview.local>"

# Web Push (VAPID)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_EMAIL="mailto:admin@ambureview.local"

# Redis
REDIS_URL="redis://localhost:6379"

# App Configuration
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"

# Backup
BACKUP_ENCRYPTION_KEY="dev-backup-encryption-key"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```

## Comandos de Desarrollo

### 1. Instalar Dependencias

```bash
# Backend
cd app/backend
npm install

# Frontend
cd app/frontend
npm install
```

### 2. Configurar Base de Datos

```bash
# Iniciar servicios de base de datos
docker-compose up -d db redis mailhog

# Generar cliente Prisma
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Poblar con datos de prueba
npm run db:seed
```

### 3. Iniciar Servicios

```bash
# Backend (puerto 3001)
cd app/backend
npm run start:dev

# Frontend (puerto 3000)
cd app/frontend
npm run dev
```

## URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **MailHog**: http://localhost:8025
- **Prisma Studio**: `npm run db:studio`

## Cuentas de Prueba

Después del seed, puedes usar estas cuentas:

- **👑 Admin**: `admin@ambureview.local` / `password123`
- **👨‍💼 Coordinador**: `coordinador@ambureview.local` / `password123`
- **👤 Usuario**: `usuario@ambureview.local` / `password123`

## Estructura del Proyecto

```
/app
  /backend                 # NestJS API
    /src
      /auth               # Autenticación JWT
      /users              # Gestión de usuarios
      /ambulances         # CRUD ambulancias
      /materials          # Gestión de materiales
      /inventory          # Control de inventario
      /checklists         # Listas de verificación
      /incidents          # Gestión de incidencias
      /reports            # Reportes PDF/Excel
      /notifications      # Email, WebSocket, Push
      /jobs               # Tareas programadas
      /websocket          # Socket.IO
      /ampulario          # Inventario central
      /usvb               # Kits USVB
      /audit              # Auditoría
    /prisma               # Esquema y migraciones
  /frontend               # Next.js 14
    /app                  # App Router
      /dashboard          # Panel principal
      /ambulances         # Gestión ambulancias
      /inventory          # Control inventario
    /components           # Componentes UI
    /lib                  # Utilidades
/ops                     # Configuraciones Docker
  /nginx.conf            # Proxy Nginx
  /crontab               # Tareas programadas
  /init-db.sql           # Inicialización DB
```

## Funcionalidades Implementadas

### ✅ Backend Completo
- **Autenticación**: JWT con roles (Admin, Coordinador, Usuario, Auditor)
- **Base de Datos**: PostgreSQL con Prisma ORM
- **API REST**: Endpoints completos para todos los módulos
- **Validación**: DTOs con class-validator
- **Documentación**: Swagger/OpenAPI
- **Seguridad**: Rate limiting, CORS, Helmet
- **Auditoría**: Log completo de todas las acciones

### ✅ Módulos Implementados
- **Auth**: Login, registro, cambio de contraseña
- **Users**: CRUD de usuarios con roles
- **Ambulances**: Gestión de ambulancias
- **Materials**: Materiales y categorías
- **Inventory**: Control de inventario con logs
- **Checklists**: Templates y respuestas
- **Incidents**: Gestión de incidencias
- **Reports**: Generación de reportes
- **Notifications**: Email, WebSocket, Push
- **Jobs**: Tareas programadas
- **Ampulario**: Inventario central con CSV
- **USVB**: Kits de materiales
- **Audit**: Logs de auditoría

### ✅ Frontend (Existente)
- **Next.js 14**: App Router
- **Autenticación**: Context y guards
- **UI**: shadcn/ui con Tailwind
- **PWA**: Service Worker básico
- **Temas**: Modo claro/oscuro

## Próximos Pasos

1. **Integración Frontend-Backend**: Conectar el frontend con la API
2. **Testing**: Implementar tests unitarios y e2e
3. **Deployment**: Configurar para producción
4. **Monitoreo**: Agregar métricas y logs
5. **Optimización**: Performance y caching
