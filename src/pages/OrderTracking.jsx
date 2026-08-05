import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import ReviewModal from '../components/ReviewModal'

const STATUS_STEPS = ['pending', 'confirmed', 'in_transit', 'delivered']

const STATUS_LABELS = {
  pending: 'Order Confirmed',
  confirmed: 'Harvest & Inspection',
  in_transit: 'Departed Hub',
  delivered: 'Arriving at Destination',
}

const STATUS_COLORS = {
  pending: 'text-[var(--color-secondary-dark)]',
  confirmed: 'text-[var(--color-secondary-dark)]',
  in_transit: 'text-[var(--color-secondary)]',
  delivered: 'text-[var(--color-primary)]',
  completed: 'text-[var(--color-primary)]',
}

const STATUS_DOT = {
  pending: 'bg-[var(--color-secondary-dark)] animate-pulse',
  confirmed: 'bg-[var(--color-secondary-dark)] animate-pulse',
  in_transit: 'bg-[var(--color-secondary)] animate-pulse',
  delivered: 'bg-[var(--color-primary)]',
  completed: 'bg-[var(--color-primary)]',
}

function OrderTracking() {
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const [order, setOrder] = useState(null)
  const [transporter, setTransporter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const { orderId } = useParams()

  const fetchOrder = async () => {
    if (!orderId) return

    const { data, error } = await supabase
      .from('orders')
      .select('*, listings(crop_type, location, quantity, image_url, users(name))')
      .eq('id', orderId)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setOrder(data)

    if (data.transporter_id) {
      const { data: tData } = await supabase
        .from('transporters')
        .select('vehicle_type, capacity_kg, users(name)')
        .eq('user_id', data.transporter_id)
        .maybeSingle()
      setTransporter(tData)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

 if (loading) return <p className="p-10 text-center text-[var(--color-charcoal)]/60">Loading order...</p>
  if (error) return <p className="p-10 text-center text-red-500">Error: {error}</p>
  if (!order) return (
    <div className="p-10 text-center">
      <p className="text-[var(--color-charcoal)]/60">Order not found.</p>
      <Link to="/buyer-orders" className="text-[var(--color-primary)] underline mt-2 inline-block font-semibold">Back to orders →</Link>
    </div>
  )

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  const handleConfirmDelivery = async () => {
    await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id)
    setOrder((prev) => ({ ...prev, status: 'completed' }))
    setShowReviewModal(true)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      {/* Header */}
      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <Link to="/buyer-orders" className="text-white/80 hover:text-white transition-colors font-semibold">
                ← Back to Orders
              </Link>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-white text-white">Tracking</span>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        {/* Header Info */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-3">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-2">
                Tracking your <span className="text-[var(--color-primary)] italic">harvest.</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-lg">
  Your order of {order.quantity}kg {order.listings?.crop_type} from {order.listings?.users?.name} is currently {order.status === 'delivered' || order.status === 'completed' ? 'delivered.' : 'being processed.'}
</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[order.status] || 'bg-[var(--color-charcoal)]/30'}`} />
              <span className={`text-sm font-bold uppercase ${STATUS_COLORS[order.status] || 'text-[var(--color-charcoal)]/60'}`}>{order.status}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* Timeline */}
          <div className="md:col-span-2 space-y-6 relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-black/10" />
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStepIndex || order.status === 'completed'
              const active = i === currentStepIndex && order.status !== 'completed'
              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative flex gap-4"
                >
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${
                      done ? 'bg-[var(--color-primary)]' : active ? 'bg-[var(--color-primary)] animate-pulse' : 'bg-black/10 text-[var(--color-charcoal)]/50'
                    }`}
                  >
                    {done ? '✓' : active ? '→' : ''}
                  </div>
                  <div className={done || active ? '' : 'opacity-50'}>
                    <p className="font-bold text-lg text-[var(--color-charcoal)]">{STATUS_LABELS[step]}</p>
                    {step === 'in_transit' && order.pickup_photo_url && (i < currentStepIndex || active || order.status === 'completed') && (
                      <a href={order.pickup_photo_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                        <img src={order.pickup_photo_url} alt="Pickup confirmation" className="w-24 h-24 rounded-lg object-cover border-2 border-black/10" />
                      </a>
                    )}
                    {step === 'delivered' && order.delivery_photo_url && (done || order.status === 'completed') && (
                      <a href={order.delivery_photo_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                        <img src={order.delivery_photo_url} alt="Delivery confirmation" className="w-24 h-24 rounded-lg object-cover border-2 border-black/10" />
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Shipment Details */}
          <div className="bg-white rounded-lg sm:rounded-xl p-6 shadow-sm">
            <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-6">Shipment Details</h2>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-2">Farmer</p>
                <p className="font-bold text-lg text-[var(--color-charcoal)]">{order.listings?.users?.name}</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-2">Transporter</p>
                {transporter ? (
                  <div>
                    <p className="font-bold text-lg text-[var(--color-charcoal)]">{transporter.users?.name}</p>
                    <p className="text-sm text-[var(--color-charcoal)]/60">{transporter.vehicle_type} · {transporter.capacity_kg}kg capacity</p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-charcoal)]/50">Not yet assigned</p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-2">Quantity</p>
                <p className="font-bold text-lg text-[var(--color-charcoal)]">{order.quantity} kg</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-2">Pickup Location</p>
                <p className="font-bold text-lg text-[var(--color-charcoal)]">{order.listings?.location}</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-2">Total Paid</p>
                <p className="font-[var(--font-heading)] font-bold text-lg text-[var(--color-secondary)]">GH₵{Number(order.total_price).toLocaleString()}</p>
              </div>

              <div className="border-t border-black/10 pt-6">
  {order.status === 'delivered' && (
    <button
      onClick={handleConfirmDelivery}
      className="w-full mb-4 bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:brightness-95 transition-all"
    >
      Confirm Delivery Received
    </button>
  )}
  {order.status === 'completed' && (
    <button
      onClick={() => setShowReviewModal(true)}
      className="w-full mb-4 border-2 border-[var(--color-primary)] text-[var(--color-primary)] py-3 rounded-lg font-bold hover:bg-[var(--color-primary)]/5 transition-all"
    >
      Leave a Review
    </button>
  )}
  <p className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-3">Produce</p>
                <div className="flex items-center gap-3">
                  <img
                    src={order.listings?.image_url}
                    alt={order.listings?.crop_type}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-bold text-[var(--color-charcoal)]">{order.listings?.crop_type}</p>
                    <p className="text-xs text-[var(--color-charcoal)]/60">Status: {order.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showReviewModal && user && (
        <ReviewModal
          order={order}
          buyer={user}
          farmerName={order.listings?.users?.name}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false)
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default OrderTracking