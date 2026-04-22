// Sprint 3 - Salma Essamiri: UI components, pages, API service, i18n, tests

/**
 * src/components/index.tsx
 * All shared components — Layout, Auth forms, Facility cards, Booking forms
 * Sprint 1 [Salma]   — AFA Week VI:   Basic views + routing
 * Sprint 2 [Muhammad]— AFA Week VIII: State management wired to components
 * Sprint 3 [Mohab]   — AFA Week XII:  i18n + themes applied
 */

import React, { useEffect, useState } from 'react'
import { Link, useNavigate, Navigate, Outlet } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { useAppDispatch, useAppSelector, loginThunk, registerThunk,
         logout, fetchFacilities, setFilter, createBookingThunk,
         cancelBookingThunk, fetchMyBookings, toggleTheme, setLanguage,
         addNotification, toggleSidebar } from '../store'
import type { Facility, Booking } from '../types'

// ── Spinner ───────────────────────────────────────────────────────────────── //
export const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

// ── Badge ─────────────────────────────────────────────────────────────────── //
const statusColors: Record<string, string> = {
  available:   'bg-green-100 text-green-800',
  booked:      'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  closed:      'bg-gray-100 text-gray-800',
  pending:     'bg-yellow-100 text-yellow-800',
  confirmed:   'bg-green-100 text-green-800',
  cancelled:   'bg-red-100 text-red-800',
  completed:   'bg-blue-100 text-blue-800',
}

export const Badge = ({ status }: { status: string }) => (
  <span className={clsx('px-2 py-1 rounded-full text-xs font-semibold capitalize', statusColors[status] ?? 'bg-gray-100')}>
    {status}
  </span>
)

// ── Button ────────────────────────────────────────────────────────────────── //
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  isLoading?: boolean
}
export const Button = ({ variant = 'primary', isLoading, children, className, ...props }: ButtonProps) => {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
  const variants = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700',
  }
  return (
    <button className={clsx(base, variants[variant], className)} disabled={isLoading} {...props}>
      {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────── //
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; error?: string
}
export const Input = ({ label, error, className, ...props }: InputProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input className={clsx(
      'px-3 py-2 border rounded-lg outline-none transition-colors',
      'dark:bg-gray-700 dark:border-gray-600 dark:text-white',
      error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary-500',
      className
    )} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

// ── Notification Toast ────────────────────────────────────────────────────── //
export const NotificationToast = () => {
  const dispatch     = useAppDispatch()
  const notifications = useAppSelector(s => s.ui.notifications)
  useEffect(() => {
    notifications.forEach(n => {
      const t = setTimeout(() => dispatch({ type: 'ui/removeNotification', payload: n.id }), 4000)
      return () => clearTimeout(t)
    })
  }, [notifications])
  const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-blue-500' }
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(n => (
        <div key={n.id} className={clsx('text-white px-4 py-3 rounded-lg shadow-lg max-w-sm', colors[n.type])}>
          {n.message}
        </div>
      ))}
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────── //
export const Navbar = () => {
  const { t, i18n } = useTranslation()
  const dispatch    = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector(s => s.auth)
  const { mode, language }        = useAppSelector(s => s.ui.theme)
  const navigate = useNavigate()

  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  return (
    <nav className="bg-sfbs-dark dark:bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
        🏟️ SFBS
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/"           className="hover:text-primary-300 transition-colors">{t('nav.home')}</Link>
        <Link to="/facilities" className="hover:text-primary-300 transition-colors">{t('nav.facilities')}</Link>
        {isAuthenticated && <Link to="/bookings" className="hover:text-primary-300 transition-colors">{t('nav.bookings')}</Link>}
        <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
        <select
          value={language}
          onChange={e => { dispatch(setLanguage(e.target.value as any)); i18n.changeLanguage(e.target.value) }}
          className="bg-white/10 text-white rounded px-2 py-1 text-sm border border-white/20"
        >
          <option value="en">EN</option>
          <option value="pl">PL</option>
          <option value="ar">AR</option>
        </select>
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">👤 {user?.username}</span>
            <Button variant="secondary" onClick={handleLogout} className="text-sm">{t('nav.logout')}</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost" className="text-white hover:bg-white/10">{t('nav.login')}</Button></Link>
            <Link to="/register"><Button className="text-sm">{t('nav.register')}</Button></Link>
          </div>
        )}
      </div>
    </nav>
  )
}

// ── Protected Route ───────────────────────────────────────────────────────── //
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAppSelector(s => s.auth)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// ── Facility Card ─────────────────────────────────────────────────────────── //
export const FacilityCard = ({ facility }: { facility: Facility }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const icons: Record<string, string> = {
    gym: '💪', football_pitch: '⚽', basketball_court: '🏀', tennis_court: '🎾',
    swimming_pool: '🏊', badminton_court: '🏸', volleyball_court: '🏐', multipurpose: '🏟️',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 flex items-center justify-between">
        <span className="text-4xl">{icons[facility.facility_type] ?? '🏟️'}</span>
        <Badge status={facility.status} />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{facility.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-3">{facility.facility_type.replace(/_/g,' ')} • {facility.environment}</p>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
          <span>👥 {t('facilities.capacity')}: {facility.capacity}</span>
          <span>💰 ${facility.hourly_rate}{t('facilities.per_hour')}</span>
        </div>
        {facility.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{facility.description}</p>}
        <Button
          className="w-full justify-center"
          disabled={facility.status !== 'available'}
          onClick={() => navigate(`/facilities/${facility.id}/book`)}
        >
          {t('facilities.book_now')}
        </Button>
      </div>
    </div>
  )
}

// ── Booking Card ──────────────────────────────────────────────────────────── //
export const BookingCard = ({ booking }: { booking: Booking }) => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const canCancel = ['pending', 'confirmed'].includes(booking.status)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Booking #{booking.id.slice(0,8)}…</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(booking.created_at).toLocaleDateString()}</p>
        </div>
        <Badge status={booking.status} />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
        <p>⏰ {new Date(booking.timeslot?.start_time).toLocaleString()} → {new Date(booking.timeslot?.end_time).toLocaleString()}</p>
        <p>💰 Total: <span className="font-semibold">${booking.total_amount}</span></p>
        {booking.notes && <p>📝 {booking.notes}</p>}
      </div>
      {canCancel && (
        <Button variant="danger" className="w-full justify-center text-sm"
          onClick={() => dispatch(cancelBookingThunk(booking.id))}>
          {t('booking.cancel')}
        </Button>
      )}
    </div>
  )
}

// ── Login Form ────────────────────────────────────────────────────────────── //
const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
})

export const LoginForm = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useAppSelector(s => s.auth)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: any) => {
    const result = await dispatch(loginThunk(data))
    if (loginThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Logged in successfully!' }))
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🏟️</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{t('auth.login_title')}</h1>
        </div>
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label={t('auth.username')} {...register('username')} error={errors.username?.message as string} />
          <Input label={t('auth.password')} type="password" {...register('password')} error={errors.password?.message as string} />
          <Button className="w-full justify-center" isLoading={isLoading}>{t('auth.login_btn')}</Button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">{t('nav.register')}</Link>
        </p>
      </div>
    </div>
  )
}

// ── Register Form ─────────────────────────────────────────────────────────── //
const registerSchema = z.object({
  username:   z.string().min(3, 'Min 3 characters'),
  email:      z.string().email('Valid email required'),
  password:   z.string().min(8, 'Min 8 characters'),
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  phone:      z.string().optional(),
})

export const RegisterForm = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useAppSelector(s => s.auth)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: any) => {
    const result = await dispatch(registerThunk(data))
    if (registerThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Account created! Please log in.' }))
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🏟️</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{t('auth.register_title')}</h1>
        </div>
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('auth.first_name')} {...register('first_name')} error={errors.first_name?.message as string} />
            <Input label={t('auth.last_name')}  {...register('last_name')}  error={errors.last_name?.message as string} />
          </div>
          <Input label={t('auth.username')} {...register('username')} error={errors.username?.message as string} />
          <Input label={t('auth.email')}    type="email" {...register('email')} error={errors.email?.message as string} />
          <Input label={t('auth.password')} type="password" {...register('password')} error={errors.password?.message as string} />
          <Input label={t('auth.phone')}    {...register('phone')} />
          <Button className="w-full justify-center" isLoading={isLoading}>{t('auth.register_btn')}</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  )
}
