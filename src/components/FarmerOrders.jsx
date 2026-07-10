import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function FarmerOrders() {
  const { user } = useCurrentUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [transportModal, setTransportModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [transporterName, setTransporterName] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    if (!user) return
    const { data } = await supabase
      .from('orders')
      .select('*, listings(crop_type, quantity, price_per_unit)')
      .eq('listing_id', (await supabase.from('listings').select('id').eq('farmer_id', user.id)).data?.[0]?.id || '')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const handleAssignTransporter = async () => {
    if (!selectedOrder || !transporterName) return
    const { error } = await supabase
      .from('orders')
      .update({
        transporter_id: transporterName,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
      })
      .eq('id', selectedOrder.id)
    if (!error) {
      fetchOrders()
      setTransportModal(false)
      setTransporterName('')
      setPickupDate('')
      setPickupTime('')
    }
  }

  if (loading) return <p className="text-center text-gray-500">Loading orders...</p>

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-[var(--font-heading)] text-3xl mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{order.listings?.crop_type}</p>
                  <p className="text-sm text-gray-600">
                    {order.listings?.quantity}kg @ GH₵{order.listings?.price_per_unit}/kg
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Order ID: {order.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${order.status === 'delivered' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.status}
                  </p>
                  {!order.transporter_id && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setTransportModal(true)
                      }}
                      className="mt-2 text-sm bg-[var(--color-primary)] text-white px-3 py-1 rounded hover:brightness-95"
                    >
                      Assign Transport
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {transportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Assign Transporter</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Transporter Name"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAssignTransporter}
                  className="flex-1 bg-[var(--color-primary)] text-white py-2 rounded font-semibold hover:brightness-95"
                >
                  Assign
                </button>
                <button
                  onClick={() => setTransportModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded font-semibold hover:bg-gray-50"
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