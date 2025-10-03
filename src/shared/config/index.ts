// ⚙️ Configuración compartida entre Frontend y Backend
// AmbuReview - Sistema de Gestión de Ambulancias

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export const APP_CONFIG = {
  NAME: 'AmbuReview',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de Gestión de Ambulancias',
  AUTHOR: 'PlanetaZuzu',
} as const;

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  UPLOAD_PATH: '/uploads',
} as const;

export const NOTIFICATION_CONFIG = {
  AUTO_HIDE_DELAY: 5000,
  MAX_NOTIFICATIONS: 10,
  SOUND_ENABLED: true,
} as const;

export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  STORAGE_KEY: 'ambureview-theme',
} as const;

export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_ITEMS: 100,
} as const;

export const VALIDATION_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
} as const;

export const ROUTES = {
  // Frontend routes
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  AMBULANCES: '/dashboard/ambulances',
  INVENTORY: '/dashboard/inventory',
  REPORTS: '/dashboard/reports',
  SETTINGS: '/dashboard/settings',
  
  // API routes
  API: {
    AUTH: '/api/auth',
    AMBULANCES: '/api/ambulances',
    MATERIALS: '/api/materials',
    INVENTORY: '/api/inventory',
    REVIEWS: '/api/reviews',
    INCIDENTS: '/api/incidents',
    REPORTS: '/api/reports',
    NOTIFICATIONS: '/api/notifications',
  },
} as const;

export const PERMISSIONS = {
  ADMIN: ['*'],
  TECHNICIAN: [
    'ambulances:read',
    'ambulances:write',
    'materials:read',
    'materials:write',
    'inventory:read',
    'inventory:write',
    'reviews:read',
    'reviews:write',
    'incidents:read',
    'incidents:write',
  ],
  OPERATOR: [
    'ambulances:read',
    'materials:read',
    'inventory:read',
    'reviews:read',
    'incidents:read',
    'incidents:write',
  ],
  VIEWER: [
    'ambulances:read',
    'materials:read',
    'inventory:read',
    'reviews:read',
    'incidents:read',
  ],
} as const;

export const STATUS_COLORS = {
  active: 'green',
  maintenance: 'yellow',
  out_of_service: 'red',
  retired: 'gray',
  pending: 'blue',
  completed: 'green',
  failed: 'red',
  low: 'green',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;
