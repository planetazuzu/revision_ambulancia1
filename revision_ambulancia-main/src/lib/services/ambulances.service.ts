import { apiService, ApiResponse } from '../api';
import type { Ambulance } from '@/types';
import { MOCK_MODE, mockAmbulances } from '../mock-data';

export interface CreateAmbulanceRequest {
  name: string;
  licensePlate: string;
  model: string;
  year: number;
  lastKnownKilometers?: number;
}

export interface UpdateAmbulanceRequest extends Partial<CreateAmbulanceRequest> {
  id: string;
  dailyCheckCompleted?: boolean;
  mechanicalReviewCompleted?: boolean;
  cleaningCompleted?: boolean;
  inventoryCompleted?: boolean;
  lastDailyCheck?: string;
  lastMechanicalReview?: string;
  lastCleaning?: string;
  lastInventoryCheck?: string;
  lastCheckInDate?: string;
  lastCheckInByUserId?: string;
}

export interface AmbulanceCheckInRequest {
  kilometers: number;
  userId: string;
}

export class AmbulancesService {
  async getAll(): Promise<Ambulance[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      return mockAmbulances;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<Ambulance[]>>('/ambulances');
    return response.data;
  }

  async getById(id: string): Promise<Ambulance> {
    // En modo mock, buscar en datos mock
    if (MOCK_MODE) {
      const ambulance = mockAmbulances.find(amb => amb.id === id);
      if (!ambulance) {
        throw new Error('Ambulancia no encontrada');
      }
      return ambulance;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<Ambulance>>(`/ambulances/${id}`);
    return response.data;
  }

  async create(ambulanceData: CreateAmbulanceRequest): Promise<Ambulance> {
    const response = await apiService.post<ApiResponse<Ambulance>>('/ambulances', ambulanceData);
    return response.data;
  }

  async update(id: string, ambulanceData: UpdateAmbulanceRequest): Promise<Ambulance> {
    const response = await apiService.put<ApiResponse<Ambulance>>(`/ambulances/${id}`, ambulanceData);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/ambulances/${id}`);
  }

  async checkIn(id: string, checkInData: AmbulanceCheckInRequest): Promise<Ambulance> {
    const response = await apiService.post<ApiResponse<Ambulance>>(`/ambulances/${id}/check-in`, checkInData);
    return response.data;
  }

  async updateWorkflowStep(id: string, step: 'dailyCheck' | 'mechanical' | 'cleaning' | 'inventory', status: boolean): Promise<Ambulance> {
    const response = await apiService.patch<ApiResponse<Ambulance>>(`/ambulances/${id}/workflow`, {
      step,
      status
    });
    return response.data;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    pendingDailyCheck: number;
    pendingMechanicalReview: number;
    pendingCleaning: number;
    pendingInventory: number;
  }> {
    const response = await apiService.get<ApiResponse<any>>('/ambulances/stats');
    return response.data;
  }
}

export const ambulancesService = new AmbulancesService();
