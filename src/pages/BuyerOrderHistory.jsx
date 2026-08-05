import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import ReviewModal from '../components/ReviewModal'
import { cancelOrder } from '../lib/orderHelpers'

const STATUS_COLORS = {
  pending: 'text-[var(--color-secondary-dark)]',
  confirmed: 'text-[var(--color-secondary-dark)]',
  in_transit: 'text-[var(--color-secondary)]',
  delivered: 'text-[var(--color-primary)]',
  completed: 'text-[var(--color-primary)]',
  cancelled: 'text-red-600',
}

const STATUS_DOT = {
  pending: 'bg-[var(--color-secondary-dark)] animate-pulse',
  confirmed: 'bg-[var(--color-secondary-dark)] animate-pulse',
  in_transit: 'bg-[var(--color-secondary)] animate-pulse',
  delivered: 'bg-[var(--color-primary)]',
  completed: 'bg-[var(--color-primary)]',
  cancelled: 'bg-red-600',
}

function BuyerOrderHistory() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  const fetchMyOrders = async () => {
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

  useEffect(() => {
    fetchMyOrders()
  }, [user])

  const handleCancel = async (order) => {
    setCancellingId(order.id)
    const { error } = await cancelOrder(order)
    setCancellingId(null)

    if (error) {
      alert('Failed to cancel order: ' + error)
    } else {
      fetchMyOrders()
    }
  }

  if (userLoading) return (
    <div className="p-10 text-center text-[var(--color-charcoal)]/60">
      <p>Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-[var(--color-charcoal)]/60">Please log in to see your orders.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block font-semibold">Go to Login</Link>
    </div>
  )

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
              <button
                onClick={() => window.history.back()}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                ← Back
              </button>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-white text-white">My Orders</span>
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <span className="text-xs sm:text-sm text-white/60 hidden sm:inline">
                {user?.name}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="text-xs sm:text-sm font-semibold text-white hover:text-white/80 transition-colors border-2 border-white/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        <div>
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-3 sm:mb-4">
            Your Orders
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md">
            Track all your produce orders and their delivery status.
          </p>
        </div>

        {loading && <p className="mt-12 text-center text-[var(--color-charcoal)]/60">Loading orders...</p>}
        {error && <p className="mt-12 text-center text-red-600">Error: {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-[var(--color-charcoal)]/60 mb-4">You haven't placed any orders yet.</p>
            <Link to="/marketplace" className="text-[var(--color-primary)] underline font-semibold">
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
                className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={order.listings?.image_url}
                      alt={order.listings?.crop_type}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)] truncate">{order.listings?.crop_type}</h3>
                      <p className="text-sm text-[var(--color-charcoal)]/60 mt-1">
                        {order.quantity}kg · GH₵{Number(order.total_price).toLocaleString()} · From {order.listings?.users?.name}
                      </p>
                      <p className="text-xs text-[var(--color-charcoal)]/40 mt-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[order.status] || 'bg-[var(--color-charcoal)]/30'}`} />
                      <span className={`text-sm font-medium capitalize ${STATUS_COLORS[order.status] || 'text-[var(--color-charcoal)]/60'}`}>{order.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/tracking/${order.id}`}
                        className="text-xs text-[var(--color-primary)] underline hover:no-underline"
                      >
                        View details
                      </Link>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order)}
                          disabled={cancellingId === order.id}
                          className="text-xs text-red-600 underline hover:no-underline disabled:opacity-50"
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
                        </button>
                      )}
                      {(order.status === 'delivered' || order.status === 'completed') && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowReviewModal(true)
                          }}
                          className="text-xs text-[var(--color-secondary)] underline hover:no-underline"
                        >
                          Leave review
                        </button>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {showReviewModal && selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          buyer={user}
          farmerName={selectedOrder.listings?.users?.name}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedOrder(null)
          }}
          onSuccess={async () => {
            setShowReviewModal(false)
            setSelectedOrder(null)
            fetchMyOrders()
          }}
        />
      )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default BuyerOrderHistory