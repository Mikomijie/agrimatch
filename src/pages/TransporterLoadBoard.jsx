import { notify } from '../lib/notifications'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function PhotoUploadModal({ title, onClose, onSubmit, submitting }) {
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const handleSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setPhotoPreview(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--color-charcoal)]/60 mb-4">
          Upload a photo confirming produce condition before continuing.
        </p>

        {photoPreview ? (
          <div className="relative rounded-lg overflow-hidden border-2 border-[var(--color-primary)] mb-4">
            <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
              className="absolute top-2 right-2 bg-[var(--color-secondary-dark)] text-white px-2 py-1 rounded text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="block border-2 border-dashed border-black/15 rounded-lg p-4 text-center cursor-pointer hover:border-[var(--color-primary)] transition-all">
              <input type="file" accept="image/*" capture="environment" onChange={handleSelect} className="hidden" />
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-charcoal)]/80">Take Photo</p>
            </label>
            <label className="block border-2 border-dashed border-black/15 rounded-lg p-4 text-center cursor-pointer hover:border-[var(--color-primary)] transition-all">
              <input type="file" accept="image/*" onChange={handleSelect} className="hidden" />
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-charcoal)]/80">Upload from Gallery</p>
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-black/10 py-2.5 rounded-lg font-semibold text-[var(--color-charcoal)]/70 hover:bg-black/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(photoFile)}
            disabled={!photoFile || submitting}
            className="flex-1 bg-[var(--color-primary)] text-white py-2.5 rounded-lg font-semibold hover:brightness-95 disabled:opacity-60 transition-all"
          >
            {submitting ? 'Uploading...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadCard({ order, onAccept, onOpenPhotoModal, isMyJob }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-[var(--color-surface)] overflow-hidden">
        <img
          src={order.listings?.image_url}
          alt={order.listings?.crop_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-charcoal)]">
          Awaiting Pickup
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)]">{order.listings?.crop_type}</h3>
          <p className="font-bold text-xl text-[var(--color-secondary)] whitespace-nowrap flex-shrink-0">
            GH₵{Number(order.total_price).toLocaleString()}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-[var(--color-charcoal)]/60 mb-3">
          {order.listings?.location} · {order.quantity}kg
        </p>

        <p className="text-sm text-[var(--color-charcoal)]/80 mb-4">
          Order for <span className="font-semibold">{order.listings?.users?.name}</span>. Pickup and deliver to buyer's address.
        </p>

        <div className="border-t border-black/10 pt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-charcoal)]/40 font-mono">
            REF: {order.id.slice(0, 8).toUpperCase()}
          </p>

          {isMyJob ? (
            <div className="flex gap-2 flex-shrink-0">
              {order.status === 'confirmed' && (
                <button
                  onClick={() => onOpenPhotoModal(order, 'pickup')}
                  className="bg-[var(--color-secondary)] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  In Transit
                </button>
              )}
              {order.status === 'in_transit' && (
                <button
                  onClick={() => onOpenPhotoModal(order, 'delivery')}
                  className="bg-[var(--color-primary)] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  Delivered
                </button>
              )}
              {(order.status === 'delivered' || order.status === 'completed') && (
                <span className="text-sm font-bold text-[var(--color-primary)]">Completed</span>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAccept(order.id)}
              className="bg-[var(--color-primary)] text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-bold hover:brightness-95 active:scale-[0.98] transition-all whitespace-nowrap flex-shrink-0"
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
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [transportRequests, setTransportRequests] = useState([])
  const [view, setView] = useState('available')
  const [myJobsFilter, setMyJobsFilter] = useState('awaiting')
  const { user, loading: userLoading } = useCurrentUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [photoModal, setPhotoModal] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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

    const { data: requests } = await supabase
      .from('transport_requests')
      .select('*, orders(id, quantity, total_price, status, listings(crop_type, location, image_url)), users!transport_requests_farmer_id_fkey(name, phone)')
      .eq('status', 'pending')
      .or(`requested_transporter_id.is.null,requested_transporter_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (requests) {
      setTransportRequests(requests)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [view, user])

  const handleAccept = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ transporter_id: user.id, status: 'confirmed' })
      .eq('id', orderId)

    if (error) {
      notify.error('Failed to accept load')
      setError(error.message)
    } else {
      notify.success('Load accepted! Check "My Jobs"')
      setView('myJobs')
      setMyJobsFilter('awaiting')
      fetchOrders()
    }
  }

  const handlePhotoSubmit = async (photoFile) => {
    if (!photoFile || !photoModal) return
    setUploadingPhoto(true)

    const { order, type } = photoModal
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${order.id}-${type}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('delivery-photos')
      .upload(fileName, photoFile)

    if (uploadError) {
      notify.error('Failed to upload photo')
      setUploadingPhoto(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('delivery-photos')
      .getPublicUrl(fileName)

    const newStatus = type === 'pickup' ? 'in_transit' : 'delivered'
    const photoColumn = type === 'pickup' ? 'pickup_photo_url' : 'delivery_photo_url'

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        [photoColumn]: publicUrlData.publicUrl,
      })
      .eq('id', order.id)

    setUploadingPhoto(false)

    if (updateError) {
      notify.error('Failed to update status')
    } else {
      notify.success(`Order marked as ${newStatus === 'in_transit' ? 'In Transit' : 'Delivered'}`)
      setPhotoModal(null)
      setMyJobsFilter(newStatus === 'in_transit' ? 'in_transit' : 'delivered')
      fetchOrders()
    }
  }

  if (userLoading) return (
    <div className="p-10 text-center text-[var(--color-charcoal)]/60">
      <p>Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-[var(--color-charcoal)]/60">Please log in as a transporter to accept loads.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block font-semibold">Go to Login</Link>
    </div>
  )

  const awaitingCount = orders.filter(o => o.status === 'confirmed').length
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length
  const deliveredCount = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length

  const myJobsFiltered = orders.filter((o) => {
    if (myJobsFilter === 'awaiting') return o.status === 'confirmed'
    if (myJobsFilter === 'in_transit') return o.status === 'in_transit'
    if (myJobsFilter === 'delivered') return o.status === 'delivered' || o.status === 'completed'
    return true
  })

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
              <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                Dashboard
              </Link>
              <span className="pb-2 border-b-2 border-white text-white">Logistics</span>
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
        {/* Hero & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6 sm:mb-8">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-3 sm:mb-4">
              {view === 'available' ? 'Available' : 'My Active'} <span className="text-[var(--color-primary)] italic">Loads</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md">
              {view === 'available' 
                ? 'Discover and secure high-value delivery jobs across Bono East.'
                : 'Your accepted deliveries and their status.'}
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={() => setView('available')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                view === 'available'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)]'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setView('requests')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all relative ${
                view === 'requests'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)]'
              }`}
            >
              Requests
              {transportRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-secondary)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {transportRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView('myJobs')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-bold border-2 transition-all ${
                view === 'myJobs'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)]'
              }`}
            >
              My Jobs
            </button>
          </div>
        </div>

        {/* My Jobs sub-filters */}
        {view === 'myJobs' && (
          <div className="flex gap-2 flex-wrap mb-8 sm:mb-10">
            <button
              onClick={() => setMyJobsFilter('awaiting')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                myJobsFilter === 'awaiting'
                  ? 'bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/60 hover:border-[var(--color-secondary)]'
              }`}
            >
              Awaiting Pickup ({awaitingCount})
            </button>
            <button
              onClick={() => setMyJobsFilter('in_transit')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                myJobsFilter === 'in_transit'
                  ? 'bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/60 hover:border-[var(--color-secondary)]'
              }`}
            >
              In Transit ({inTransitCount})
            </button>
            <button
              onClick={() => setMyJobsFilter('delivered')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                myJobsFilter === 'delivered'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-black/10 text-[var(--color-charcoal)]/60 hover:border-[var(--color-primary)]'
              }`}
            >
              Delivered ({deliveredCount})
            </button>
          </div>
        )}

        {loading && <p className="text-center text-[var(--color-charcoal)]/60 py-12">Loading loads...</p>}
        {error && <p className="text-center text-red-600 py-12">Error: {error}</p>}

        {!loading && !error && view === 'available' && orders.length === 0 && (
          <p className="text-center text-[var(--color-charcoal)]/60 py-12">No available loads right now.</p>
        )}

        {!loading && !error && view === 'available' && orders.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {orders.map((order) => (
              <LoadCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onOpenPhotoModal={(o, type) => setPhotoModal({ order: o, type })}
                isMyJob={false}
              />
            ))}
          </div>
        )}

        {!loading && !error && view === 'myJobs' && myJobsFiltered.length === 0 && (
          <p className="text-center text-[var(--color-charcoal)]/60 py-12">No jobs in this category yet.</p>
        )}

        {!loading && !error && view === 'myJobs' && myJobsFiltered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {myJobsFiltered.map((order) => (
              <LoadCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onOpenPhotoModal={(o, type) => setPhotoModal({ order: o, type })}
                isMyJob={true}
              />
            ))}
          </div>
        )}

        {!loading && view === 'requests' && (
          <div>
            {transportRequests.length === 0 ? (
              <p className="text-center text-[var(--color-charcoal)]/60 py-12">No transport requests yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {transportRequests.map((req) => {
                  const isDirect = req.requested_transporter_id === user.id
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative aspect-[4/3] bg-[var(--color-surface)] overflow-hidden">
                        <img
                          src={req.orders?.listings?.image_url}
                          alt={req.orders?.listings?.crop_type}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold ${
                          isDirect
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]'
                        }`}>
                          {isDirect ? 'Direct Request' : 'Open Request'}
                        </div>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)]">
                            {req.orders?.listings?.crop_type}
                          </h3>
                          <p className="font-bold text-[var(--color-secondary)] whitespace-nowrap">
                            GH₵{Number(req.orders?.total_price).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--color-charcoal)]/60 mb-1">
                          Location: {req.pickup_location} · {req.orders?.quantity}kg
                        </p>
                        <p className="text-xs text-[var(--color-charcoal)]/60 mb-1">
                          Pickup: {req.pickup_date}
                        </p>
                        <p className="text-xs text-[var(--color-charcoal)]/60 mb-3">
                          Farmer: {req.users?.name}
                        </p>
                        {req.notes && (
                          <p className="text-xs text-[var(--color-charcoal)]/50 italic mb-3">
                            "{req.notes}"
                          </p>
                        )}
                        <button
                          onClick={async () => {
                            const { error } = await supabase
                              .from('transport_requests')
                              .update({ status: 'accepted', transporter_id: user.id })
                              .eq('id', req.id)
                            if (!error) {
                              await supabase
                                .from('orders')
                                .update({ transporter_id: user.id, status: 'confirmed' })
                                .eq('id', req.orders?.id)
                              notify.success('Transport request accepted! Check "My Jobs" to confirm pickup.')
                              setView('myJobs')
                              setMyJobsFilter('awaiting')
                              fetchOrders()
                            } else {
                              notify.error('Failed to accept request')
                            }
                          }}
                          className="w-full bg-[var(--color-primary)] text-white py-2.5 rounded-lg text-sm font-bold hover:brightness-95 transition-all"
                        >
                          Accept Transport Request
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {photoModal && (
        <PhotoUploadModal
          title={photoModal.type === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery'}
          onClose={() => setPhotoModal(null)}
          onSubmit={handlePhotoSubmit}
          submitting={uploadingPhoto}
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

export default TransporterLoadBoard