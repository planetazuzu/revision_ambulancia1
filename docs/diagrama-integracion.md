# Diagrama de Integración Backend-Frontend

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   AuthContext   │  │  AppDataContext │  │   Components    │  │
│  │                 │  │                 │  │                 │  │
│  │ • Mock Users    │  │ • Mock Data     │  │ • UI Components │  │
│  │ • localStorage  │  │ • useState      │  │ • Forms         │  │
│  │ • Roles         │  │ • CRUD Ops      │  │ • Tables        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │          │
│           └─────────────────────┼─────────────────────┘          │
│                                 │                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                API Routes (Proxy)                          │ │
│  │  /api/auth/*    /api/ambulances/*    /api/materials/*     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP Requests
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (NestJS)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Auth Module   │  │ Ambulances Mod. │  │ Materials Mod.  │  │
│  │                 │  │                 │  │                 │  │
│  │ • JWT Strategy  │  │ • CRUD Service  │  │ • CRUD Service  │  │
│  │ • Guards        │  │ • Controller    │  │ • Controller    │  │
│  │ • DTOs          │  │ • DTOs          │  │ • DTOs          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │          │
│           └─────────────────────┼─────────────────────┘          │
│                                 │                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Prisma ORM                              │ │
│  │              Database Abstraction Layer                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ SQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │     Users       │  │   Ambulances    │  │   Materials     │  │
│  │                 │  │                 │  │                 │  │
│  │ • id            │  │ • id            │  │ • id            │  │
│  │ • email         │  │ • name          │  │ • name          │  │
│  │ • password      │  │ • licensePlate  │  │ • quantity      │  │
│  │ • role          │  │ • model         │  │ • expiryDate    │  │
│  │ • createdAt     │  │ • year          │  │ • category      │  │
│  └─────────────────┘  │ • createdAt     │  │ • createdAt     │  │
│                       └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Checklists    │  │   Incidents     │  │   Reports       │  │
│  │                 │  │                 │  │                 │  │
│  │ • templates     │  │ • description   │  │ • type          │  │
│  │ • responses     │  │ • severity      │  │ • data          │  │
│  │ • status        │  │ • ambulanceId   │  │ • generatedAt   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Autenticación
```
Usuario → Frontend → API Route → Backend → Database
   ↓         ↓          ↓          ↓         ↓
Login → AuthContext → /api/auth → AuthService → User Table
   ↓         ↓          ↓          ↓         ↓
JWT ← Response ← Token ← JWT Sign ← User Data ← Query
```

### 2. Operaciones CRUD
```
Component → Context → API Route → Backend → Database
    ↓         ↓          ↓          ↓         ↓
User Action → State → /api/entity → Service → Prisma
    ↓         ↓          ↓          ↓         ↓
UI Update ← Response ← JSON ← Entity ← Query Result
```

### 3. Flujo de Revisión de Ambulancia
```
1. Usuario selecciona ambulancia
   ↓
2. Frontend carga datos desde /api/ambulances/{id}
   ↓
3. Usuario completa revisión diaria
   ↓
4. Frontend envía datos a /api/checklists
   ↓
5. Backend valida y guarda en database
   ↓
6. WebSocket notifica actualización
   ↓
7. Frontend actualiza UI en tiempo real
```

## Migración de Datos

### Estado Actual (Mock Data)
```typescript
// AppDataContext.tsx
const initialAmbulances: Ambulance[] = [
  { id: 'amb001', name: 'Ambulancia 01', licensePlate: 'XYZ 123', ... },
  { id: 'amb002', name: 'Ambulancia 02', licensePlate: 'ABC 789', ... },
  // ... más datos mock
];

const [allAmbulancesData, setAllAmbulancesData] = useState<Ambulance[]>(initialAmbulances);
```

### Estado Futuro (API Integration)
```typescript
// AppDataContext.tsx (actualizado)
const [ambulances, setAmbulances] = useState<Ambulance[]>([]);

useEffect(() => {
  const fetchAmbulances = async () => {
    const response = await fetch('/api/ambulances');
    const data = await response.json();
    setAmbulances(data);
  };
  fetchAmbulances();
}, []);

const addAmbulance = async (ambulanceData: CreateAmbulanceDto) => {
  const response = await fetch('/api/ambulances', {
    method: 'POST',
    body: JSON.stringify(ambulanceData),
  });
  const newAmbulance = await response.json();
  setAmbulances(prev => [...prev, newAmbulance]);
};
```

## Componentes de Integración

### 1. API Routes (Next.js)
```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── profile/route.ts
├── ambulances/
│   ├── route.ts
│   └── [id]/route.ts
├── materials/
│   ├── route.ts
│   └── [id]/route.ts
├── checklists/
│   ├── route.ts
│   └── [id]/route.ts
└── reports/
    ├── route.ts
    └── generate/route.ts
```

### 2. Contextos Actualizados
```
src/contexts/
├── AuthContext.tsx          # JWT authentication
├── AppDataContext.tsx       # API data management
└── NotificationContext.tsx  # Real-time updates
```

### 3. Servicios de API
```
src/services/
├── api.ts                   # Base API client
├── auth.service.ts          # Authentication
├── ambulances.service.ts    # Ambulance operations
├── materials.service.ts     # Material management
└── reports.service.ts       # Report generation
```

## Beneficios de la Integración

### Antes (Mock Data)
- ❌ Datos perdidos al cerrar navegador
- ❌ Sin persistencia real
- ❌ Un solo usuario por sesión
- ❌ Sin validación de datos
- ❌ Sin historial de cambios

### Después (Backend Integration)
- ✅ Persistencia en PostgreSQL
- ✅ Múltiples usuarios simultáneos
- ✅ Validación robusta de datos
- ✅ Historial completo de auditoría
- ✅ Notificaciones en tiempo real
- ✅ Reportes PDF/Excel
- ✅ Jobs automatizados
- ✅ Escalabilidad empresarial

## Plan de Implementación

### Fase 1: Infraestructura
1. Configurar Docker Compose
2. Crear variables de entorno
3. Configurar base de datos
4. Ejecutar migraciones

### Fase 2: API Integration
1. Crear API routes proxy
2. Implementar servicios de API
3. Actualizar contextos de React
4. Manejar estados de carga y error

### Fase 3: Migración de Datos
1. Crear script de migración
2. Migrar datos mock a PostgreSQL
3. Validar integridad de datos
4. Testing de funcionalidad

### Fase 4: Testing y Deploy
1. Tests de integración
2. Tests end-to-end
3. Deploy a staging
4. Deploy a producción

Esta integración transformará AmbuReview de un prototipo funcional a una aplicación empresarial completa, manteniendo la experiencia de usuario existente mientras añade robustez y funcionalidades avanzadas.
