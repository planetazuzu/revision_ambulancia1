import { apiService, ApiResponse } from '../api';
import type { ConsumableMaterial, NonConsumableMaterial } from '@/types';
import { MOCK_MODE } from '../mock-data';

// Mock data for materials
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

export interface CreateConsumableMaterialRequest {
  ambulanceId: string;
  name: string;
  reference?: string;
  quantity: number;
  expiryDate: string;
  storageLocation?: string;
  minStockLevel?: number;
}

export interface UpdateConsumableMaterialRequest extends Partial<CreateConsumableMaterialRequest> {
  id: string;
}

export interface CreateNonConsumableMaterialRequest {
  ambulanceId: string;
  name: string;
  serialNumber?: string;
  status: 'Operacional' | 'Necesita Reparación' | 'Fuera de Servicio';
  storageLocation?: string;
  minStockLevel?: number;
}

export interface UpdateNonConsumableMaterialRequest extends Partial<CreateNonConsumableMaterialRequest> {
  id: string;
}

export class MaterialsService {
  // Consumable Materials
  async getConsumableMaterials(ambulanceId?: string): Promise<ConsumableMaterial[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      return mockConsumableMaterials;
    }
    
    // Modo real: llamar al backend
    const endpoint = ambulanceId ? `/materials/consumable?ambulanceId=${ambulanceId}` : '/materials/consumable';
    const response = await apiService.get<ApiResponse<ConsumableMaterial[]>>(endpoint);
    return response.data;
  }

  async getConsumableMaterialById(id: string): Promise<ConsumableMaterial> {
    const response = await apiService.get<ApiResponse<ConsumableMaterial>>(`/materials/consumable/${id}`);
    return response.data;
  }

  async createConsumableMaterial(materialData: CreateConsumableMaterialRequest): Promise<ConsumableMaterial> {
    const response = await apiService.post<ApiResponse<ConsumableMaterial>>('/materials/consumable', materialData);
    return response.data;
  }

  async updateConsumableMaterial(id: string, materialData: UpdateConsumableMaterialRequest): Promise<ConsumableMaterial> {
    const response = await apiService.put<ApiResponse<ConsumableMaterial>>(`/materials/consumable/${id}`, materialData);
    return response.data;
  }

  async deleteConsumableMaterial(id: string): Promise<void> {
    await apiService.delete(`/materials/consumable/${id}`);
  }

  // Non-Consumable Materials
  async getNonConsumableMaterials(ambulanceId?: string): Promise<NonConsumableMaterial[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      return mockNonConsumableMaterials;
    }
    
    // Modo real: llamar al backend
    const endpoint = ambulanceId ? `/materials/non-consumable?ambulanceId=${ambulanceId}` : '/materials/non-consumable';
    const response = await apiService.get<ApiResponse<NonConsumableMaterial[]>>(endpoint);
    return response.data;
  }

  async getNonConsumableMaterialById(id: string): Promise<NonConsumableMaterial> {
    const response = await apiService.get<ApiResponse<NonConsumableMaterial>>(`/materials/non-consumable/${id}`);
    return response.data;
  }

  async createNonConsumableMaterial(materialData: CreateNonConsumableMaterialRequest): Promise<NonConsumableMaterial> {
    const response = await apiService.post<ApiResponse<NonConsumableMaterial>>('/materials/non-consumable', materialData);
    return response.data;
  }

  async updateNonConsumableMaterial(id: string, materialData: UpdateNonConsumableMaterialRequest): Promise<NonConsumableMaterial> {
    const response = await apiService.put<ApiResponse<NonConsumableMaterial>>(`/materials/non-consumable/${id}`, materialData);
    return response.data;
  }

  async deleteNonConsumableMaterial(id: string): Promise<void> {
    await apiService.delete(`/materials/non-consumable/${id}`);
  }

  // Bulk operations
  async importMaterials(file: File, ambulanceId: string): Promise<{
    consumable: ConsumableMaterial[];
    nonConsumable: NonConsumableMaterial[];
  }> {
    const response = await apiService.uploadFile<ApiResponse<{
      consumable: ConsumableMaterial[];
      nonConsumable: NonConsumableMaterial[];
    }>>('/materials/import', file, { ambulanceId });
    return response.data;
  }

  async exportMaterials(ambulanceId?: string): Promise<Blob> {
    const endpoint = ambulanceId ? `/materials/export?ambulanceId=${ambulanceId}` : '/materials/export';
    const response = await fetch(`${apiService['baseURL']}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${apiService['token']}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export materials');
    }
    
    return response.blob();
  }

  // Alerts and notifications
  async getExpiringMaterials(days: number = 7): Promise<ConsumableMaterial[]> {
    const response = await apiService.get<ApiResponse<ConsumableMaterial[]>>(`/materials/expiring?days=${days}`);
    return response.data;
  }

  async getLowStockMaterials(): Promise<{
    consumable: ConsumableMaterial[];
    nonConsumable: NonConsumableMaterial[];
  }> {
    const response = await apiService.get<ApiResponse<{
      consumable: ConsumableMaterial[];
      nonConsumable: NonConsumableMaterial[];
    }>>('/materials/low-stock');
    return response.data;
  }
}

export const materialsService = new MaterialsService();
