import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrentUser } from '../lib/useCurrentUser'
import { findFulfillment, createPooledOrder } from '../lib/pooling'
import { notify } from '../lib/notifications'

const CROP_TYPES = ['Tomatoes', 'Peppers', 'Garden Eggs', 'Okra']

function BulkOrderRequest() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [cropType, setCropType] = useState('Tomatoes')
  const [quantity, setQuantity] = useState('')
  const [deadline, setDeadline] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setSearching(true)

    const res = await findFulfillment(cropType, Number(quantity), deadline)

    setSearching(false)

    if (res.error) {
      setError(res.error)
    } else {
      setResult(res)
    }
  }

  const handleConfirm = async () => {
    if (!result || !user) return
    setConfirming(true)

    const { error: confirmError, orders } = await createPooledOrder(
      user.id,
      cropType,
      Number(quantity),
      deadline,
      result.fulfillment
    )

    setConfirming(false)

    if (confirmError) {
      notify.error('Failed to create pooled order')
      setError(confirmError)
    } else {
      notify.success(`Pooled order created! ${orders.length} farmer(s) will fulfill your request.`)
      navigate('/buyer-orders')
    }
  }

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-warm)]">
      <p className="text-[var(--color-charcoal)]/60">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-[var(--color-charcoal)]/60">Please log in to request a bulk order.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block font-semibold">Go to Login</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-primary-dark)] backdrop-blur-sm border-b border-black/10">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-white">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <Link to="/marketplace" className="text-white/70 hover:text-white transition-colors">Marketplace</Link>
          <Link to="/buyer-orders" className="text-white/70 hover:text-white transition-colors">My Orders</Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16">
        <Link to="/marketplace" className="text-sm font-semibold text-[var(--color-charcoal)]/60 hover:text-[var(--color-primary)] transition-colors">
          ← Back to Marketplace
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6"
        >
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-charcoal)] mb-3">
            Request a Bulk Order
          </h1>
          <p className="text-[var(--color-charcoal)]/70 mb-8">
            Tell us what you need — we'll pool produce from multiple verified farmers to fulfill your order, even if no single farmer has enough on their own.
          </p>

          {!result ? (
            <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                  Crop Type
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  {CROP_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                  Quantity Needed (kg)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500"
                  className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                  Needed By
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full border-2 border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              {error && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={searching}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {searching ? 'Searching...' : 'Find Farmers to Fulfill This'}
              </button>
            </form>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-2">
                {result.fullyFulfilled ? 'Order Can Be Fulfilled' : 'Partial Match Found'}
              </h2>
              <p className="text-sm text-[var(--color-charcoal)]/60 mb-6">
                {result.totalAllocated}kg of {quantity}kg {cropType} available
                {!result.fullyFulfilled && ` — ${result.shortfall}kg short`}
              </p>

              {result.fulfillment.length === 0 ? (
                <p className="text-sm text-[var(--color-charcoal)]/50 py-6 text-center">
                  No farmers currently have this crop available. Try a different crop or check back later.
                </p>
              ) : (
                <div className="space-y-3 mb-6">
                  {result.fulfillment.map((item, i) => (
                    <div key={i} className="bg-[var(--color-surface)] rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-charcoal)]">{item.listing.users?.name}</p>
                        <p className="text-xs text-[var(--color-charcoal)]/60">{item.listing.location}</p>
                      </div>
                      <p className="font-bold text-[var(--color-secondary)]">{item.quantityAllocated}kg</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setResult(null); setError(null) }}
                  className="flex-1 border-2 border-black/10 py-2.5 rounded-lg font-semibold text-[var(--color-charcoal)]/70 hover:bg-black/5 transition-all"
                >
                  Search Again
                </button>
                {result.fulfillment.length > 0 && (
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex-1 bg-[var(--color-primary)] text-white py-2.5 rounded-lg font-semibold hover:brightness-95 disabled:opacity-60 transition-all"
                  >
                    {confirming ? 'Creating...' : 'Confirm Pooled Order'}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default BulkOrderRequest