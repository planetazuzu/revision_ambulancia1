// 🚑 Tipos compartidos entre Frontend y Backend
// AmbuReview - Sistema de Gestión de Ambulancias

// 👤 Usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  TECHNICIAN = 'technician',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

// 🚑 Ambulancia
export interface Ambulance {
  id: string;
  plateNumber: string;
  model: string;
  year: number;
  mileage: number;
  status: AmbulanceStatus;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AmbulanceStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  RETIRED = 'retired'
}

// 📦 Material
export interface Material {
  id: string;
  name: string;
  description?: string;
  category: MaterialCategory;
  unit: string;
  minStock: number;
  currentStock: number;
  price?: number;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
}

// 📋 Checklist
export interface Checklist {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  description: string;
  isRequired: boolean;
  category: string;
  order: number;
}

// 🔍 Revisión
export interface Review {
  id: string;
  ambulanceId: string;
  checklistId: string;
  performedBy: string;
  performedAt: Date;
  status: ReviewStatus;
  notes?: string;
  items: ReviewItem[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ReviewItem {
  id: string;
  checklistItemId: string;
  isChecked: boolean;
  notes?: string;
  photos?: string[];
}

// 🧹 Limpieza
export interface Cleaning {
  id: string;
  ambulanceId: string;
  performedBy: string;
  performedAt: Date;
  type: CleaningType;
  products: string[];
  notes?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum CleaningType {
  DAILY = 'daily',
  DEEP = 'deep',
  DISINFECTION = 'disinfection',
  MAINTENANCE = 'maintenance'
}

// 📊 Inventario
export interface InventoryItem {
  id: string;
  ambulanceId: string;
  materialId: string;
  quantity: number;
  location: string;
  lastChecked: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 🚨 Incidente
export interface Incident {
  id: string;
  ambulanceId: string;
  reportedBy: string;
  reportedAt: Date;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  status: IncidentStatus;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum IncidentType {
  MECHANICAL = 'mechanical',
  ELECTRICAL = 'electrical',
  MEDICAL_EQUIPMENT = 'medical_equipment',
  SAFETY = 'safety',
  OTHER = 'other'
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum IncidentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// 📈 Reporte
export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  data: any;
  generatedBy: string;
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
}

export enum ReportType {
  MAINTENANCE = 'maintenance',
  INVENTORY = 'inventory',
  INCIDENTS = 'incidents',
  CLEANING = 'cleaning',
  COMPLIANCE = 'compliance'
}

// 🔔 Notificación
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  data?: any;
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  MAINTENANCE_DUE = 'maintenance_due',
  LOW_STOCK = 'low_stock',
  INCIDENT_REPORTED = 'incident_reported',
  REVIEW_COMPLETED = 'review_completed',
  SYSTEM_ALERT = 'system_alert'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// 📊 Respuesta de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 🔍 Filtros y búsqueda
export interface SearchFilters {
  query?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 📊 Estadísticas
export interface DashboardStats {
  totalAmbulances: number;
  activeAmbulances: number;
  maintenanceDue: number;
  lowStockItems: number;
  openIncidents: number;
  pendingReviews: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user: string;
  ambulance?: string;
}
