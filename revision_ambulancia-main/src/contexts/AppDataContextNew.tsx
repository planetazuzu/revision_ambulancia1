"use client";

import type { Ambulance, MechanicalReview, CleaningLog, ConsumableMaterial, NonConsumableMaterial, Alert, RevisionDiariaVehiculo, AmbulanceStorageLocation, USVBKit, USVBKitMaterial, InventoryLogEntry, InventoryLogAction, ChecklistItem, ChecklistItemStatus, AlertType, CentralInventoryLogEntry, ConfigurableMechanicalReviewItem } from '@/types';
import React, { createContext, useContext, useState, type ReactNode, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from './AuthContext';
import { useAmbulances } from '@/hooks/useAmbulances';
import { useMaterials } from '@/hooks/useMaterials';
import { reviewsService } from '@/lib/services';
import { inventoryService } from '@/lib/services';
import { toast } from '@/hooks/use-toast';

// --- USVB Kit Data Transformation ---
const rawUSVBKitData: { [key: number]: string[] } = {
  1: ["Mochila pediátrica"],  
  2: ["Mochila adulto"],  
  3: [
    "Kit de partos",
    "Kit de quemados",
    "Aspirador secreciones manual",
    "Nebulizador",
    "Botella urinaria"
  ],  
  4: [
    "Mascarillas FFP3 (4)",
    "Mascarillas quirúrgicas (1 caja)",
    "Gafas protectoras (4)",
    "Gorros protección (4)",
    "Batas protecciones desechables (10)",
    "Mascarillas FFP2 (1 caja)"
  ],  
  5: [
    "Glucagón (1)",
    "Insulina rápida (1)",
    "Diacepan rectal 5 mg (1)",
    "Diacepan rectal 10 mg (1)",
    "Suero fisiológico 500 ml (1)"
  ],  
  6: [
    "Manitol (1)",
    "Ringer lactato (1)",
    "Suero fisiológico 500 ml (1)"
  ],  
  7: [
    "Sonda de aspiración nº 6–16 (2)",
    "Sonda Yankauer (2)"
  ],  
  8: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  9: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  10: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  11: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  12: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  13: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  14: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  15: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  16: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  17: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  18: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  19: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ],  
  20: [
    "Mascarilla I-gel nº 1–2,5 (1)",
    "Mascarilla I-gel nº 3–5 (1)"
  ]
};

// Transform raw data into USVBKit objects
const transformUSVBKitData = (): USVBKit[] => {
  return Object.entries(rawUSVBKitData).map(([id, materials]) => ({
    id: parseInt(id),
    materials: materials.map((material, index) => ({
      id: `${id}-${index}`,
      name: material,
      quantity: 1,
      isPresent: true
    }))
  }));
};

// Mock data for development
const mockUSVBKits = transformUSVBKitData();

// Mock materials data
const mockConsumableMaterials: ConsumableMaterial[] = [
  {
    id: 'cons-1',
    name: 'Suero fisiológico 500ml',
    category: 'Medicamentos',
    currentStock: 15,
    minStock: 5,
    maxStock: 50,
    unit: 'unidades',
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    supplier: 'Farmacia Central',
    location: 'Estante A1'
  },
  {
    id: 'cons-2',
    name: 'Gasas estériles 10x10',
    category: 'Material sanitario',
    currentStock: 25,
    minStock: 10,
    maxStock: 100,
    unit: 'paquetes',
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    supplier: 'Suministros Médicos',
    location: 'Estante B2'
  }
];

const mockNonConsumableMaterials: NonConsumableMaterial[] = [
  {
    id: 'noncons-1',
    name: 'Estetoscopio',
    category: 'Instrumental',
    serialNumber: 'EST-001',
    purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    supplier: 'Equipos Médicos SL',
    location: 'Cajón 1',
    status: 'operativo'
  },
  {
    id: 'noncons-2',
    name: 'Tensiómetro digital',
    category: 'Instrumental',
    serialNumber: 'TEN-002',
    purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    warrantyExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    supplier: 'MedTech Solutions',
    location: 'Cajón 2',
    status: 'operativo'
  }
];

// Mock reviews and logs
const mockMechanicalReviews: MechanicalReview[] = [
  {
    id: 'rev-1',
    ambulanceId: 'amb001',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    kilometers: 10500,
    technician: 'Juan Pérez',
    items: [
      { id: 'item-1', name: 'Motor', status: 'ok' as ChecklistItemStatus, notes: 'Funcionamiento normal' },
      { id: 'item-2', name: 'Frenos', status: 'ok' as ChecklistItemStatus, notes: 'Sistema en buen estado' },
      { id: 'item-3', name: 'Luces', status: 'warning' as ChecklistItemStatus, notes: 'Faro derecho con luz tenue' }
    ],
    overallStatus: 'warning' as ChecklistItemStatus,
    notes: 'Revisar faro derecho en próxima revisión'
  }
];

const mockCleaningLogs: CleaningLog[] = [
  {
    id: 'clean-1',
    ambulanceId: 'amb001',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    cleanedBy: 'María García',
    areas: ['Interior', 'Exterior', 'Suelo'],
    products: ['Desinfectante', 'Detergente'],
    notes: 'Limpieza completa realizada'
  }
];

const mockDailyChecks: RevisionDiariaVehiculo[] = [
  {
    id: 'daily-1',
    ambulanceId: 'amb001',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    checkedBy: 'Carlos Usuario',
    items: [
      { id: 'daily-item-1', name: 'Combustible', status: 'ok' as ChecklistItemStatus, notes: 'Tanque lleno' },
      { id: 'daily-item-2', name: 'Luces', status: 'ok' as ChecklistItemStatus, notes: 'Todas funcionando' },
      { id: 'daily-item-3', name: 'Neumáticos', status: 'ok' as ChecklistItemStatus, notes: 'Presión correcta' }
    ],
    overallStatus: 'ok' as ChecklistItemStatus,
    notes: 'Vehículo en perfecto estado'
  }
];

// Context interface
interface AppDataContextType {
  // Ambulances
  ambulances: Ambulance[];
  selectedAmbulance: Ambulance | null;
  setSelectedAmbulance: (ambulance: Ambulance | null) => void;
  refreshAmbulances: () => Promise<void>;
  
  // Materials
  consumableMaterials: ConsumableMaterial[];
  nonConsumableMaterials: NonConsumableMaterial[];
  refreshMaterials: () => Promise<void>;
  
  // Reviews and logs
  mechanicalReviews: MechanicalReview[];
  cleaningLogs: CleaningLog[];
  dailyChecks: RevisionDiariaVehiculo[];
  
  // USVB Kits
  usvbKits: USVBKit[];
  
  // Inventory
  inventoryLogs: InventoryLogEntry[];
  centralInventoryLogs: CentralInventoryLogEntry[];
  
  // Alerts
  alerts: Alert[];
  
  // Actions
  addMechanicalReview: (review: Omit<MechanicalReview, 'id'>) => void;
  addCleaningLog: (log: Omit<CleaningLog, 'id'>) => void;
  addDailyCheck: (check: Omit<RevisionDiariaVehiculo, 'id'>) => void;
  addInventoryLog: (log: Omit<InventoryLogEntry, 'id'>) => void;
  addCentralInventoryLog: (log: Omit<CentralInventoryLogEntry, 'id'>) => void;
  updateMaterialStock: (materialId: string, newStock: number, action: InventoryLogAction) => void;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { ambulances, loading: ambulancesLoading, error: ambulancesError, refreshAmbulances } = useAmbulances();
  const { consumableMaterials, nonConsumableMaterials, loading: materialsLoading, error: materialsError, refreshMaterials } = useMaterials();
  
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [mechanicalReviews, setMechanicalReviews] = useState<MechanicalReview[]>(mockMechanicalReviews);
  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>(mockCleaningLogs);
  const [dailyChecks, setDailyChecks] = useState<RevisionDiariaVehiculo[]>(mockDailyChecks);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogEntry[]>([]);
  const [centralInventoryLogs, setCentralInventoryLogs] = useState<CentralInventoryLogEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // USVB Kits (static data)
  const usvbKits = mockUSVBKits;

  // Loading and error states
  const loading = ambulancesLoading || materialsLoading;
  const error = ambulancesError || materialsError;

  // Auto-select ambulance for users with assigned ambulance
  useEffect(() => {
    if (user?.assignedAmbulanceId && ambulances.length > 0) {
      const assignedAmbulance = ambulances.find(amb => amb.id === user.assignedAmbulanceId);
      if (assignedAmbulance) {
        setSelectedAmbulance(assignedAmbulance);
      }
    }
  }, [user, ambulances]);

  // Actions
  const addMechanicalReview = useCallback(async (review: Omit<MechanicalReview, 'id'>) => {
    try {
      const newReview = await reviewsService.createMechanicalReview(review);
      setMechanicalReviews(prev => [newReview, ...prev]);
      toast({
        title: "Revisión mecánica agregada",
        description: `Revisión del ${format(parseISO(review.date), 'dd/MM/yyyy', { locale: es })} agregada exitosamente.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar revisión mecánica",
        variant: "destructive"
      });
    }
  }, []);

  const addCleaningLog = useCallback(async (log: Omit<CleaningLog, 'id'>) => {
    try {
      const newLog = await reviewsService.createCleaningLog(log);
      setCleaningLogs(prev => [newLog, ...prev]);
      toast({
        title: "Registro de limpieza agregado",
        description: `Limpieza del ${format(parseISO(log.date), 'dd/MM/yyyy', { locale: es })} registrada exitosamente.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar registro de limpieza",
        variant: "destructive"
      });
    }
  }, []);

  const addDailyCheck = useCallback(async (check: Omit<RevisionDiariaVehiculo, 'id'>) => {
    try {
      const newCheck = await reviewsService.createDailyCheck(check);
      setDailyChecks(prev => [newCheck, ...prev]);
      toast({
        title: "Revisión diaria agregada",
        description: `Revisión del ${format(parseISO(check.date), 'dd/MM/yyyy', { locale: es })} registrada exitosamente.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar revisión diaria",
        variant: "destructive"
      });
    }
  }, []);

  const addInventoryLog = useCallback(async (log: Omit<InventoryLogEntry, 'id'>) => {
    try {
      const newLog = await inventoryService.createInventoryLog(log);
      setInventoryLogs(prev => [newLog, ...prev]);
      toast({
        title: "Registro de inventario agregado",
        description: "Registro de inventario creado exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar registro de inventario",
        variant: "destructive"
      });
    }
  }, []);

  const addCentralInventoryLog = useCallback(async (log: Omit<CentralInventoryLogEntry, 'id'>) => {
    try {
      const newLog = await inventoryService.createCentralInventoryLog(log);
      setCentralInventoryLogs(prev => [newLog, ...prev]);
      toast({
        title: "Registro de inventario central agregado",
        description: "Registro de inventario central creado exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al agregar registro de inventario central",
        variant: "destructive"
      });
    }
  }, []);

  const updateMaterialStock = useCallback((materialId: string, newStock: number, action: InventoryLogAction) => {
    // This would need to be implemented with the materials service
    console.log('Update material stock:', { materialId, newStock, action });
    toast({
      title: "Stock actualizado",
      description: `Stock del material actualizado a ${newStock} unidades.`,
    });
  }, []);

  const value: AppDataContextType = {
    // Ambulances
    ambulances,
    selectedAmbulance,
    setSelectedAmbulance,
    refreshAmbulances,
    
    // Materials
    consumableMaterials,
    nonConsumableMaterials,
    refreshMaterials,
    
    // Reviews and logs
    mechanicalReviews,
    cleaningLogs,
    dailyChecks,
    
    // USVB Kits
    usvbKits,
    
    // Inventory
    inventoryLogs,
    centralInventoryLogs,
    
    // Alerts
    alerts,
    
    // Actions
    addMechanicalReview,
    addCleaningLog,
    addDailyCheck,
    addInventoryLog,
    addCentralInventoryLog,
    updateMaterialStock,
    
    // Loading states
    loading,
    error
  };

  return (
    <AppDataContext.Provider value={value}>
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
