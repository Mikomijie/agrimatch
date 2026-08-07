import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { notify } from '../lib/notifications'
import { cancelOrder } from '../lib/orderHelpers'

function FarmerOrders() {
  const { user } = useCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [transportModal, setTransportModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [transporters, setTransporters] = useState([])
  const [selectedTransporterId, setSelectedTransporterId] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [transporterDetails, setTransporterDetails] = useState({})
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchOrders()

    if (!user) return

    const channel = supabase
      .channel('farmer-orders-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const fetchOrders = async () => {
    if (!user) return
    const { data: listings } = await supabase
      .from('listings')
      .select('id')
      .eq('farmer_id', user.id)
    if (!listings?.length) {
      setOrders([])
      setLoading(false)
      return
    }
    const listingIds = listings.map(l => l.id)
    const { data } = await supabase
      .from('orders')
      .select('*, listings(crop_type, quantity, price_per_unit, location)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })

    setOrders(data || [])

    const transporterIds = [...new Set((data || []).filter(o => o.transporter_id).map(o => o.transporter_id))]
    if (transporterIds.length) {
      const { data: tData } = await supabase
        .from('transporters')
        .select('user_id, vehicle_type, is_verified_agent, users(name)')
        .in('user_id', transporterIds)
      const map = {}
      tData?.forEach(t => { map[t.user_id] = t })
      setTransporterDetails(map)
    }

    setLoading(false)
  }

  const handleCancel = async (order) => {
    setCancellingId(order.id)
    const { error } = await cancelOrder(order)
    setCancellingId(null)

    if (error) {
      notify.error('Failed to cancel order')
    } else {
      notify.success('Order cancelled')
      fetchOrders()
    }
  }

  const openTransportModal = async (order) => {
    setSelectedOrder(order)
    setTransportModal(true)

    const { data } = await supabase
      .from('transporters')
      .select('user_id, vehicle_type, capacity_kg, coverage_area, users(name)')
    setTransporters(data || [])
  }

  const closeModal = () => {
    setTransportModal(false)
    setSelectedOrder(null)
    setSelectedTransporterId('')
    setPickupDate('')
    setNotes('')
  }

  const handleRequestTransport = async () => {
    if (!selectedOrder || !pickupDate) return
    setSubmitting(true)

    const { error } = await supabase.from('transport_requests').insert({
      order_id: selectedOrder.id,
      farmer_id: user.id,
      pickup_location: selectedOrder.listings?.location || '',
      pickup_date: pickupDate,
      notes: notes,
      status: 'pending',
      requested_transporter_id: selectedTransporterId || null,
    })

    setSubmitting(false)

    if (error) {
      notify.error('Failed to request transport')
    } else {
      notify.success(
        selectedTransporterId
          ? 'Request sent to selected transporter!'
          : 'Request sent to all available transporters!'
      )
      closeModal()
      fetchOrders()
    }
  }

  if (loading) return <p className="text-center text-[var(--color-charcoal)]/60">Loading orders...</p>

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black/10 p-4 sm:p-6 shadow-sm">
      <h2 className="font-[var(--font-heading)] text-base sm:text-lg text-[var(--color-charcoal)] mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-sm text-[var(--color-charcoal)]/50 text-center py-6">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const transporter = order.transporter_id ? transporterDetails[order.transporter_id] : null
            return (
              <div key={order.id} className="bg-[var(--color-surface)] rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-charcoal)]">{order.listings?.crop_type}</p>
                    <p className="text-xs text-[var(--color-charcoal)]/60">
                      {order.listings?.quantity}kg @ GH₵{order.listings?.price_per_unit}/kg
                    </p>
                  </div>
                  <p className={`text-xs font-bold flex-shrink-0 ${
                    order.status === 'delivered' || order.status === 'completed'
                      ? 'text-[var(--color-primary)]'
                      : order.status === 'cancelled'
                      ? 'text-red-600'
                      : 'text-[var(--color-secondary-dark)]'
                  }`}>
                    {order.status}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                  {transporter ? (
                    <p className="text-xs text-[var(--color-charcoal)]/70">
                      Transporter: <span className="font-semibold">{transporter.users?.name}</span> — {transporter.vehicle_type}
                      {transporter.is_verified_agent && (
                        <span className="ml-2 text-[10px] font-bold text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded">CERTIFIED</span>
                      )}
                    </p>
                  ) : order.status === 'pending' ? (
                    <p className="text-xs text-[var(--color-charcoal)]/50">Awaiting payment confirmation</p>
                  ) : (
                    <button
                      onClick={() => openTransportModal(order)}
                      className="text-xs font-semibold text-white bg-[var(--color-primary)] px-3 py-1.5 rounded-md hover:brightness-95 transition-all"
                    >
                      Request Transport
                    </button>
                  )}

                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(order)}
                      disabled={cancellingId === order.id}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50 flex-shrink-0"
                    >
                      {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>

                {(order.pickup_photo_url || order.delivery_photo_url) && (
                  <div className="mt-2 pt-2 border-t border-black/5 flex gap-2">
                    {order.pickup_photo_url && (
                      <a href={order.pickup_photo_url} target="_blank" rel="noopener noreferrer">
                        <img src={order.pickup_photo_url} alt="Pickup" className="w-14 h-14 rounded-md object-cover border border-black/10" />
                      </a>
                    )}
                    {order.delivery_photo_url && (
                      <a href={order.delivery_photo_url} target="_blank" rel="noopener noreferrer">
                        <img src={order.delivery_photo_url} alt="Delivery" className="w-14 h-14 rounded-md object-cover border border-black/10" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {transportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
            <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)] mb-4">Request Transport</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                  Choose a Transporter
                </label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedTransporterId('')}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedTransporterId === ''
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20'
                        : 'border-black/10'
                    }`}
                  >
                    <p className="font-semibold text-sm text-[var(--color-charcoal)]">Any Available Transporter</p>
                    <p className="text-xs text-[var(--color-charcoal)]/60">Open request, first to accept gets it</p>
                  </button>

                  {transporters.map((t) => (
                    <button
                      type="button"
                      key={t.user_id}
                      onClick={() => setSelectedTransporterId(t.user_id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedTransporterId === t.user_id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20'
                          : 'border-black/10'
                      }`}
                    >
                      <p className="font-semibold text-sm text-[var(--color-charcoal)]">{t.users?.name}</p>
                      <p className="text-xs text-[var(--color-charcoal)]/60">
                        {t.vehicle_type} · Capacity {t.capacity_kg}kg · {t.coverage_area}
                      </p>
                    </button>
                  ))}

                  {transporters.length === 0 && (
                    <p className="text-xs text-[var(--color-charcoal)]/50">No registered transporters yet — request will go out openly.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                  Preferred Pickup Date
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full border-2 border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-[var(--color-charcoal)]/70 uppercase">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Call before arrival"
                  className="mt-2 w-full border-2 border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRequestTransport}
                  disabled={submitting || !pickupDate}
                  className="flex-1 bg-[var(--color-primary)] text-white py-2.5 rounded-lg font-semibold hover:brightness-95 disabled:opacity-60 transition-all"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 border-2 border-black/10 py-2.5 rounded-lg font-semibold hover:bg-black/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerOrders