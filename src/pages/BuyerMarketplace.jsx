import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import FarmerMap from '../components/FarmerMap'
import ChatWindow from '../components/ChatWindow'
import ConversationList from '../components/ConversationList'

const CROP_TYPES = ['Tomatoes', 'Peppers', 'Garden Eggs', 'Okra']
const REGIONS = ['Bono East', 'Ashanti', 'Northern', 'Eastern', 'Volta', 'Greater Accra']

function BuyerMarketplace() {
  const { user, loading: userLoading } = useCurrentUser()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter states
  const [selectedCrop, setSelectedCrop] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [showChat, setShowChat] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatName, setChatName] = useState('')

  // Fetch listings with filters
  useEffect(() => {
    async function fetchListings() {
      let query = supabase
        .from('listings')
        .select('*, users(name, region, rating)')
        .order('created_at', { ascending: false })

      // Apply crop type filter
      if (selectedCrop) {
        query = query.eq('crop_type', selectedCrop)
      }

      // Apply location filter
      if (selectedLocation) {
        query = query.eq('location', selectedLocation)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
      } else {
        // Apply price range filter (client-side for better performance)
        const filtered = data.filter(
          (listing) =>
            Number(listing.price_per_unit) >= priceRange[0] &&
            Number(listing.price_per_unit) <= priceRange[1]
        )
        setListings(filtered)
      }
      setLoading(false)
    }

    fetchListings()
  }, [selectedCrop, selectedLocation, priceRange])

  // Reset filters
  const resetFilters = () => {
    setSelectedCrop('')
    setSelectedLocation('')
    setPriceRange([0, 5000])
  }

  const activeFilterCount = [selectedCrop, selectedLocation].filter(Boolean).length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0F1C2E] backdrop-blur-sm border-b border-gray-700">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-white">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <span className="text-gray-300">Marketplace</span>
          <Link to="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <Link to="/logistics" className="text-gray-300 hover:text-white">
            Logistics
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user && <span className="text-xs text-gray-400 hidden sm:inline">Logged in as {user?.name}</span>}
          {user && (
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="text-xs border border-gray-600 text-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
            >
              Log Out
            </button>
          )}
          {!user && (
            <Link
              to="/auth"
              className="text-xs border border-gray-600 text-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">Marketplace</h1>
            <p className="mt-1 text-gray-600 text-sm">
              Browse fresh produce from verified farmers across Ghana.
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden relative px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--color-secondary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                viewMode === 'map'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              Map
            </button>
          </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${
              showFilters ? 'block' : 'hidden'
            } md:block md:col-span-1 space-y-6`}
          >
            <div className="md:hidden flex justify-between items-center mb-4">
              <h2 className="font-[var(--font-heading)] text-lg">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Filter Card */}
            <div className="border border-gray-200 rounded-lg p-5 space-y-5">
              {/* Crop Type Filter */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Crop Type
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                >
                  <option value="">All Crops</option>
                  {CROP_TYPES.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                >
                  <option value="">All Locations</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Price per KG: GH₵{priceRange[0]} - GH₵{priceRange[1]}
                </label>
                <div className="mt-3 space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                  />
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* Reset Button */}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </motion.aside>

          {/* Listings Grid */}
          <div className="md:col-span-3">
            {loading && <p className="text-center text-gray-500 py-12">Loading listings...</p>}
            {error && <p className="text-center text-red-500 py-12">Error: {error}</p>}

            {!loading && !error && listings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No listings match your filters.</p>
                <button
                  onClick={resetFilters}
                  className="text-[var(--color-primary)] font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {!loading && !error && listings.length > 0 && viewMode === 'map' && (
              <FarmerMap listings={listings} />
            )}

            {!loading && !error && listings.length > 0 && viewMode === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={listing.image_url}
                        alt={listing.crop_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-charcoal)]">
                        {listing.crop_type}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {listing.quantity}kg · GH₵{listing.price_per_unit}/kg
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        {listing.location}
                      </p>

                      {/* Farmer Info */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            {listing.users?.name}
                          </p>
                          {listing.users?.rating && (
                            <p className="text-xs text-yellow-600">
                              ⭐ {listing.users.rating.toFixed(1)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Button */}
                      <div className="mt-4 space-y-2">
                        <Link
                          to={`/product/${listing.id}`}
                          className="block w-full bg-[var(--color-secondary)] text-white px-4 py-2 rounded-md text-sm font-medium text-center hover:brightness-95 transition-all active:scale-[0.98]"
                        >
                          View & Order
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedChat(listing.farmer_id)
                            setChatName(listing.users?.name)
                            setShowChat(true)
                          }}
                          className="w-full border border-[#2E7D32] text-[#2E7D32] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#E8F5E9] transition-all"
                        >
                          Message Farmer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 md:px-10 py-12 text-center mt-16">
        <div className="max-w-2xl mx-auto">
          <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
          <div className="my-4 h-px bg-gray-200" />
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Empowering the backbone of Ghana's economy through technology that respects the soil.
          </p>
          <p className="text-gray-500 text-xs tracking-wide">
            © 2026 AgriMatch · Techiman Regional Hub, Bono East
          </p>
        </div>
     </footer>

      {/* Chat Button - Desktop & Mobile */}
      {!showChat && !selectedChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-lg hover:brightness-95 transition-all z-40 text-2xl"
          title="Open messages"
        >
          💬
        </button>
      )}

      {/* Chat Panel - Desktop */}
      {showChat && !selectedChat && (
        <div className="hidden md:flex gap-4 fixed right-6 bottom-6 z-40">
          <div className="w-96 h-96 shadow-xl">
            <ConversationList
              currentUser={user}
              onSelectConversation={(id, name) => {
                setSelectedChat(id)
                setChatName(name)
              }}
            />
          </div>
        </div>
      )}

      {/* Direct Chat Window (when selectedChat is already set) */}
      {selectedChat && (
        <div className="hidden md:flex gap-4 fixed right-6 bottom-6 z-40">
          <div className="w-96 h-96 shadow-xl">
            <ChatWindow
              conversationWith={selectedChat}
              conversationName={chatName}
              currentUser={user}
              onClose={() => {
                setSelectedChat(null)
                setShowChat(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Chat Panel - Mobile Modal */}
      {showChat && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex flex-col">
          <div className="flex-1 flex flex-col bg-white">
            <button
              onClick={() => {
                setShowChat(false)
                setSelectedChat(null)
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl z-50"
            >
              ✕
            </button>
            {!selectedChat ? (
              <ConversationList
                currentUser={user}
                onSelectConversation={(id, name) => {
                  setSelectedChat(id)
                  setChatName(name)
                }}
              />
            ) : (
              <ChatWindow
                conversationWith={selectedChat}
                conversationName={chatName}
                currentUser={user}
                onClose={() => setSelectedChat(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerMarketplace