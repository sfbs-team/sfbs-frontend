/**
 * src/services/api.ts
 * Sprint 3 [Muhammad] — AFA Week X: API integration + interceptors
 * Axios instance with JWT auth, request/response interceptors,
 * automatic token refresh on 401, and error normalisation.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { TokenResponse, LoginCredentials, RegisterData, Facility, Booking, BookingCreate, Payment, User } from '../types'

// ── Base instance ─────────────────────────────────────────────────────────── //

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach JWT ──────────────────────────────────────── //

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('sfbs_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor — handle errors globally ────────────────────────── //

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and redirect to login
      localStorage.removeItem('sfbs_token')
      localStorage.removeItem('sfbs_user')
      window.location.href = '/login'
    }
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }
    return Promise.reject(error)
  },
)

// ── Auth endpoints ────────────────────────────────────────────────────────── //

export const authService = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>('/auth/login', credentials)
    localStorage.setItem('sfbs_token', data.access_token)
    localStorage.setItem('sfbs_user', JSON.stringify(data.user))
    return data
  },

  register: async (userData: RegisterData): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', userData)
    return data
  },

  logout: () => {
    localStorage.removeItem('sfbs_token')
    localStorage.removeItem('sfbs_user')
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  getGoogleLoginUrl: async (): Promise<{ authorization_url: string; state: string }> => {
    const { data } = await api.get('/auth/google/login')
    return data
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('sfbs_user')
    return stored ? JSON.parse(stored) : null
  },

  getToken: (): string | null => localStorage.getItem('sfbs_token'),
}

// ── Facility endpoints ────────────────────────────────────────────────────── //

export const facilityService = {
  getAll: async (availableOnly = false): Promise<Facility[]> => {
    const { data } = await api.get<Facility[]>('/facilities', {
      params: { available_only: availableOnly },
    })
    return data
  },

  getById: async (id: string): Promise<Facility> => {
    const { data } = await api.get<Facility>(`/facilities/${id}`)
    return data
  },

  create: async (facility: Partial<Facility>): Promise<Facility> => {
    const { data } = await api.post<Facility>('/facilities', facility)
    return data
  },

  updateStatus: async (id: string, status: string): Promise<Facility> => {
    const { data } = await api.patch<Facility>(`/facilities/${id}/status`, { status })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/facilities/${id}`)
  },
}

// ── Booking endpoints ─────────────────────────────────────────────────────── //

export const bookingService = {
  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await api.get<Booking[]>('/bookings')
    return data
  },

  getById: async (id: string): Promise<Booking> => {
    const { data } = await api.get<Booking>(`/bookings/${id}`)
    return data
  },

  create: async (booking: BookingCreate): Promise<Booking> => {
    const { data } = await api.post<Booking>('/bookings', booking)
    return data
  },

  cancel: async (id: string): Promise<void> => {
    await api.post(`/bookings/${id}/cancel`)
  },

  confirm: async (id: string): Promise<void> => {
    await api.post(`/bookings/${id}/confirm`)
  },
   getAllBookings: async (): Promise<Booking[]> => {
    const { data } = await api.get<Booking[]>('/bookings/all')
    return data
  },

  complete: async (id: string): Promise<void> => {
    await api.post(`/bookings/${id}/complete`)
  },

  noShow: async (id: string): Promise<void> => {
    await api.post(`/bookings/${id}/no-show`)
  },
}

// ── Payment endpoints ─────────────────────────────────────────────────────── //

export const paymentService = {
  createStripeIntent: async (bookingId: string): Promise<Payment> => {
    const { data } = await api.post<Payment>('/payments/stripe/create-intent', {
      booking_id: bookingId,
      payment_method: 'stripe',
    })
    return data
  },

  requestOfflinePayment: async (bookingId: string, amount: number) => {
    const { data } = await api.post('/payments/offline/request', {
      booking_id: bookingId,
      amount,
    })
    return data
  },

  approveOfflinePayment: async (offlineRef: string) => {
    const { data } = await api.post('/payments/offline/approve', {
      offline_ref: offlineRef,
    })
    return data
  },
}

export default api
