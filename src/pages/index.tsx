/**
 * src/pages/index.tsx
 * All application pages
 * Sprint 1 [Salma]    — AFA Week VI:   Basic views with mock data + routing
 * Sprint 2 [Muhammad] — AFA Week VIII: Wired to Redux state
 * Sprint 3 [Muhammad] — AFA Week X:    Live API calls
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector, fetchFacilities, setFilter,
         fetchMyBookings, createBookingThunk, addNotification } from '../store'
import { facilityService, paymentService, bookingService } from '../services/api'
import type { Facility } from '../types'
import { Spinner, FacilityCard, BookingCard, Button, Input, Badge } from '../components'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useSearchParams } from 'react-router-dom'
import { getMeThunk } from '../store'


const stripePromise = loadStripe(
  (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY as string
)

// ── Home Page ─────────────────────────────────────────────────────────────── //
export const HomePage = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector(s => s.facilities)

  useEffect(() => { dispatch(fetchFacilities(true)) }, [])

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-sfbs-dark to-primary-800 text-white py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">{t('home.hero_title')}</h1>
        <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">{t('home.hero_subtitle')}</p>
        <Link to="/facilities">
          <Button className="text-lg px-8 py-3">{t('home.cta')}</Button>
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { icon: '⚡', title: 'home.feat_easy_title', desc: 'home.feat_easy_desc' },
        { icon: '🔒', title: 'home.feat_secure_title', desc: 'home.feat_secure_desc' },
        { icon: '📅', title: 'home.feat_realtime_title', desc: 'home.feat_realtime_desc' },
      ].map(f => (
        <div key={f.title} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <span className="text-4xl block mb-3">{f.icon}</span>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t(f.title)}</h3>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t(f.desc)}</p>
        </div>
     ))}
        </div>
      </section>

      {/* Available Facilities Preview */}
      {items.length > 0 && (
        <section className="py-8 px-6 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('home.available_now')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.slice(0, 3).map(f => <FacilityCard key={f.id} facility={f} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/facilities"><Button variant="secondary">{t('home.cta')}</Button></Link>
          </div>
        </section>
      )}
    </div>
  )
}

// ── Facilities Page ───────────────────────────────────────────────────────── //
export const FacilitiesPage = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const { items, isLoading, error, filter } = useAppSelector(s => s.facilities)

  useEffect(() => { dispatch(fetchFacilities(filter.available_only)) }, [filter.available_only])

  const filtered = items.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                        f.facility_type.includes(filter.search.toLowerCase())
    const matchEnv    = !filter.environment || f.environment === filter.environment
    const matchType   = !filter.type        || f.facility_type === filter.type
    return matchSearch && matchEnv && matchType
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('facilities.title')}</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            placeholder={t('facilities.search')}
            value={filter.search}
            onChange={e => dispatch(setFilter({ search: e.target.value }))}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:border-primary-500"
          />
          <select
            value={filter.environment ?? ''}
            onChange={e => dispatch(setFilter({ environment: e.target.value as any || undefined }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
          >
            <option value="">{t('facilities.filter_all')}</option>
            <option value="indoor">{t('facilities.filter_indoor')}</option>
            <option value="outdoor">{t('facilities.filter_outdoor')}</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={filter.available_only}
              onChange={e => dispatch(setFilter({ available_only: e.target.checked }))} />
            {t('facilities.filter_available')}
          </label>
        </div>

        {/* Results */}
        {isLoading && <Spinner />}
        {error     && <div className="text-center text-red-500 py-8">{error}</div>}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            <span className="text-5xl block mb-4">🏟️</span>
            <p>{t('facilities.no_results')}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(f => <FacilityCard key={f.id} facility={f} />)}
        </div>
      </div>
    </div>
  )
}

// ── Booking Form Page ─────────────────────────────────────────────────────── //
export const BookingFormPage = () => {
  const { t }           = useTranslation()
  const { facilityId }  = useParams<{ facilityId: string }>()
  const dispatch        = useAppDispatch()
  const navigate        = useNavigate()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [loading, setLoading]   = useState(true)
  const [totalCost, setTotalCost] = useState(0)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{
    start_time: string; end_time: string; notes: string
  }>()

  useEffect(() => {
    if (!facilityId) return
    facilityService.getById(facilityId)
      .then(setFacility)
      .catch(() => navigate('/facilities'))
      .finally(() => setLoading(false))
  }, [facilityId])

  const startTime = watch('start_time')
  const endTime   = watch('end_time')

  useEffect(() => {
    if (facility && startTime && endTime) {
      const hours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 3_600_000
      if (hours > 0) setTotalCost(Math.round(facility.hourly_rate * hours * 100) / 100)
    }
  }, [startTime, endTime, facility])

  const onSubmit = async (data: any) => {
    if (!facilityId) return
    const result = await dispatch(createBookingThunk({
      facility_id: facilityId,
      start_time:  new Date(data.start_time).toISOString(),
      end_time:    new Date(data.end_time).toISOString(),
      notes:       data.notes,
    }))
    if (createBookingThunk.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: t('booking.success') }))
      navigate('/bookings')
    } else {
      dispatch(addNotification({ type: 'error', message: result.payload as string || 'Booking failed' }))
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← {t('common.back')}</Button>

        {facility && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{facility.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize mt-1">
              {facility.facility_type.replace(/_/g,' ')} • {facility.environment}
            </p>
            <p className="text-primary-600 font-semibold mt-2">${facility.hourly_rate}/hr</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('booking.title')}</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t('booking.start_time')} type="datetime-local"
              {...register('start_time', { required: 'Start time required' })}
              error={errors.start_time?.message}
            />
            <Input
              label={t('booking.end_time')} type="datetime-local"
              {...register('end_time', { required: 'End time required' })}
              error={errors.end_time?.message}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('booking.notes')}</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:border-primary-500"
              />
            </div>
            {totalCost > 0 && (
              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('booking.total')}</span>
                <span className="text-2xl font-bold text-primary-600">${totalCost}</span>
              </div>
            )}
            <Button className="w-full justify-center" isLoading={isSubmitting}>{t('booking.confirm')}</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── My Bookings Page ──────────────────────────────────────────────────────── //
export const MyBookingsPage = () => {
  const { t }    = useTranslation()
  const dispatch = useAppDispatch()
  const { items, isLoading, error } = useAppSelector(s => s.bookings)

  useEffect(() => { dispatch(fetchMyBookings()) }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('booking.my_bookings')}</h1>
          <Link to="/facilities"><Button>{t('home.cta')}</Button></Link>
        </div>
        {isLoading && <Spinner />}
        {error     && <div className="text-center text-red-500 py-8">{error}</div>}
        {!isLoading && items.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            <span className="text-5xl block mb-4">📅</span>
            <p>{t('booking.no_bookings')}</p>
            <Link to="/facilities" className="mt-4 inline-block">
              <Button className="mt-4">{t('home.cta')}</Button>
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(b => <BookingCard key={b.id} booking={b} />)}
        </div>
      </div>
    </div>
  )
}

// ── Unauthorized Page ─────────────────────────────────────────────────────── //
export const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <span className="text-6xl block mb-4">🔒</span>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">You don't have permission to view this page.</p>
      <Link to="/"><Button>Go Home</Button></Link>
    </div>
  </div>
)

// ── Not Found Page ────────────────────────────────────────────────────────── //
export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <span className="text-8xl font-bold text-primary-600 block">404</span>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
      <Link to="/"><Button className="mt-4">Go Home</Button></Link>
    </div>
  </div>
)
// ─────────────────────────────────────────────────────────────────────────── //
//  PAYMENT PAGE                                                              //
// ─────────────────────────────────────────────────────────────────────────── //

function PaymentForm({ bookingId }: { bookingId: string }) {
  const { t }       = useTranslation()
  const stripe      = useStripe()
  const elements    = useElements()
  const dispatch    = useAppDispatch()
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [clientSecret, setCS]   = useState<string | null>(null)

  useEffect(() => {
    paymentService.createStripeIntent(bookingId)
      .then((payment) => setCS(payment.client_secret  ?? null))
      .catch((e: any) => setError(e.response?.data?.detail || 'Failed to initialise payment'))
  }, [bookingId])

  async function handlePay() {
    if (!stripe || !elements || !clientSecret) return
    setLoading(true)
    setError(null)
    const card = elements.getElement(CardElement)
    if (!card) { setLoading(false); return }
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    setLoading(false)
    if (result.error) {
      setError(result.error.message || 'Payment failed')
      dispatch(addNotification({ type: 'error',
        message: result.error.message || 'Payment failed' }))
    } else if (result.paymentIntent?.status === 'succeeded') {
      setSuccess(true)
      dispatch(addNotification({ type: 'success',
        message: 'Payment successful!' }))
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">Payment successful</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your booking is now confirmed. Check your email for the receipt.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6">Complete your payment</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Booking ID: <code>{bookingId.slice(0, 8)}...</code>
      </p>

      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color:    document.documentElement.classList.contains('dark')
                          ? '#fff' : '#1a202c',
              '::placeholder': { color: '#9ca3af' },
            },
            invalid: { color: '#ef4444' },
          },
        }} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border
                        border-red-200 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 mb-4">
        Test card: <code>4242 4242 4242 4242</code> · any future date · any CVC
      </p>

      <Button
        onClick={handlePay}
        isLoading={loading}
        disabled={!stripe || !clientSecret}
        className="w-full"
      >
        Pay now
      </Button>
    </div>
  )
}

export function PaymentPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <div className="p-8">Invalid booking</div>
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm bookingId={id} />
    </Elements>
  )
}

// ── OAuth Callback Page ───────────────────────────────────────────────────── //

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const dispatch       = useAppDispatch()
  const navigate       = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      dispatch(addNotification({ type: 'error', message: `Google login failed: ${error}` }))
      navigate('/login', { replace: true })
      return
    }

    if (!token) {
      dispatch(addNotification({ type: 'error', message: 'Google login failed: no token received' }))
      navigate('/login', { replace: true })
      return
    }

    // Store the token, then load the user profile
    localStorage.setItem('sfbs_token', token)
    dispatch(getMeThunk()).then((result) => {
      if (getMeThunk.fulfilled.match(result)) {
        localStorage.setItem('sfbs_user', JSON.stringify(result.payload))
        // Force a reload so Redux re-initialises auth state from localStorage
        window.location.href = '/'
      } else {
        localStorage.removeItem('sfbs_token')
        dispatch(addNotification({ type: 'error', message: 'Could not load your profile' }))
        navigate('/login', { replace: true })
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Spinner />
        <p className="text-gray-600 dark:text-gray-300 mt-4">Signing you in with Google…</p>
      </div>
    </div>
  )
}
// ── Admin Dashboard ───────────────────────────────────────────────────────── //
import type { Facility as FacilityT, Booking as BookingT } from '../types'

export const AdminDashboard = () => {
  const dispatch = useAppDispatch()
  const [facilities, setFacilities] = useState<FacilityT[]>([])
  const [bookings, setBookings]     = useState<BookingT[]>([])
  const [loading, setLoading]       = useState(true)
  const [offlineRef, setOfflineRef] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [facs, bks] = await Promise.all([
        facilityService.getAll(false),
        bookingService.getAllBookings(),
      ])
      setFacilities(facs)
      setBookings(bks)
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Failed to load admin data' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id: string, status: string) => {
    try {
      await facilityService.updateStatus(id, status)
      dispatch(addNotification({ type: 'success', message: `Facility set to ${status}` }))
      load()
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Failed to update status' }))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await facilityService.delete(id)
      dispatch(addNotification({ type: 'success', message: 'Facility deleted' }))
      load()
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Failed to delete facility' }))
    }
  }

  const handleConfirm = async (id: string) => {
    try {
      await bookingService.confirm(id)
      dispatch(addNotification({ type: 'success', message: 'Booking confirmed' }))
      load()
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Could not confirm (already processed?)' }))
    }
  }

  const handleApproveOffline = async () => {
    if (!offlineRef.trim()) return
    try {
      await paymentService.approveOfflinePayment(offlineRef.trim())
      dispatch(addNotification({ type: 'success', message: `Approved ${offlineRef}` }))
      setOfflineRef('')
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Could not approve payment' }))
    }
  }

  const pending = bookings.filter(b => b.status === 'pending')

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

        {/* Pending bookings */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Pending Bookings <span className="text-sm text-gray-500">({pending.length})</span>
          </h2>
          {pending.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No bookings awaiting confirmation.</p>
          ) : (
            <div className="space-y-3">
              {pending.map(b => (
                <div key={b.id} className="flex items-center justify-between border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold">Booking #{b.id.slice(0, 8)}…</p>
                    <p>{new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}</p>
                    <p>Total: ${b.total_amount}</p>
                  </div>
                  <Button className="text-sm" onClick={() => handleConfirm(b.id)}>Confirm</Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Facilities management */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Facilities</h2>
          <div className="space-y-3">
            {facilities.map(f => (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold">{f.name}</p>
                  <p className="capitalize">{f.facility_type.replace(/_/g, ' ')} • {f.environment} • ${f.hourly_rate}/hr</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={f.status} />
                  <select
                    value={f.status}
                    onChange={e => handleStatus(f.id, e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1"
                  >
                    <option value="available">available</option>
                    <option value="booked">booked</option>
                    <option value="maintenance">maintenance</option>
                    <option value="closed">closed</option>
                  </select>
                  <Button variant="danger" className="text-sm" onClick={() => handleDelete(f.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Offline payment approval */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Approve Offline Payment</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Enter the offline reference (e.g. OFFLINE-XXXXXXXX) provided when a customer requested to pay at reception.
          </p>
          <div className="flex gap-2">
            <input
              value={offlineRef}
              onChange={e => setOfflineRef(e.target.value)}
              placeholder="OFFLINE-XXXXXXXX"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:border-primary-500"
            />
            <Button onClick={handleApproveOffline}>Approve</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
// ── Staff Dashboard ───────────────────────────────────────────────────────── //
export const StaffDashboard = () => {
  const dispatch = useAppDispatch()
  const [bookings, setBookings] = useState<BookingT[]>([])
  const [loading, setLoading]   = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const all = await bookingService.getAllBookings()
      setBookings(all)
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Failed to load bookings' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleComplete = async (id: string) => {
    try {
      await bookingService.complete(id)
      dispatch(addNotification({ type: 'success', message: 'Marked as completed' }))
      load()
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Could not complete (only confirmed bookings can be completed)' }))
    }
  }

  const handleNoShow = async (id: string) => {
    try {
      await bookingService.noShow(id)
      dispatch(addNotification({ type: 'success', message: 'Marked as no-show' }))
      load()
    } catch {
      dispatch(addNotification({ type: 'error', message: 'Could not mark no-show (only confirmed bookings apply)' }))
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff — Check-in Desk</h1>
          <Button variant="secondary" className="text-sm" onClick={load}>Refresh</Button>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            All Bookings <span className="text-sm text-gray-500">({bookings.length})</span>
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No bookings in the system yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold">Booking #{b.id.slice(0, 8)}…</p>
                    <p>{new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}</p>
                    <p>Customer: {b.customer_id.slice(0, 8)}… • Total: ${b.total_amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={b.status} />
                    {b.status === 'confirmed' && (
                      <>
                        <Button className="text-sm" onClick={() => handleComplete(b.id)}>Complete</Button>
                        <Button variant="danger" className="text-sm" onClick={() => handleNoShow(b.id)}>No-show</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}