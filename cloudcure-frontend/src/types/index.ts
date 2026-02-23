/**
 * TypeScript Type Definitions
 */

import { ROLES } from '@/constants';
import { ReactElement } from 'react';

// User Types
export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  dashboardPreferences?: {
    layout?: unknown[];
    visibleWidgets?: string[];
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response Types
export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Route Types
export type LayoutType = 'auth' | 'main' | 'empty' | 'admin' | 'dashboard';

export interface RouteConfig {
  path: string;
  element: ReactElement;
  auth: boolean;
  permission?: string;
  layout: LayoutType;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  role?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Doctor Types
export interface Doctor {
  _id: string;
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorDto {
  userId: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
}

// Patient Types
export interface Patient {
  _id: string;
  id: string;
  userId: string;
  dateOfBirth: string;
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  address?: string;
  gender?: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  userId?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  gender?: string;
  address?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

// Medical Record Types
export interface MedicalRecord {
  _id: string;
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordDto {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  notes?: string;
}

// Prescription Types
export interface Prescription {
  _id: string;
  id: string;
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  instructions: string;
  validUntil: string;
  medicalRecord?: MedicalRecord;
  patient?: Patient;
  doctor?: Doctor;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface CreatePrescriptionDto {
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  instructions: string;
  validUntil: string;
}

// User Management Types
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  dashboardPreferences?: {
    layout?: unknown[];
    visibleWidgets?: string[];
  };
}

// Appointment Types
export type AppointmentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'terminated'
  | 'no-show';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Appointment {
  _id: string;
  id: string;
  patient?: Patient & { user?: User };
  doctor?: Doctor & { user?: User };
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: AppointmentStatus;
  consultationFee: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  doctorNotes?: string;
  prescription?: string | Prescription;
  actualDuration?: number;
  finalFee?: number;
  // Lifecycle timestamps
  startedAt?: string;
  endedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  patient: string;
  doctor: string;
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;
  consultationFee: number;
  notes?: string;
}

// Message Types
export interface Message {
  _id: string;
  id?: string;
  sender:
  | string
  | { _id: string; name: string; email: string };
  receiver:
  | string
  | { _id: string; name: string; email: string };
  content: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  appointmentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
