import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { useNavigate } from 'react-router-dom'

function ProductDetail() {
  const { id } = useParams()
  const { user, loading: userLoading } = useCurrentUser()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block">Go to Login</Link>
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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <button
            onClick={() => navigate('/marketplace')}
            className="text-gray-600 hover:text-[var(--color-primary)] transition-colors font-semibold"
          >
            ← Back
          </button>
          <Link to="/marketplace" className="pb-1 border-b-2 border-[var(--color-primary)]">Marketplace</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/logistics">Logistics</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse" />
              {product.freshness?.toUpperCase()}
            </p>
            <h1 className="font-[var(--font-heading)] text-4xl mt-2">{product.crop_type}</h1>
            <p className="mt-3 text-gray-600 text-sm max-w-sm">
              Sun-cured, freshly harvested produce from the mineral-rich soils of the Techiman
              valley, grown using traditional cultivation techniques.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Available Quantity</p>
                <p className="font-[var(--font-heading)] text-lg">{product.quantity} kg</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Location</p>
                <p className="font-[var(--font-heading)] text-lg">{product.location}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Price per kg</p>
                <p className="font-[var(--font-heading)] text-lg">GH₵{product.price_per_unit}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Farmer Rating</p>
                <p className="font-[var(--font-heading)] text-lg">★ {product.users?.rating}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <img src={product.image_url} alt={product.crop_type} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 md:right-auto md:w-72 bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center font-[var(--font-heading)] text-[var(--color-primary-dark)]">
                {product.users?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-500">Verified Grower</p>
                <p className="font-medium text-sm">{product.users?.name}</p>
                <p className="text-xs text-[var(--color-secondary)]">★ {product.users?.rating}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-[var(--color-background-warm)] rounded-lg p-8 grid md:grid-cols-2 gap-10"
        >
          <div>
            <h2 className="font-[var(--font-heading)] text-2xl">Select Order Details</h2>
            <p className="text-xs text-gray-500 mt-4">QUANTITY (KILOGRAMS)</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                className="w-9 h-9 border border-gray-300 rounded-md text-lg hover:bg-white transition-colors"
              >
                −
              </button>
              <span className="w-16 text-center font-[var(--font-heading)] text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 10)}
                className="w-9 h-9 border border-gray-300 rounded-md text-lg hover:bg-white transition-colors"
              >
                +
              </button>
            </div>

            <div className="mt-6 space-y-2 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Logistics Fee (Techiman → Accra)</span>
                <span>GH₵{logisticsFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-[var(--font-heading)] text-xl pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="bg-[var(--color-secondary-light)]/20 border border-[var(--color-secondary)]/30 rounded-lg p-4">
              <p className="text-sm font-medium text-[var(--color-secondary-dark)]">
                Escrow Guaranteed
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Your payment is held in a secure mobile money escrow. Funds are only released to
                the farmer once you confirm the quality of produce upon delivery.
              </p>
            </div>

            {!confirmed ? (
              <button
                onClick={handleOrder}
                className="mt-4 bg-[var(--color-secondary)] text-white py-3 rounded-md font-medium tracking-wide hover:brightness-95 active:scale-[0.98] transition-all"
              >
                ORDER & PAY NOW
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 bg-[var(--color-primary)] text-white py-4 rounded-md text-center"
              >
                <p className="font-medium">✓ Payment held in escrow</p>
                <Link to="/tracking" className="text-xs underline mt-1 inline-block">
                  Track your order →
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default ProductDetail