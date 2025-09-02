# Integración Backend-Frontend: AmbuReview

## Resumen de la Integración

El sistema AmbuReview ha evolucionado de un prototipo con datos mock a una aplicación full-stack completa. Esta documentación explica cómo integrar el backend NestJS implementado con el frontend Next.js existente.

## Arquitectura Actual vs Nueva

### Estado Actual (Frontend con Mock Data)
- **Frontend**: Next.js con React Context para gestión de estado
- **Datos**: Almacenados en memoria del cliente (localStorage + useState)
- **Autenticación**: Mock users con roles simulados
- **Persistencia**: Solo localStorage del navegador

### Estado Nuevo (Full-Stack)
- **Backend**: NestJS con PostgreSQL + Prisma ORM
- **Frontend**: Next.js (mantiene la misma UI/UX)
- **Datos**: Base de datos PostgreSQL persistente
- **Autenticación**: JWT con roles reales
- **API**: RESTful endpoints para todas las operaciones

## Componentes de Integración

### 1. Contextos de React (Frontend)

#### AppDataContext.tsx
**Estado Actual**: Gestiona datos mock en memoria
```typescript
// Datos mock hardcodeados
const initialAmbulances: Ambulance[] = [...]
const [allAmbulancesData, setAllAmbulancesData] = useState<Ambulance[]>(initialAmbulances);
```

**Integración Requerida**: Reemplazar con llamadas API
```typescript
// Llamadas al backend
const fetchAmbulances = async () => {
  const response = await fetch('/api/ambulances');
  return response.json();
};
```

#### AuthContext.tsx
**Estado Actual**: Mock users con localStorage
```typescript
const mockUsers: User[] = [
  { id: 'userCoordinador', name: 'Alicia Coordinadora', role: 'coordinador' },
  // ...
];
```

**Integración Requerida**: Autenticación JWT real
```typescript
const login = async (credentials: LoginDto) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  const { access_token } = await response.json();
  // Almacenar token y configurar headers
};
```

### 2. API Routes (Next.js)

#### Estructura Actual
```
src/app/api/
├── ampulario/
│   ├── route.ts
│   └── [id]/route.ts
├── materials/
│   ├── route.ts
│   └── [id]/route.ts
└── spaces/
    ├── route.ts
    └── [id]/route.ts
```

#### Integración Requerida
Crear API routes que actúen como proxy al backend NestJS:

```typescript
// src/app/api/ambulances/route.ts
export async function GET() {
  const response = await fetch(`${process.env.BACKEND_URL}/ambulances`, {
    headers: {
      'Authorization': `Bearer ${getTokenFromRequest()}`,
    },
  });
  return NextResponse.json(await response.json());
}
```

### 3. Base de Datos

#### Esquema Prisma (Backend)
```prisma
model Ambulance {
  id          String   @id @default(cuid())
  name        String
  licensePlate String
  model       String
  year        Int
  // ... más campos
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Migración de Datos Mock
Los datos mock del frontend deben migrarse a la base de datos:

```typescript
// Script de migración
const migrateMockData = async () => {
  const mockAmbulances = initialAmbulances;
  for (const ambulance of mockAmbulances) {
    await prisma.ambulance.create({
      data: {
        name: ambulance.name,
        licensePlate: ambulance.licensePlate,
        model: ambulance.model,
        year: ambulance.year,
        // ... otros campos
      }
    });
  }
};
```

## Plan de Migración

### Fase 1: Configuración de Entorno
1. **Variables de Entorno**
   ```env
   # Frontend (.env.local)
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_API_BASE_URL=/api
   
   # Backend (.env)
   DATABASE_URL="postgresql://user:password@localhost:5432/ambureview"
   JWT_SECRET="your-secret-key"
   ```

2. **Docker Compose**
   ```yaml
   services:
     frontend:
       build: ./app/frontend
       ports:
         - "3000:3000"
       environment:
         - BACKEND_URL=http://backend:3001
     
     backend:
       build: ./app/backend
       ports:
         - "3001:3001"
       environment:
         - DATABASE_URL=postgresql://user:password@db:5432/ambureview
   ```

### Fase 2: API Routes (Proxy)
Crear API routes en Next.js que actúen como proxy:

```typescript
// src/app/api/ambulances/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/ambulances`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ambulances' },
      { status: 500 }
    );
  }
}
```

### Fase 3: Actualización de Contextos

#### AppDataContext.tsx
```typescript
// Reemplazar useState con llamadas API
const [ambulances, setAmbulances] = useState<Ambulance[]>([]);

useEffect(() => {
  const fetchAmbulances = async () => {
    try {
      const response = await fetch('/api/ambulances');
      const data = await response.json();
      setAmbulances(data);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
    }
  };
  
  fetchAmbulances();
}, []);

// Actualizar funciones CRUD
const addAmbulance = async (ambulanceData: CreateAmbulanceDto) => {
  try {
    const response = await fetch('/api/ambulances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ambulanceData),
    });
    
    if (response.ok) {
      const newAmbulance = await response.json();
      setAmbulances(prev => [...prev, newAmbulance]);
    }
  } catch (error) {
    console.error('Error adding ambulance:', error);
  }
};
```

#### AuthContext.tsx
```typescript
const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (response.ok) {
      const { access_token, user } = await response.json();
      localStorage.setItem('auth_token', access_token);
      setUser(user);
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Fase 4: Migración de Datos

#### Script de Migración
```typescript
// scripts/migrate-mock-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  // Migrar ambulancias
  const mockAmbulances = initialAmbulances;
  for (const ambulance of mockAmbulances) {
    await prisma.ambulance.create({
      data: {
        name: ambulance.name,
        licensePlate: ambulance.licensePlate,
        model: ambulance.model,
        year: ambulance.year,
        lastKnownKilometers: ambulance.lastKnownKilometers,
        // ... otros campos
      }
    });
  }
  
  // Migrar materiales
  const mockConsumables = initialConsumables;
  for (const material of mockConsumables) {
    await prisma.material.create({
      data: {
        name: material.name,
        reference: material.reference,
        quantity: material.quantity,
        expiryDate: new Date(material.expiryDate),
        // ... otros campos
      }
    });
  }
  
  console.log('Migration completed successfully');
}

migrateData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Fase 5: Testing y Validación

#### Tests de Integración
```typescript
// tests/integration.test.ts
describe('Backend-Frontend Integration', () => {
  test('should fetch ambulances from backend', async () => {
    const response = await fetch('/api/ambulances');
    const ambulances = await response.json();
    
    expect(Array.isArray(ambulances)).toBe(true);
    expect(ambulances.length).toBeGreaterThan(0);
  });
  
  test('should authenticate user', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });
    
    const { access_token } = await response.json();
    expect(access_token).toBeDefined();
  });
});
```

## Consideraciones Técnicas

### 1. Manejo de Errores
```typescript
// Error boundary para API calls
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Token expirado, redirigir a login
    router.push('/login');
  } else if (error.status === 403) {
    // Sin permisos
    toast.error('No tienes permisos para esta acción');
  } else {
    // Error genérico
    toast.error('Error del servidor');
  }
};
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } finally {
    setLoading(false);
  }
};
```

### 3. Optimistic Updates
```typescript
const updateAmbulance = async (id: string, updates: any) => {
  // Actualización optimista
  setAmbulances(prev => 
    prev.map(amb => amb.id === id ? { ...amb, ...updates } : amb)
  );
  
  try {
    await api.updateAmbulance(id, updates);
  } catch (error) {
    // Revertir en caso de error
    setAmbulances(prev => 
      prev.map(amb => amb.id === id ? { ...amb, ...originalData } : amb)
    );
    throw error;
  }
};
```

## Beneficios de la Integración

### 1. Persistencia Real
- Los datos se mantienen entre sesiones
- Backup automático con PostgreSQL
- Historial completo de cambios

### 2. Escalabilidad
- Múltiples usuarios simultáneos
- API RESTful para futuras integraciones
- Microservicios preparados

### 3. Seguridad
- Autenticación JWT real
- Autorización basada en roles
- Validación de datos en backend

### 4. Funcionalidades Avanzadas
- Notificaciones en tiempo real (WebSocket)
- Reportes PDF/Excel
- Auditoría completa
- Jobs automatizados

## Próximos Pasos

1. **Configurar entorno de desarrollo**
2. **Crear API routes proxy**
3. **Migrar contextos de React**
4. **Ejecutar migración de datos**
5. **Testing integral**
6. **Deploy a producción**

Esta integración transformará AmbuReview de un prototipo funcional a una aplicación empresarial completa, manteniendo la experiencia de usuario existente mientras añade robustez y funcionalidades avanzadas.
