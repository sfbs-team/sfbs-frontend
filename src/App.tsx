/**
 * src/App.tsx
 * Sprint 1 [Muhammad] — AFA Week VI: routing configuration + protected routes
 */
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store, useAppSelector } from './store'
import { Navbar, ProtectedRoute, RoleRoute, NotificationToast,
         LoginForm, RegisterForm } from './components'
import { HomePage, FacilitiesPage, BookingFormPage,
         MyBookingsPage, UnauthorizedPage, NotFoundPage, PaymentPage,
         OAuthCallback, AdminDashboard, StaffDashboard } from './pages'
import './i18n'
import './styles/index.css'

// Apply dark mode on load
const themeMode = localStorage.getItem('sfbs_theme')
if (themeMode === 'dark') document.documentElement.classList.add('dark')

// Apply text direction on load (Arabic = RTL). i18n persists language
// under the 'sfbs_lang' key (see src/i18n/index.ts).
const savedLang = localStorage.getItem('sfbs_lang')
if (savedLang === 'ar') {
  document.documentElement.setAttribute('dir', 'rtl')
  document.documentElement.setAttribute('lang', 'ar')
}

const AppShell = () => {
  const { mode, language } = useAppSelector(s => s.ui.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  useEffect(() => {
    // Arabic reads right-to-left; flip the document direction so the whole
    // layout mirrors. Other languages stay left-to-right.
    const dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', language)
  }, [language])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <NotificationToast />
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/auth/google/callback" element={<OAuthCallback />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/facilities/:facilityId/book" element={<BookingFormPage />} />
            <Route path="/bookings"                    element={<MyBookingsPage />} />
            <Route path="/bookings/:id/pay"            element={<PaymentPage />} />
          </Route>

          {/* Staff routes (staff + admin) */}
          <Route element={<RoleRoute allow={['staff', 'admin']} />}>
            <Route path="/staff" element={<StaffDashboard />} />
          </Route>

          {/* Admin routes (admin only) */}
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppShell />
    </Provider>
  )
}