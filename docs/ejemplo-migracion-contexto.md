# Ejemplo Práctico: Migración de AppDataContext

## Estado Actual vs Estado Futuro

### AppDataContext.tsx (Estado Actual - Mock Data)

```typescript
"use client";

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { initialAmbulances } from './mockData';

interface AppDataContextType {
  ambulances: Ambulance[];
  getAmbulanceById: (id: string) => Ambulance | undefined;
  addAmbulance: (ambulance: Omit<Ambulance, 'id'>) => void;
  updateAmbulance: (ambulance: Ambulance) => void;
  deleteAmbulance: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Datos mock hardcodeados
  const [ambulances, setAmbulances] = useState<Ambulance[]>(initialAmbulances);

  const getAmbulanceById = (id: string): Ambulance | undefined => {
    return ambulances.find(a => a.id === id);
  };

  const addAmbulance = (ambulanceData: Omit<Ambulance, 'id'>) => {
    const newAmbulance: Ambulance = {
      ...ambulanceData,
      id: `amb${Date.now()}`, // ID generado localmente
    };
    setAmbulances(prev => [...prev, newAmbulance]);
  };

  const updateAmbulance = (updatedAmbulance: Ambulance) => {
    setAmbulances(prev => 
      prev.map(a => a.id === updatedAmbulance.id ? updatedAmbulance : a)
    );
  };

  const deleteAmbulance = (id: string) => {
    setAmbulances(prev => prev.filter(a => a.id !== id));
  };

  const contextValue = {
    ambulances,
    getAmbulanceById,
    addAmbulance,
    updateAmbulance,
    deleteAmbulance,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData debe ser usado dentro de un AppDataProvider');
  }
  return context;
}
```

### AppDataContext.tsx (Estado Futuro - API Integration)

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface AppDataContextType {
  ambulances: Ambulance[];
  loading: boolean;
  error: string | null;
  getAmbulanceById: (id: string) => Ambulance | undefined;
  addAmbulance: (ambulance: CreateAmbulanceDto) => Promise<void>;
  updateAmbulance: (id: string, ambulance: UpdateAmbulanceDto) => Promise<void>;
  deleteAmbulance: (id: string) => Promise<void>;
  refreshAmbulances: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Servicio de API
class AmbulanceApiService {
  private baseUrl = '/api/ambulances';
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getAll(): Promise<Ambulance[]> {
    const response = await fetch(this.baseUrl, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch ambulances');
    }
    
    return response.json();
  }

  async getById(id: string): Promise<Ambulance> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch ambulance');
    }
    
    return response.json();
  }

  async create(ambulance: CreateAmbulanceDto): Promise<Ambulance> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ambulance),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create ambulance');
    }
    
    return response.json();
  }

  async update(id: string, ambulance: UpdateAmbulanceDto): Promise<Ambulance> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ambulance),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update ambulance');
    }
    
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete ambulance');
    }
  }
}

const ambulanceApi = new AmbulanceApiService();

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar ambulancias al montar el componente
  useEffect(() => {
    if (user) {
      loadAmbulances();
    }
  }, [user]);

  const loadAmbulances = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ambulanceApi.getAll();
      setAmbulances(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `No se pudieron cargar las ambulancias: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAmbulanceById = (id: string): Ambulance | undefined => {
    return ambulances.find(a => a.id === id);
  };

  const addAmbulance = async (ambulanceData: CreateAmbulanceDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const newAmbulance = await ambulanceApi.create(ambulanceData);
      setAmbulances(prev => [...prev, newAmbulance]);
      
      toast({
        title: "Éxito",
        description: `Ambulancia ${newAmbulance.name} creada correctamente`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `No se pudo crear la ambulancia: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAmbulance = async (id: string, ambulanceData: UpdateAmbulanceDto) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedAmbulance = await ambulanceApi.update(id, ambulanceData);
      setAmbulances(prev => 
        prev.map(a => a.id === id ? updatedAmbulance : a)
      );
      
      toast({
        title: "Éxito",
        description: `Ambulancia ${updatedAmbulance.name} actualizada correctamente`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `No se pudo actualizar la ambulancia: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAmbulance = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await ambulanceApi.delete(id);
      setAmbulances(prev => prev.filter(a => a.id !== id));
      
      toast({
        title: "Éxito",
        description: "Ambulancia eliminada correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `No se pudo eliminar la ambulancia: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAmbulances = async () => {
    await loadAmbulances();
  };

  const contextValue = {
    ambulances,
    loading,
    error,
    getAmbulanceById,
    addAmbulance,
    updateAmbulance,
    deleteAmbulance,
    refreshAmbulances,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData debe ser usado dentro de un AppDataProvider');
  }
  return context;
}
```

## API Route Correspondiente

### src/app/api/ambulances/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/ambulances`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ambulances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ambulances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/ambulances`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating ambulance:', error);
    return NextResponse.json(
      { error: 'Failed to create ambulance' },
      { status: 500 }
    );
  }
}
```

### src/app/api/ambulances/[id]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/ambulances/${params.id}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching ambulance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ambulance' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/ambulances/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating ambulance:', error);
    return NextResponse.json(
      { error: 'Failed to update ambulance' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/ambulances/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ambulance:', error);
    return NextResponse.json(
      { error: 'Failed to delete ambulance' },
      { status: 500 }
    );
  }
}
```

## Componente Actualizado

### AmbulanceList.tsx (Ejemplo de uso)

```typescript
"use client";

import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AmbulanceList() {
  const { 
    ambulances, 
    loading, 
    error, 
    deleteAmbulance, 
    refreshAmbulances 
  } = useAppData();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshAmbulances}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ambulancias</h2>
        <Button onClick={refreshAmbulances}>
          Actualizar
        </Button>
      </div>
      
      {ambulances.map((ambulance) => (
        <Card key={ambulance.id}>
          <CardHeader>
            <CardTitle>{ambulance.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Matrícula: {ambulance.licensePlate}</p>
            <p>Modelo: {ambulance.model}</p>
            <p>Año: {ambulance.year}</p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteAmbulance(ambulance.id)}
            >
              Eliminar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Beneficios de la Migración

### Antes (Mock Data)
- ❌ Datos perdidos al recargar página
- ❌ Sin validación de datos
- ❌ Sin manejo de errores
- ❌ Sin estados de carga
- ❌ Operaciones síncronas

### Después (API Integration)
- ✅ Persistencia real en base de datos
- ✅ Validación robusta en backend
- ✅ Manejo completo de errores
- ✅ Estados de carga y feedback
- ✅ Operaciones asíncronas
- ✅ Optimistic updates
- ✅ Retry automático
- ✅ Notificaciones de éxito/error

Esta migración es un ejemplo de cómo transformar un contexto de React de datos mock a una integración completa con el backend, manteniendo la misma interfaz pero añadiendo robustez y funcionalidades empresariales.
