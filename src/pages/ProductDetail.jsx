import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [quantity, setQuantity] = useState(50)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('listings')
        .select('*, users(name, rating)')
        .eq('id', id)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  if (loading) return <p className="p-10 text-center text-gray-500">Loading...</p>
  if (error) return <p className="p-10 text-center text-red-500">Error: {error}</p>
  if (!product) return <p className="p-10 text-center text-gray-500">Product not found.</p>
  if (userLoading) return <p className="p-10 text-center text-gray-500">Loading...</p>
  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in to place an order.</p>
      <Link to="/auth" className="text-[#1B5E20] underline mt-2 inline-block font-semibold">Go to Login</Link>
    </div>
  )

  const subtotal = quantity * product.price_per_unit
  const logisticsFee = 45
  const total = subtotal + logisticsFee

  const handleOrder = async () => {
    const { error } = await supabase.from('orders').insert({
      listing_id: product.id,
      buyer_id: user.id,
      quantity: quantity,
      total_price: total,
      status: 'pending',
    })

    if (error) {
      setError(error.message)
    } else {
      setConfirmed(true)
    }
  }

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
                onClick={() => navigate('/marketplace')}
                className="text-gray-600 hover:text-[#1B5E20] transition-colors font-semibold"
              >
                ← Back
              </button>
              <Link to="/marketplace" className="pb-2 border-b-2 border-[#1B5E20] text-[#1B5E20]">
                Marketplace
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Dashboard
              </Link>
              <Link to="/logistics" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Logistics
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
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
          {/* Left - Product Info */}
          <div>
            <p className="text-xs sm:text-sm font-bold tracking-wider text-gray-600 uppercase mb-3 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-[#1B5E20] inline-block mr-2 animate-pulse" />
              {product.freshness}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              {product.crop_type}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-md leading-relaxed">
              Sun-cured, freshly harvested produce from the mineral-rich soils of the Techiman valley, grown using traditional cultivation techniques.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8 sm:mt-10">
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Available Quantity</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{product.quantity} kg</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Location</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{product.location}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Price per kg</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">GH₵{product.price_per_unit}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-2">Farmer Rating</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">★ {product.users?.rating}</p>
              </div>
            </div>
          </div>

          {/* Right - Product Image & Order */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
              <img src={product.image_url} alt={product.crop_type} className="w-full h-64 sm:h-80 object-cover" />
            </div>

            {/* Farmer Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
              <p className="text-xs font-bold tracking-wider text-gray-600 uppercase mb-4">Verified Grower</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {product.users?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{product.users?.name}</h3>
                  <p className="text-sm text-gray-600">★ {product.users?.rating} rating</p>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Select Order Details</h2>

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase mb-4">Quantity (kilograms)</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg text-xl font-bold text-gray-700 hover:border-[#1B5E20] hover:text-[#1B5E20] transition-colors"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-gray-900 min-w-[80px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 10)}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg text-xl font-bold text-gray-700 hover:border-[#1B5E20] hover:text-[#1B5E20] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-900">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Logistics Fee (Techiman → Accra)</span>
                  <span className="font-bold text-gray-900">GH₵{logisticsFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                  <span className="text-gray-900">Total Payable</span>
                  <span className="text-[#1B5E20]">GH₵{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Escrow Info */}
              <div className="bg-[#E8F5E9] border-2 border-[#1B5E20]/20 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-[#1B5E20] mb-2">Escrow Guaranteed</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Your payment is held in a secure mobile money escrow. Funds are only released to the farmer once you confirm the quality of produce upon delivery.
                </p>
              </div>

              {/* Order Button */}
              {!confirmed ? (
                <button
                  onClick={handleOrder}
                  className="w-full bg-[#1B5E20] text-white py-3 px-6 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all text-base"
                >
                  Order & Pay Now
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1B5E20] text-white py-4 px-6 rounded-lg text-center"
                >
                  <p className="font-bold mb-2">✓ Payment held in escrow</p>
                  <Link to="/buyer-orders" className="text-xs underline hover:no-underline">
                    View your orders →
                  </Link>
                </motion.div>
              )}
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

export default ProductDetail