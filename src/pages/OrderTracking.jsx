import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const STATUS_STEPS = ['pending', 'confirmed', 'in_transit', 'delivered']

const STATUS_LABELS = {
  pending: 'Order Confirmed',
  confirmed: 'Harvest & Inspection',
  in_transit: 'Departed Hub',
  delivered: 'Arriving at Destination',
}

function OrderTracking() {
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { orderId } = useParams()

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return

      const { data, error } = await supabase
        .from('orders')
        .select('*, listings(crop_type, location, quantity, image_url, users(name))')
        .eq('id', orderId)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])

  if (loading) return <p className="p-10 text-center text-gray-500">Loading order...</p>
  if (error) return <p className="p-10 text-center text-red-500">Error: {error}</p>
  if (!user)
  if (!order) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Order not found.</p>
      <Link to="/buyer-orders" className="text-[#1B5E20] underline mt-2 inline-block font-semibold">Back to orders →</Link>
    </div>
  )

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F3F0]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-2xl sm:text-3xl font-bold text-[#1B5E20] flex-shrink-0">
              AgriMatch
            </Link>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <Link to="/buyer-orders" className="text-gray-600 hover:text-[#1B5E20] transition-colors font-semibold">
                ← Back to Orders
              </Link>
              <Link to="/marketplace" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-[#1B5E20] text-[#1B5E20]">Tracking</span>
              <Link to="/dashboard" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        {/* Header Info */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-3">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                Tracking your <span className="text-[#2E7D32]">harvest.</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-lg">
                Your order of {order.quantity}kg {order.listings?.crop_type} from {order.listings?.users?.name} is currently being processed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1B5E20] animate-pulse" />
              <span className="text-sm font-bold text-[#1B5E20] uppercase">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* Timeline */}
          <div className="md:col-span-2 space-y-6 relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-200" />
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStepIndex
              const active = i === currentStepIndex
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
                      done ? 'bg-[#1B5E20]' : active ? 'bg-[#1B5E20] animate-pulse' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {done ? '✓' : active ? '→' : ''}
                  </div>
                  <div className={done || active ? '' : 'opacity-50'}>
                    <p className="font-bold text-lg text-gray-900">{STATUS_LABELS[step]}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Shipment Details */}
          <div className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Shipment Details</h2>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Farmer</p>
                <p className="font-bold text-lg text-gray-900">{order.listings?.users?.name}</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Quantity</p>
                <p className="font-bold text-lg text-gray-900">{order.quantity} kg</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Pickup Location</p>
                <p className="font-bold text-lg text-gray-900">{order.listings?.location}</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Total Paid</p>
                <p className="font-bold text-lg text-[#1B5E20]">GH₵{Number(order.total_price).toLocaleString()}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-3">Produce</p>
                <div className="flex items-center gap-3">
                  <img
                    src={order.listings?.image_url}
                    alt={order.listings?.crop_type}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{order.listings?.crop_type}</p>
                    <p className="text-xs text-gray-600">Status: {order.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-gray-600 mt-12 sm:mt-16">
        <p className="font-bold text-gray-900 mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default OrderTracking