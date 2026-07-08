import { Link, useParams } from 'react-router-dom'
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
  if (!order) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Order not found.</p>
      <Link to="/buyer-orders" className="text-[var(--color-primary)] underline mt-2 inline-block">Back to orders →</Link>
    </div>
  )

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/dashboard" className="pb-1 border-b-2 border-[var(--color-primary)]">Dashboard</Link>
          <Link to="/logistics">Logistics</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <p className="text-xs text-gray-500">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2">
          <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">Tracking your harvest.</h1>
          <div className="text-left md:text-right">
            <p className="flex items-center gap-2 text-xs text-gray-500 md:justify-end">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              {order.status.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
        <p className="mt-3 text-gray-600 text-sm max-w-lg">
          Your order of {order.quantity}kg {order.listings?.crop_type} from{' '}
          {order.listings?.users?.name} is currently being processed.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-10">
          <div className="space-y-8 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />
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
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm ${
                      done ? 'bg-[var(--color-primary)]' : active ? 'bg-[var(--color-primary)] animate-pulse' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {done ? '✓' : active ? '→' : ''}
                  </div>
                  <div className={done || active ? '' : 'opacity-50'}>
                    <p className="font-[var(--font-heading)] text-lg">{STATUS_LABELS[step]}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-5">
              <h2 className="font-[var(--font-heading)] text-xl">Shipment Details</h2>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">FARMER</p>
                  <p className="font-medium">{order.listings?.users?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">QUANTITY</p>
                  <p className="font-medium">{order.quantity} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PICKUP LOCATION</p>
                  <p className="font-medium">{order.listings?.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">TOTAL PAID</p>
                  <p className="font-medium">GH₵{Number(order.total_price).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                <img
                  src={order.listings?.image_url}
                  alt={order.listings?.crop_type}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{order.listings?.crop_type}</p>
                  <p className="text-xs text-gray-500">Order status: {order.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default OrderTracking