import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { notify } from '../lib/notifications'

const VEHICLE_TYPES = ['Motorbike', 'Pickup Truck', 'Van', 'Truck']

function TransporterRegistration() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [vehicleType, setVehicleType] = useState('')
  const [capacity, setCapacity] = useState('')
  const [coverageArea, setCoverageArea] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    setSubmitting(true)

    const { error: insertError } = await supabase.from('transporters').insert({
      user_id: user.id,
      vehicle_type: vehicleType,
      capacity_kg: Number(capacity),
      coverage_area: coverageArea,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      notify.success('Transporter profile created!')
      navigate('/logistics')
    }
  }

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-warm)]">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )

  if (!user) return navigate('/auth')

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      <header className="bg-[var(--color-primary-dark)] px-6 md:px-10 py-5">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-white">
          AgriMatch
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <button
          onClick={() => navigate('/role-switch')}
          className="mb-6 text-sm font-semibold text-[var(--color-charcoal)]/60 hover:text-[var(--color-primary)] transition-colors"
        >
          ← Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-charcoal)] mb-3">
            Transporter Profile
          </h1>
          <p className="text-[var(--color-charcoal)]/70 text-sm mb-8">
            Tell us about your vehicle and coverage area so farmers and buyers know who's handling their produce.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                Vehicle Type
              </label>
              <select
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              >
                <option value="">Select vehicle type</option>
                {VEHICLE_TYPES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                Carrying Capacity (kg)
              </label>
              <input
                type="number"
                required
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 500"
                className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                Coverage Area
              </label>
              <input
                type="text"
                required
                value={coverageArea}
                onChange={(e) => setCoverageArea(e.target.value)}
                placeholder="e.g. Techiman, Kumasi, Accra"
                className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-2 border-black/10 focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[var(--color-charcoal)]/70 leading-relaxed">
                I agree to AgriMatch's{' '}
                <Link to="/terms" className="text-[var(--color-primary)] font-bold hover:underline">
                  Terms and Conditions
                </Link>
                {' '}and confirm this information is accurate.
              </label>
            </div>

            {error && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Complete Registration'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  )
}

export default TransporterRegistration