import { apiService, ApiResponse } from '../api';
import type { User } from '@/types';
import { MOCK_MODE, getMockUserByEmail, getMockUserByName, mockUsers } from '../mock-data';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'coordinador' | 'usuario';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // En modo mock, simular login con datos mock
    if (MOCK_MODE) {
      const mockUser = getMockUserByEmail(credentials.email);
      if (!mockUser) {
        throw new Error('Usuario no encontrado');
      }
      
      // Simular token mock
      const mockToken = `mock-token-${mockUser.id}-${Date.now()}`;
      apiService.setToken(mockToken);
      
      // Guardar usuario en localStorage para persistencia
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('accessToken', mockToken);
      }
      
      return {
        user: mockUser,
        token: mockToken
      };
    }
    
    // Modo real: llamar al backend
    const response = await apiService.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    if (response.success && response.data.token) {
      apiService.setToken(response.data.token);
    }
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiService.post<ApiResponse<User>>('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      if (MOCK_MODE) {
        // En modo mock, solo limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      } else {
        // Modo real: llamar al backend
        await apiService.post('/auth/logout');
      }
    } finally {
      apiService.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    // En modo mock, simular usuario actual
    if (MOCK_MODE) {
      // Primero intentar obtener del localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      }
      
      // Si no hay usuario en localStorage, verificar token
      const token = apiService['token'];
      if (!token || !token.startsWith('mock-token-')) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Extraer ID del usuario del token mock
      const userId = token.split('-')[2];
      const mockUser = mockUsers.find(user => user.id === userId);
      
      if (!mockUser) {
        throw new Error('Usuario no encontrado');
      }
      
      return mockUser;
    }
    
    // Modo real: llamar al backend
    const response = await apiService.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiService.post('/auth/change-password', data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiService.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiService.post('/auth/reset-password', data);
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await apiService.post<ApiResponse<LoginResponse>>('/auth/refresh');
    if (response.success && response.data.token) {
      apiService.setToken(response.data.token);
    }
    return response.data;
  }
}

export const authService = new AuthService();
