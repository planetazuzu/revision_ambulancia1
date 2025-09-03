// Export all services
export { apiService, ApiError } from '../api';
export { authService, AuthService } from './auth.service';
export { ambulancesService, AmbulancesService } from './ambulances.service';
export { materialsService, MaterialsService } from './materials.service';
export { reviewsService, ReviewsService } from './reviews.service';
export { inventoryService, InventoryService } from './inventory.service';

// Re-export types for convenience
export type { ApiResponse } from '../api';
export type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ChangePasswordRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest 
} from './auth.service';
export type { 
  CreateAmbulanceRequest, 
  UpdateAmbulanceRequest, 
  AmbulanceCheckInRequest 
} from './ambulances.service';
export type { 
  CreateConsumableMaterialRequest, 
  UpdateConsumableMaterialRequest,
  CreateNonConsumableMaterialRequest,
  UpdateNonConsumableMaterialRequest
} from './materials.service';
export type { 
  CreateMechanicalReviewRequest, 
  UpdateMechanicalReviewRequest,
  CreateCleaningLogRequest,
  UpdateCleaningLogRequest,
  CreateDailyVehicleCheckRequest,
  UpdateDailyVehicleCheckRequest
} from './reviews.service';
export type { 
  CreateInventoryLogRequest,
  CreateCentralInventoryLogRequest
} from './inventory.service';
