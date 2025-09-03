# 🔄 Modo Mock vs Backend Real

El sistema AmbuReview soporta dos modos de operación para facilitar el desarrollo y testing:

## 🎭 **Modo Mock (Desarrollo/Testing)**

### Características:
- ✅ **Datos predefinidos** para testing rápido
- ✅ **Sin dependencias** de backend o base de datos
- ✅ **Login instantáneo** con cuentas de prueba
- ✅ **Ideal para desarrollo** y demostraciones

### Cuentas de Prueba:
| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Alicia Coordinadora | alicia@ambureview.com | 123456 | coordinador |
| Ambulancia 01 | amb001@ambureview.com | 123456 | usuario |
| Carlos Usuario | carlos@ambureview.com | 123456 | usuario |
| Admin Sistema | admin@ambureview.com | 123456 | admin |

### Cómo Activar:
```bash
# En .env.local
NEXT_PUBLIC_MOCK_MODE=true
```

## 🚀 **Modo Backend Real (Producción)**

### Características:
- ✅ **Base de datos PostgreSQL** persistente
- ✅ **Autenticación JWT** real
- ✅ **API REST** completa
- ✅ **Datos reales** y escalables

### Cómo Activar:
```bash
# En .env.local
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔧 **Configuración**

### 1. Crear archivo de entorno:
```bash
cp env.local.example .env.local
```

### 2. Configurar variables:
```env
# Para modo mock
NEXT_PUBLIC_MOCK_MODE=true

# Para modo backend real
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
```

## 🎯 **Cuándo Usar Cada Modo**

### **Usar Modo Mock cuando:**
- 🧪 **Desarrollando** nuevas funcionalidades
- 🎨 **Diseñando** interfaces de usuario
- 📱 **Probando** la aplicación sin backend
- 🚀 **Haciendo demos** rápidas
- 🐛 **Debugging** problemas de frontend

### **Usar Modo Backend cuando:**
- 🏭 **Producción** o staging
- 🔄 **Testing de integración** completa
- 📊 **Datos reales** y persistentes
- 👥 **Múltiples usuarios** simultáneos
- 🔐 **Seguridad** real

## 🔍 **Indicadores Visuales**

El sistema muestra automáticamente un indicador en la esquina superior derecha:

- 🟡 **"Modo Mock"** - Cuando está usando datos mock
- 🟢 **"Backend Real"** - Cuando está conectado al backend

## 🚀 **Despliegue**

### Desarrollo Local:
```bash
# Modo mock (sin backend)
npm run dev

# Modo backend (con backend)
docker-compose up -d  # Inicia backend
npm run dev          # Inicia frontend
```

### Producción:
```bash
# Siempre usar backend real
NEXT_PUBLIC_MOCK_MODE=false
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 **Migración de Datos**

Para migrar de modo mock a backend real:

1. **Activar modo backend**
2. **Ejecutar seed** de base de datos:
   ```bash
   cd app/backend
   npm run prisma:seed
   ```
3. **Crear usuarios** reales en el sistema

## 🛠️ **Desarrollo**

### Agregar Nuevos Datos Mock:
1. Editar `src/lib/mock-data.ts`
2. Agregar datos a los arrays correspondientes
3. Reiniciar la aplicación

### Agregar Nuevos Endpoints:
1. Crear servicio en `src/lib/services/`
2. Agregar lógica mock en el servicio
3. Crear API route en `src/app/api/`

## 📝 **Notas Importantes**

- ⚠️ **Los datos mock se pierden** al recargar la página
- ⚠️ **No hay persistencia** en modo mock
- ⚠️ **Las validaciones** son básicas en modo mock
- ✅ **El código es el mismo** en ambos modos
- ✅ **Fácil cambio** entre modos
- ✅ **Testing consistente** en ambos modos
