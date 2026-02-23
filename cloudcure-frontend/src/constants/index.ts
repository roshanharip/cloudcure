/**
 * Application Constants
 * Centralized configuration and constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY_BUFFER: 300, // 5 minutes in seconds
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

// User Roles (matching backend)
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'CloudCure',
  VERSION: '1.0.0',
  DESCRIPTION: 'Enterprise Healthcare Management System',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;
