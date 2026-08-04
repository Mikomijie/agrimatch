import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFlutterwave } from 'flutterwave-react-v3'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import { notify } from '../lib/notifications'

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(50)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [moreListings, setMoreListings] = useState([])
  const [timeLeft, setTimeLeft] = useState(null)

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

  useEffect(() => {
    async function fetchMoreListings() {
      if (!product?.farmer_id) return
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('farmer_id', product.farmer_id)
        .neq('id', product.id)
        .order('created_at', { ascending: false })
        .limit(4)
      setMoreListings(data || [])
    }
    fetchMoreListings()
  }, [product])

  useEffect(() => {
    if (!product || product.freshness === 'Harvesting Tomorrow') return

    const getDeadline = () => {
      const harvestTime = new Date(product.created_at)
      if (product.freshness === 'Harvested Yesterday') {
        harvestTime.setHours(harvestTime.getHours() - 24)
      }
      return new Date(harvestTime.getTime() + 12 * 60 * 60 * 1000)
    }

    const update = () => {
      const diff = getDeadline() - new Date()
      if (diff <= 0) {
        setTimeLeft('closed')
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft({ hours, minutes })
      }
    }

    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [product])

  if (loading) return <p className="p-10 text-center text-[var(--color-charcoal)]/60">Loading...</p>
  if (error) return <p className="p-10 text-center text-red-500">Error: {error}</p>
  if (!product) return <p className="p-10 text-center text-[var(--color-charcoal)]/60">Product not found.</p>
  if (userLoading) return <p className="p-10 text-center text-[var(--color-charcoal)]/60">Loading...</p>
  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-[var(--color-charcoal)]/60">Please log in to place an order.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block font-semibold">Go to Login</Link>
    </div>
  )

  const subtotal = quantity * product.price_per_unit
  const logisticsFee = 45
  const total = subtotal + logisticsFee

  const flutterConfig = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `AGRIMATCH-${Date.now()}`,
    amount: total,
    currency: 'GHS',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || 'buyer@agrimatch.com',
      phonenumber: user?.phone || '0550000000',
      name: user?.name || 'AgriMatch Buyer',
    },
    customizations: {
      title: `AgriMatch - ${product.crop_type}`,
      description: `${quantity}kg of ${product.crop_type} from ${product.users?.name}`,
    },
  }

  const handleFlutterPayment = useFlutterwave(flutterConfig)

  const handlePaymentClick = async () => {
    try {
      setPaymentProcessing(true)

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          listing_id: product.id,
          buyer_id: user.id,
          quantity: quantity,
          total_price: total,
          status: 'pending',
          payment_status: 'processing',
        })
        .select()
        .single()

      if (orderError) {
        setError(orderError.message)
        setPaymentProcessing(false)
        return
      }

      setOrderId(orderData.id)

      handleFlutterPayment({
        onSuccess: async (response) => {
          console.log('Payment successful:', response)

          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              transaction_id: response.transaction_id,
              payment_date: new Date().toISOString(),
              status: 'confirmed',
            })
            .eq('id', orderData.id)

          if (updateError) {
            notify.error('Payment recorded but order update failed')
            setError(updateError.message)
            setPaymentProcessing(false)
            return
          }

          notify.success('Payment successful! Order confirmed.')

          setTimeout(() => {
            navigate(`/tracking/${orderData.id}`)
          }, 1500)
        },
        onClose: () => {
          console.log('Payment modal closed')
          setPaymentProcessing(false)
          if (orderId) {
            navigate(`/tracking/${orderId}`)
          }
        },
      })
    } catch (err) {
      setError(err.message)
      setPaymentProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      {/* Header */}
      <header className="bg-[var(--color-primary-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/marketplace')}
                className="md:hidden text-white/80 hover:text-white transition-colors"
                aria-label="Back"
              >
                <ChevronLeft />
              </button>
              <Link to="/" className="font-[var(--font-heading)] italic text-2xl sm:text-3xl text-white flex-shrink-0">
                AgriMatch
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium flex-1 justify-center">
              <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors font-semibold"
              >
                <ChevronLeft />
                Back
              </button>
              <Link to="/marketplace" className="pb-2 border-b-2 border-white text-white">
                Marketplace
              </Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-10 sm:pt-16 pb-8 sm:pb-12">
        {/* Hero: description + stats + image */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-stretch">
          <div className="flex flex-col">
            <p className="text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-3 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] inline-block mr-2 animate-pulse" />
              {product.freshness}
            </p>
            <h1 className="font-[var(--font-heading)] font-bold text-5xl sm:text-6xl md:text-7xl text-[var(--color-charcoal)] mb-4 sm:mb-6 leading-none">
              {product.crop_type}
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md leading-relaxed">
              Sun-cured, freshly harvested produce from the mineral-rich soils of the Techiman valley, grown using traditional cultivation techniques.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8 sm:mt-10">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Available Quantity</p>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)]">{product.quantity} kg</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Location</p>
                <p className="flex items-center gap-1.5 text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)]">
                  <PinIcon />
                  {product.location}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Price per kg</p>
                <p className="font-[var(--font-heading)] text-4xl sm:text-5xl font-bold text-[var(--color-secondary)]">GH₵{product.price_per_unit}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-2">Farmer Rating</p>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)]">★ {product.users?.rating}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl overflow-hidden border-2 border-black/10 shadow-sm h-full min-h-[320px] sm:min-h-[420px]">
            <img src={product.image_url} alt={product.crop_type} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Countdown / Urgency Band */}
        <div className="mt-8 sm:mt-10">
          {product.freshness === 'Harvesting Tomorrow' ? (
            <div className="bg-[var(--color-surface)] rounded-lg p-4 sm:p-5">
              <p className="text-sm sm:text-base font-semibold text-[var(--color-charcoal)]/80">
                This harvest is expected tomorrow — order now to reserve it.
              </p>
            </div>
          ) : timeLeft === 'closed' ? (
            <div className="bg-red-50 rounded-lg p-4 sm:p-5">
              <p className="text-sm sm:text-base font-semibold text-red-700">
                Pickup window has closed for this listing — check the farmer's other active listings below.
              </p>
            </div>
          ) : timeLeft ? (
            <div
              className={`rounded-lg p-4 sm:p-5 ${
                timeLeft.hours < 2
                  ? 'bg-red-50'
                  : 'bg-[var(--color-secondary-light)]/25'
              }`}
            >
              <p className={`text-sm sm:text-base font-semibold ${timeLeft.hours < 2 ? 'text-red-700' : 'text-[var(--color-secondary-dark)]'}`}>
                Pickup window closes in {timeLeft.hours}h {timeLeft.minutes}m — order soon to guarantee this batch.
              </p>
            </div>
          ) : null}
        </div>

        {/* More from farmer + Order card */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mt-10 sm:mt-12">
          {/* More from this farmer */}
          <div>
            <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl text-[var(--color-charcoal)] mb-5">
              More from {product.users?.name}
            </h2>
            {moreListings.length === 0 ? (
              <p className="text-sm text-[var(--color-charcoal)]/50">No other active listings right now.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {moreListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/product/${listing.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-black/5 transition-all"
                  >
                    <div className="aspect-[4/3] bg-[var(--color-surface)] overflow-hidden">
                      <img
                        src={listing.image_url}
                        alt={listing.crop_type}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-[var(--color-charcoal)]">{listing.crop_type}</p>
                      <p className="text-xs text-[var(--color-charcoal)]/60 mt-1">
                        {listing.quantity}kg · GH₵{listing.price_per_unit}/kg
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Farmer Card */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mt-6">
              <p className="text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/50 uppercase mb-4">Verified Grower</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {product.users?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-charcoal)] text-base">{product.users?.name}</h3>
                  <p className="text-sm text-[var(--color-charcoal)]/60">★ {product.users?.rating} rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8">
              <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl text-[var(--color-charcoal)] mb-6">Select Order Details</h2>

              <div className="mb-8">
                <label className="block text-xs font-semibold tracking-wider text-[var(--color-charcoal)]/60 uppercase mb-4">Quantity (kilograms)</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                    className="w-12 h-12 border-2 border-black/10 rounded-lg text-xl font-bold text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-[var(--color-charcoal)] min-w-[80px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 10)}
                    className="w-12 h-12 border-2 border-black/10 rounded-lg text-xl font-bold text-[var(--color-charcoal)]/70 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-8 pt-6 border-t border-black/10">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-charcoal)]/60">Subtotal</span>
                  <span className="font-bold text-[var(--color-charcoal)]">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-charcoal)]/60">Logistics Fee ({product.location} → Delivery)</span>
                  <span className="font-bold text-[var(--color-charcoal)]">GH₵{logisticsFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-black/10 pt-3 mt-3">
                  <span className="text-[var(--color-charcoal)]">Total Payable</span>
                  <span className="text-[var(--color-primary)]">GH₵{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-[var(--color-primary-light)]/20 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-[var(--color-primary-dark)] mb-2">Secure Payment</p>
                <p className="text-xs text-[var(--color-charcoal)]/70 leading-relaxed">
                  Payments are processed securely via Flutterwave, supporting card, mobile money, and USSD.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {paymentProcessing ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--color-primary)] text-white py-4 px-6 rounded-lg text-center"
                >
                  <p className="font-bold">Processing payment...</p>
                </motion.div>
              ) : (
                <button
                  onClick={handlePaymentClick}
                  className="w-full bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all text-base"
                >
                  Pay GH₵{total.toFixed(2)}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-center text-sm text-[var(--color-charcoal)]/60 mt-12 sm:mt-16">
        <p className="font-bold text-[var(--color-charcoal)] mb-2">AgriMatch</p>
        <p>© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default ProductDetail