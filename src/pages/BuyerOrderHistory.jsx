import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function BuyerOrderHistory() {
  const navigate = useNavigate()
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

  if (userLoading) return (
    <div className="p-10 text-center text-gray-500">
      <p>Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in to see your orders.</p>
      <Link to="/auth" className="text-[#1B5E20] underline mt-2 inline-block font-semibold">Go to Login</Link>
    </div>
  )

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
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-[#1B5E20] transition-colors font-semibold"
              >
                ← Back
              </button>
              <Link to="/marketplace" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-[#1B5E20] text-[#1B5E20]">My Orders</span>
              <Link to="/dashboard" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                {user?.name}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-xs sm:text-sm font-semibold text-[#1B5E20] hover:text-[#0d3a14] transition-colors border-2 border-[#1B5E20] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
            Your Orders
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-md">
            Track all your produce orders and their delivery status.
          </p>
        </div>

        {loading && <p className="mt-12 text-center text-gray-600">Loading orders...</p>}
        {error && <p className="mt-12 text-center text-red-600">Error: {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Link to="/marketplace" className="text-[#1B5E20] underline font-semibold">
              Browse marketplace →
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-10 space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={order.listings?.image_url}
                      alt={order.listings?.crop_type}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">{order.listings?.crop_type}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.quantity}kg · GH₵{Number(order.total_price).toLocaleString()} · From {order.listings?.users?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-3">
                      <span className="w-2 h-2 rounded-full bg-[#1B5E20] animate-pulse" />
                      <span className="text-sm font-bold text-gray-900 capitalize">{order.status}</span>
                    </div>
                    <Link
                      to={`/tracking/${order.id}`}
                      className="text-xs text-[#1B5E20] font-semibold hover:underline"
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

      {/* Footer */}
      <footer className="border-t border-gray-200 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-gray-600 mt-12 sm:mt-16">
        <p className="font-bold text-gray-900 mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default BuyerOrderHistory