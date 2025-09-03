// Mock data para cuentas de prueba y desarrollo
import type { User, Ambulance } from '@/types';

// Usuarios mock para testing
export const mockUsers: User[] = [
  { 
    id: 'userCoordinador', 
    name: 'Alicia Coordinadora', 
    email: 'alicia@ambureview.com',
    role: 'coordinador' 
  },
  { 
    id: 'amb001user', 
    name: 'Ambulancia 01', 
    email: 'amb001@ambureview.com',
    role: 'usuario',
    assignedAmbulanceId: 'amb001'
  },
  { 
    id: 'userGenerico', 
    name: 'Carlos Usuario', 
    email: 'carlos@ambureview.com',
    role: 'usuario' 
  },
  {
    id: 'adminUser',
    name: 'Admin Sistema',
    email: 'admin@ambureview.com',
    role: 'admin'
  }
];

// Ambulancias mock para testing
export const mockAmbulances: Ambulance[] = [
  { 
    id: 'amb001', 
    name: 'Ambulancia 01', 
    licensePlate: 'XYZ 123', 
    model: 'Mercedes Sprinter', 
    year: 2022, 
    dailyCheckCompleted: false, 
    mechanicalReviewCompleted: false, 
    cleaningCompleted: false, 
    inventoryCompleted: false, 
    lastMechanicalReview: new Date(Date.now() - 5*24*60*60*1000).toISOString(), 
    lastKnownKilometers: 10500, 
    lastCheckInDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(), 
    lastDailyCheck: new Date(Date.now() - 25*60*60*1000).toISOString() 
  },
  { 
    id: 'amb002', 
    name: 'Ambulancia 02', 
    licensePlate: 'ABC 789', 
    model: 'Ford Transit', 
    year: 2021, 
    dailyCheckCompleted: true, 
    lastDailyCheck: new Date().toISOString(), 
    mechanicalReviewCompleted: true, 
    cleaningCompleted: false, 
    inventoryCompleted: false, 
    lastCleaning: new Date(Date.now() - 2*24*60*60*1000).toISOString(), 
    lastKnownKilometers: 22300, 
    lastCheckInDate: new Date(Date.now() - 2*24*60*60*1000).toISOString()  
  },
  { 
    id: 'amb003', 
    name: 'Unidad Rápida B1', 
    licensePlate: 'DEF 456', 
    model: 'VW Crafter', 
    year: 2023, 
    dailyCheckCompleted: false, 
    mechanicalReviewCompleted: false, 
    cleaningCompleted: false, 
    inventoryCompleted: false, 
    lastKnownKilometers: 5200 
  }
];

// Configuración para modo mock
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || process.env.NODE_ENV === 'development';

// Función para obtener usuario mock por email
export function getMockUserByEmail(email: string): User | undefined {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Función para obtener usuario mock por nombre
export function getMockUserByName(name: string): User | undefined {
  return mockUsers.find(user => user.name.toLowerCase() === name.toLowerCase());
}

// Función para obtener ambulancia mock por ID
export function getMockAmbulanceById(id: string): Ambulance | undefined {
  return mockAmbulances.find(amb => amb.id === id);
}

// Función para obtener ambulancia mock por nombre
export function getMockAmbulanceByName(name: string): Ambulance | undefined {
  return mockAmbulances.find(amb => amb.name.toLowerCase() === name.toLowerCase());
}
