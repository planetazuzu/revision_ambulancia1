import { apiService, ApiResponse } from '../api';
import type { InventoryLogEntry, CentralInventoryLogEntry, InventoryLogAction } from '@/types';
import { MOCK_MODE } from '../mock-data';

// Mock data for inventory
const mockInventoryLogs: InventoryLogEntry[] = [
  {
    id: 'inv-1',
    ambulanceId: 'amb001',
    materialId: 'cons-1',
    materialName: 'Suero fisiológico 500ml',
    action: 'consumo',
    quantity: 2,
    previousStock: 17,
    newStock: 15,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Carlos Usuario',
    notes: 'Consumo en servicio de emergencia'
  },
  {
    id: 'inv-2',
    ambulanceId: 'amb001',
    materialId: 'cons-2',
    materialName: 'Gasas estériles 10x10',
    action: 'reposicion',
    quantity: 10,
    previousStock: 15,
    newStock: 25,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    performedBy: 'María García',
    notes: 'Reposición de stock'
  }
];

const mockCentralInventoryLogs: CentralInventoryLogEntry[] = [
  {
    id: 'cent-1',
    materialId: 'cons-1',
    materialName: 'Suero fisiológico 500ml',
    action: 'entrada',
    quantity: 50,
    previousStock: 100,
    newStock: 150,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Alicia Coordinadora',
    supplier: 'Farmacia Central',
    notes: 'Entrada de stock central'
  },
  {
    id: 'cent-2',
    materialId: 'cons-2',
    materialName: 'Gasas estériles 10x10',
    action: 'salida',
    quantity: 20,
    previousStock: 200,
    newStock: 180,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    performedBy: 'Alicia Coordinadora',
    destination: 'Ambulancia 01',
    notes: 'Distribución a ambulancia'
  }
];

export interface CreateInventoryLogRequest {
  ambulanceId: string;
  materialId: string;
  materialName: string;
  action: InventoryLogAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy: string;
  notes?: string;
}

export interface CreateCentralInventoryLogRequest {
  materialId: string;
  materialName: string;
  action: InventoryLogAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  performedBy: string;
  supplier?: string;
  destination?: string;
  notes?: string;
}

export class InventoryService {
  // Inventory Logs
  async getInventoryLogs(ambulanceId?: string, materialId?: string): Promise<InventoryLogEntry[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      let filteredLogs = mockInventoryLogs;
      
      if (ambulanceId) {
        filteredLogs = filteredLogs.filter(log => log.ambulanceId === ambulanceId);
      }
      
      if (materialId) {
        filteredLogs = filteredLogs.filter(log => log.materialId === materialId);
      }
      
      return filteredLogs;
    }
    
    // Modo real: llamar al backend
    const params = new URLSearchParams();
    if (ambulanceId) params.append('ambulanceId', ambulanceId);
    if (materialId) params.append('materialId', materialId);
    
    const endpoint = `/inventory/logs${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<ApiResponse<InventoryLogEntry[]>>(endpoint);
    return response.data;
  }

  async getInventoryLogById(id: string): Promise<InventoryLogEntry> {
    // En modo mock, buscar en datos mock
    if (MOCK_MODE) {
      const log = mockInventoryLogs.find(inv => inv.id === id);
      if (!log) {
        throw new Error('Registro de inventario no encontrado');
      }
      return log;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<InventoryLogEntry>>(`/inventory/logs/${id}`);
    return response.data;
  }

  async createInventoryLog(logData: CreateInventoryLogRequest): Promise<InventoryLogEntry> {
    // En modo mock, simular creación
    if (MOCK_MODE) {
      const newLog: InventoryLogEntry = {
        ...logData,
        id: `inv-${Date.now()}`,
        date: new Date().toISOString()
      };
      mockInventoryLogs.unshift(newLog);
      return newLog;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.post<ApiResponse<InventoryLogEntry>>('/inventory/logs', logData);
    return response.data;
  }

  // Central Inventory Logs
  async getCentralInventoryLogs(): Promise<CentralInventoryLogEntry[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      return mockCentralInventoryLogs;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<CentralInventoryLogEntry[]>>('/inventory/central');
    return response.data;
  }

  async getCentralInventoryLogById(id: string): Promise<CentralInventoryLogEntry> {
    // En modo mock, buscar en datos mock
    if (MOCK_MODE) {
      const log = mockCentralInventoryLogs.find(cent => cent.id === id);
      if (!log) {
        throw new Error('Registro de inventario central no encontrado');
      }
      return log;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<CentralInventoryLogEntry>>(`/inventory/central/${id}`);
    return response.data;
  }

  async createCentralInventoryLog(logData: CreateCentralInventoryLogRequest): Promise<CentralInventoryLogEntry> {
    // En modo mock, simular creación
    if (MOCK_MODE) {
      const newLog: CentralInventoryLogEntry = {
        ...logData,
        id: `cent-${Date.now()}`,
        date: new Date().toISOString()
      };
      mockCentralInventoryLogs.unshift(newLog);
      return newLog;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.post<ApiResponse<CentralInventoryLogEntry>>('/inventory/central', logData);
    return response.data;
  }

  // Utility methods
  async updateMaterialStock(
    materialId: string, 
    newStock: number, 
    action: InventoryLogAction,
    ambulanceId?: string,
    performedBy?: string
  ): Promise<void> {
    // En modo mock, simular actualización
    if (MOCK_MODE) {
      console.log('Update material stock:', { materialId, newStock, action, ambulanceId, performedBy });
      return;
    }
    
    // Modo real: llamar al backend
    await apiService.post('/inventory/update-stock', {
      materialId,
      newStock,
      action,
      ambulanceId,
      performedBy
    });
  }
}

export const inventoryService = new InventoryService();