import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { getRecommended } from '../lib/matching'
import { useCurrentUser } from '../lib/useCurrentUser'

const CATEGORIES = ['All Produce', 'Tomatoes', 'Peppers', 'Garden Eggs', 'Okra']

function ProductCard({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.image_url}
          alt={item.crop_type}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#1B5E20] animate-pulse" />
          {item.freshness}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-lg text-gray-900">{item.crop_type}</h3>
        <p className="text-xs text-gray-600 mt-1">
          {item.users?.name} · {item.location}
        </p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-bold text-[#1B5E20]">
            GH₵{item.price_per_unit}
            <span className="text-xs text-gray-600 font-normal">/kg</span>
          </p>
        </div>
        <Link
          to={`/product/${item.id}`}
          className="mt-4 block w-full text-center bg-[#1B5E20] text-white py-2.5 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all text-sm"
        >
          View & Order
        </Link>
      </div>
    </motion.div>
  )
}

function BuyerMarketplace() {
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const [activeCategory, setActiveCategory] = useState('All Produce')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from('listings')
        .select('*, users(name)')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setError(error.message)
      } else {
        setListings(data)
      }
      setLoading(false)
    }

    fetchListings()
  }, [])

  const recommended = getRecommended(listings, 3)
  const filtered = listings.filter((item) =>
    item.crop_type.toLowerCase().includes(search.toLowerCase())
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
              <span className="pb-2 border-b-2 border-[#1B5E20] text-[#1B5E20]">Marketplace</span>
              {user && (
                <>
                  <Link to="/buyer-orders" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                    My Orders
                  </Link>
                  <Link to="/dashboard" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                    Dashboard
                  </Link>
                </>
              )}
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              {user ? (
                <>
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
                </>
              ) : (
                <Link to="/auth" className="text-xs sm:text-sm font-semibold text-[#1B5E20] hover:text-[#0d3a14] transition-colors border-2 border-[#1B5E20] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        {/* Hero */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
            The Seasonal <span className="text-[#2E7D32]">Harvest</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-md">
            Sourced directly from the Techiman Hub and surrounding Bono East farmlands.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search harvests..."
            className="w-full md:w-96 border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10 sm:mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                activeCategory === cat
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                  : 'border-gray-300 text-gray-700 hover:border-[#1B5E20]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading & Error */}
        {loading && <p className="text-center text-gray-600 py-12">Loading harvests...</p>}
        {error && <p className="text-center text-red-600 py-12">Error: {error}</p>}

        {/* Recommended */}
        {!loading && !error && recommended.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#1B5E20] animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recommended For You</h2>
              <span className="text-xs text-gray-500">— matched by freshness & price</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recommended.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* All Produce */}
        {!loading && !error && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">All Produce</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-600 py-12">No produce matches your search.</p>
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

export default BuyerMarketplace