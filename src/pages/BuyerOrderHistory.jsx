import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function BuyerOrderHistory() {
  const { user, loading: userLoading } = useCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMyOrders() {
      if (!user) return
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, listings(crop_type, location, quantity, image_url, users(name))')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchMyOrders()
  }, [user])

  if (userLoading) return <p className="p-10 text-center text-gray-500">Loading...</p>
  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in to see your orders.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block">Go to Login</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-[var(--color-primary)] transition-colors font-semibold"
          >
            ← Back
          </button>
          <Link to="/marketplace">Marketplace</Link>
          <span className="pb-1 border-b-2 border-[var(--color-primary)]">My Orders</span>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/logistics">Logistics</Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline">Logged in as {user?.name}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">Your Orders</h1>
        <p className="mt-2 text-gray-600 text-sm max-w-md">
          Track all your produce orders and their delivery status.
        </p>

        {loading && <p className="mt-12 text-center text-gray-500">Loading orders...</p>}
        {error && <p className="mt-12 text-center text-red-500">Error: {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">You haven't placed any orders yet.</p>
            <Link to="/marketplace" className="text-[var(--color-primary)] underline mt-2 inline-block">
              Browse marketplace →
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={order.listings?.image_url}
                      alt={order.listings?.crop_type}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-[var(--font-heading)] text-lg">{order.listings?.crop_type}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.quantity}kg · GH₵{Number(order.total_price).toLocaleString()} · From {order.listings?.users?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                      <span className="text-sm font-medium capitalize">{order.status}</span>
                    </div>
                    <Link
                      to={`/tracking/${order.id}`}
                      className="text-xs text-[var(--color-primary)] underline hover:no-underline"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default BuyerOrderHistory