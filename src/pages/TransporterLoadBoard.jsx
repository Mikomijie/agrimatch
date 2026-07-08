import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'


function LoadCard({ order, onAccept, onUpdateStatus, isMyJob }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <img
          src={order.listings?.image_url}
          alt={order.listings?.crop_type}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-full text-xs font-medium">
          Awaiting Pickup
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-[var(--font-heading)] text-lg">{order.listings?.crop_type}</h3>
          <p className="font-[var(--font-heading)] text-lg text-[var(--color-secondary)] whitespace-nowrap">
            GH₵{Number(order.total_price).toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {order.listings?.location} · {order.quantity}kg
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Order for {order.listings?.users?.name}. Pickup and deliver to buyer's address.
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">ORDER REF: {order.id.slice(0, 8).toUpperCase()}</span>
          {isMyJob ? (
            <div className="flex gap-2">
              {order.status === 'confirmed' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'in_transit')}
                  className="bg-[var(--color-secondary)] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:brightness-95 active:scale-95 transition-all"
                >
                  Mark In Transit
                </button>
              )}
              {order.status === 'in_transit' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'delivered')}
                  className="bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:brightness-95 active:scale-95 transition-all"
                >
                  Mark Delivered
                </button>
              )}
              {order.status === 'delivered' && (
                <span className="text-xs text-[var(--color-primary)] font-medium">✓ Completed</span>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAccept(order.id)}
              className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:brightness-95 active:scale-95 transition-all"
            >
              Accept Load
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TransporterLoadBoard() {
  const [orders, setOrders] = useState([])
  const [view, setView] = useState('available') // 'available' or 'myJobs'
  const { user, loading: userLoading } = useCurrentUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchOrders() {
    let query = supabase
      .from('orders')
      .select('*, listings(crop_type, location, image_url, users(name))')
      .order('created_at', { ascending: false })

    if (view === 'available') {
      query = query.is('transporter_id', null)
    } else {
      query = query.eq('transporter_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      setOrders(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [view, user])

  const handleAccept = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ transporter_id: user.id, status: 'confirmed' })
      .eq('id', orderId)

    if (error) {
      setError(error.message)
    } else {
      // Refresh and switch to "My Jobs" view
      setView('myJobs')
      fetchOrders()
    }
  }
  const handleUpdateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      setError(error.message)
    } else {
      fetchOrders()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/dashboard">Dashboard</Link>
          <span className="pb-1 border-b-2 border-[var(--color-primary)]">Logistics</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline">
            {user ? `Logged in as ${user.name}` : ''}
          </span>
          {user ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
            >
              Log Out
            </button>
          ) : (
            <Link to="/auth" className="text-xs border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
              Login / Sign Up
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">
              {view === 'available' ? 'Available Loads' : 'My Active Jobs'}
            </h1>
            <p className="mt-2 text-gray-600 text-sm max-w-md">
              {view === 'available' 
                ? 'Discover and secure high-value delivery jobs across the Bono East region.'
                : 'Your accepted deliveries and their status.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('available')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                view === 'available'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              Available Loads
            </button>
            <button
              onClick={() => setView('myJobs')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                view === 'myJobs'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              My Jobs
            </button>
          </div>
        </div>
        {!userLoading && !user && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">Please log in as a transporter to accept loads.</p>
            <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block">Go to Login</Link>
          </div>
        )}
        {loading && <p className="mt-12 text-center text-gray-500">Loading available loads...</p>}
        {error && <p className="mt-12 text-center text-red-500">Error: {error}</p>}

        {user && !loading && !error && (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <LoadCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onUpdateStatus={handleUpdateStatus}
                isMyJob={view === 'myJobs'}
              />
            ))}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="mt-12 text-center text-gray-500">No pending loads right now.</p>
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default TransporterLoadBoard