/**
 * src/types/index.ts
 * Sprint 1 [Muhammad] — AFA: all shared TypeScript types
 */

import type { components } from './api'

// ── Auth ──────────────────────────────────────────────────────────────────── //
export interface User {
  id: string
  username: string
  email: string
  full_name: string
  role: 'customer' | 'admin' | 'staff'
  status: 'active' | 'inactive' | 'banned'
  loyalty_points: number
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

// ── Facilities ───────────────────────────────────────────────────────────── //
export type FacilityType =
  | 'football_pitch' | 'basketball_court' | 'tennis_court'
  | 'swimming_pool'  | 'gym'              | 'badminton_court'
  | 'volleyball_court' | 'multipurpose'

export type FacilityStatus = 'available' | 'booked' | 'maintenance' | 'closed'
export type Environment    = 'indoor' | 'outdoor'

export interface Facility {
  id: string
  name: string
  facility_type: FacilityType
  environment: Environment
  capacity: number
  hourly_rate: number
  status: FacilityStatus
  description: string
  amenities?: string[]
  has_ac?: boolean
  floor_area_sqm?: number
  has_floodlights?: boolean
  surface_type?: string
}

export interface FacilitiesState {
  items: Facility[]
  selected: Facility | null
  isLoading: boolean
  error: string | null
  filter: FacilityFilter
}

export interface FacilityFilter {
  type?: FacilityType
  environment?: Environment
  available_only: boolean
  search: string
}

// ── Bookings ─────────────────────────────────────────────────────────────── //
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

// Derived from the backend OpenAPI schema — cannot drift from the API.
// Regenerate with `npm run gen:types` after backend changes.
export type Booking = components['schemas']['BookingResponse'] & {
  facility?: Facility   // frontend-only convenience join, not sent by the API
}

export interface BookingCreate {
  facility_id: string
  start_time: string
  end_time: string
  notes?: string
}

export interface BookingsState {
  items: Booking[]
  isLoading: boolean
  error: string | null
}

// ── Payments ─────────────────────────────────────────────────────────────── //
export type PaymentMethod = 'card' | 'cash' | 'stripe' | 'loyalty_points'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  booking_id: string
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  transaction_ref?: string
  client_secret?: string
}

// ── UI ───────────────────────────────────────────────────────────────────── //
export interface ThemeState {
  mode: 'light' | 'dark'
  language: 'en' | 'pl' | 'ar'
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface UIState {
  notifications: Notification[]
  theme: ThemeState
  sidebarOpen: boolean
}

// ── API ──────────────────────────────────────────────────────────────────── //
export interface ApiError {
  detail: string
  status: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}
