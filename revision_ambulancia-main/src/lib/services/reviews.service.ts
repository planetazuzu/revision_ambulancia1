import { apiService, ApiResponse } from '../api';
import type { MechanicalReview, CleaningLog, RevisionDiariaVehiculo } from '@/types';
import { MOCK_MODE } from '../mock-data';

// Mock data for reviews
const mockMechanicalReviews: MechanicalReview[] = [
  {
    id: 'rev-1',
    ambulanceId: 'amb001',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    kilometers: 10500,
    technician: 'Juan Pérez',
    items: [
      { id: 'item-1', name: 'Motor', status: 'ok', notes: 'Funcionamiento normal' },
      { id: 'item-2', name: 'Frenos', status: 'ok', notes: 'Sistema en buen estado' },
      { id: 'item-3', name: 'Luces', status: 'warning', notes: 'Faro derecho con luz tenue' }
    ],
    overallStatus: 'warning',
    notes: 'Revisar faro derecho en próxima revisión'
  },
  {
    id: 'rev-2',
    ambulanceId: 'amb002',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    kilometers: 22300,
    technician: 'María García',
    items: [
      { id: 'item-4', name: 'Motor', status: 'ok', notes: 'Funcionamiento óptimo' },
      { id: 'item-5', name: 'Frenos', status: 'ok', notes: 'Sistema perfecto' },
      { id: 'item-6', name: 'Luces', status: 'ok', notes: 'Todas funcionando' }
    ],
    overallStatus: 'ok',
    notes: 'Vehículo en perfecto estado'
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
  },
  {
    id: 'clean-2',
    ambulanceId: 'amb002',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    cleanedBy: 'Carlos Usuario',
    areas: ['Interior', 'Exterior'],
    products: ['Desinfectante'],
    notes: 'Limpieza exterior e interior'
  }
];

const mockDailyChecks: RevisionDiariaVehiculo[] = [
  {
    id: 'daily-1',
    ambulanceId: 'amb001',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    checkedBy: 'Carlos Usuario',
    items: [
      { id: 'daily-item-1', name: 'Combustible', status: 'ok', notes: 'Tanque lleno' },
      { id: 'daily-item-2', name: 'Luces', status: 'ok', notes: 'Todas funcionando' },
      { id: 'daily-item-3', name: 'Neumáticos', status: 'ok', notes: 'Presión correcta' }
    ],
    overallStatus: 'ok',
    notes: 'Vehículo en perfecto estado'
  },
  {
    id: 'daily-2',
    ambulanceId: 'amb002',
    date: new Date().toISOString(),
    checkedBy: 'Alicia Coordinadora',
    items: [
      { id: 'daily-item-4', name: 'Combustible', status: 'warning', notes: 'Tanque a la mitad' },
      { id: 'daily-item-5', name: 'Luces', status: 'ok', notes: 'Todas funcionando' },
      { id: 'daily-item-6', name: 'Neumáticos', status: 'ok', notes: 'Presión correcta' }
    ],
    overallStatus: 'warning',
    notes: 'Revisar combustible'
  }
];

export interface CreateMechanicalReviewRequest {
  ambulanceId: string;
  date: string;
  kilometers: number;
  technician: string;
  items: Array<{
    name: string;
    status: 'ok' | 'warning' | 'error';
    notes?: string;
  }>;
  overallStatus: 'ok' | 'warning' | 'error';
  notes?: string;
}

export interface CreateCleaningLogRequest {
  ambulanceId: string;
  date: string;
  cleanedBy: string;
  areas: string[];
  products: string[];
  notes?: string;
}

export interface CreateDailyCheckRequest {
  ambulanceId: string;
  date: string;
  checkedBy: string;
  items: Array<{
    name: string;
    status: 'ok' | 'warning' | 'error';
    notes?: string;
  }>;
  overallStatus: 'ok' | 'warning' | 'error';
  notes?: string;
}

export class ReviewsService {
  // Mechanical Reviews
  async getMechanicalReviews(ambulanceId?: string): Promise<MechanicalReview[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      if (ambulanceId) {
        return mockMechanicalReviews.filter(review => review.ambulanceId === ambulanceId);
      }
      return mockMechanicalReviews;
    }
    
    // Modo real: llamar al backend
    const endpoint = ambulanceId ? `/reviews/mechanical?ambulanceId=${ambulanceId}` : '/reviews/mechanical';
    const response = await apiService.get<ApiResponse<MechanicalReview[]>>(endpoint);
    return response.data;
  }

  async getMechanicalReviewById(id: string): Promise<MechanicalReview> {
    // En modo mock, buscar en datos mock
    if (MOCK_MODE) {
      const review = mockMechanicalReviews.find(rev => rev.id === id);
      if (!review) {
        throw new Error('Revisión mecánica no encontrada');
      }
      return review;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<MechanicalReview>>(`/reviews/mechanical/${id}`);
    return response.data;
  }

  async createMechanicalReview(reviewData: CreateMechanicalReviewRequest): Promise<MechanicalReview> {
    // En modo mock, simular creación
    if (MOCK_MODE) {
      const newReview: MechanicalReview = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        items: reviewData.items.map((item, index) => ({
          ...item,
          id: `item-${Date.now()}-${index}`
        }))
      };
      mockMechanicalReviews.unshift(newReview);
      return newReview;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.post<ApiResponse<MechanicalReview>>('/reviews/mechanical', reviewData);
    return response.data;
  }

  // Cleaning Logs
  async getCleaningLogs(ambulanceId?: string): Promise<CleaningLog[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      if (ambulanceId) {
        return mockCleaningLogs.filter(log => log.ambulanceId === ambulanceId);
      }
      return mockCleaningLogs;
    }
    
    // Modo real: llamar al backend
    const endpoint = ambulanceId ? `/reviews/cleaning?ambulanceId=${ambulanceId}` : '/reviews/cleaning';
    const response = await apiService.get<ApiResponse<CleaningLog[]>>(endpoint);
    return response.data;
  }

  async getCleaningLogById(id: string): Promise<CleaningLog> {
    // En modo mock, buscar en datos mock
    if (MOCK_MODE) {
      const log = mockCleaningLogs.find(clean => clean.id === id);
      if (!log) {
        throw new Error('Registro de limpieza no encontrado');
      }
      return log;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<CleaningLog>>(`/reviews/cleaning/${id}`);
    return response.data;
  }

  async createCleaningLog(logData: CreateCleaningLogRequest): Promise<CleaningLog> {
    // En modo mock, simular creación
    if (MOCK_MODE) {
      const newLog: CleaningLog = {
        ...logData,
        id: `clean-${Date.now()}`
      };
      mockCleaningLogs.unshift(newLog);
      return newLog;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.post<ApiResponse<CleaningLog>>('/reviews/cleaning', logData);
    return response.data;
  }

  // Daily Checks
  async getDailyChecks(ambulanceId?: string): Promise<RevisionDiariaVehiculo[]> {
    // En modo mock, devolver datos mock
    if (MOCK_MODE) {
      if (ambulanceId) {
        return mockDailyChecks.filter(check => check.ambulanceId === ambulanceId);
      }
      return mockDailyChecks;
    }
    
    // Modo real: llamar al backend
    const endpoint = ambulanceId ? `/reviews/daily-checks?ambulanceId=${ambulanceId}` : '/reviews/daily-checks';
    const response = await apiService.get<ApiResponse<RevisionDiariaVehiculo[]>>(endpoint);
    return response.data;
  }

  async getDailyCheckById(id: string): Promise<RevisionDiariaVehiculo> {
    // En modo mock, buscar en datos mock
    if (MOCK_MODE) {
      const check = mockDailyChecks.find(daily => daily.id === id);
      if (!check) {
        throw new Error('Revisión diaria no encontrada');
      }
      return check;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<RevisionDiariaVehiculo>>(`/reviews/daily-checks/${id}`);
    return response.data;
  }

  async createDailyCheck(checkData: CreateDailyCheckRequest): Promise<RevisionDiariaVehiculo> {
    // En modo mock, simular creación
    if (MOCK_MODE) {
      const newCheck: RevisionDiariaVehiculo = {
        ...checkData,
        id: `daily-${Date.now()}`,
        items: checkData.items.map((item, index) => ({
          ...item,
          id: `daily-item-${Date.now()}-${index}`
        }))
      };
      mockDailyChecks.unshift(newCheck);
      return newCheck;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.post<ApiResponse<RevisionDiariaVehiculo>>('/reviews/daily-checks', checkData);
    return response.data;
  }
}

export const reviewsService = new ReviewsService();