import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

const CROPS = [
  { id: 'Tomatoes', label: 'Tomatoes', image: '/images/produce/tomatoes.jpg' },
  { id: 'Peppers', label: 'Peppers', image: '/images/produce/peppers.jpg' },
  { id: 'Garden Eggs', label: 'Garden Eggs', image: '/images/produce/garden-eggs.jpg' },
  { id: 'Okra', label: 'Okra', image: '/images/produce/okra.jpg' },
]

const FRESHNESS_OPTIONS = [
  { id: 'Harvested Today', label: 'Harvested Today' },
  { id: 'Harvested Yesterday', label: 'Harvested Yesterday' },
  { id: 'Harvesting Tomorrow', label: 'Harvesting Tomorrow' },
]

function FarmerDashboard() {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useCurrentUser()
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes')
  const [freshness, setFreshness] = useState('Harvested Today')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [myListings, setMyListings] = useState([])
  const [listingCount, setListingCount] = useState(0)

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePublish = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    let imageUrl = CROPS.find((c) => c.id === selectedCrop)?.image

    if (imageFile) {
      setUploading(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('produce-images')
        .upload(fileName, imageFile)

      setUploading(false)

      if (uploadError) {
        setError(uploadError.message)
        setSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('produce-images')
        .getPublicUrl(fileName)

      imageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('listings').insert({
      farmer_id: user.id,
      crop_type: selectedCrop,
      quantity: Number(quantity),
      price_per_unit: Number(price),
      location,
      freshness,
      image_url: imageUrl,
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setQuantity('')
      setPrice('')
      setLocation('')
      setImageFile(null)
      setImagePreview(null)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  useEffect(() => {
    async function fetchMyListings() {
      if (!user) return
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })
      setMyListings(data || [])
      setListingCount(data?.length || 0)
    }
    fetchMyListings()
  }, [user, success])

  if (userLoading) return (
    <div className="p-10 text-center text-gray-500">
      <p>Loading your dashboard...</p>
    </div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in to access the farmer dashboard.</p>
      <Link to="/auth" className="text-[#1B5E20] underline mt-2 inline-block font-semibold">
        Go to Login
      </Link>
    </div>
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
                onClick={() => navigate('/role-switch')}
                className="text-gray-600 hover:text-[#1B5E20] transition-colors font-semibold"
              >
                Switch Role
              </button>
              <Link to="/marketplace" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-[#1B5E20] text-[#1B5E20]">
                Dashboard
              </span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* LEFT COLUMN - Form */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">
            {/* Hero Section */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
                List your fresh <span className="text-[#2E7D32]">harvest.</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-md">
                Direct access to Ghanaian retailers and bulk buyers. No middlemen, fair prices.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePublish} className="space-y-6 sm:space-y-8">
              {/* 1. Crop Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-gray-700 uppercase mb-3 sm:mb-5">
                  1. What are you selling?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  {CROPS.map((crop) => (
                    <button
                      type="button"
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={`group rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedCrop === crop.id
                          ? 'border-[#1B5E20] ring-2 ring-[#1B5E20]/20 shadow-lg'
                          : 'border-gray-200 hover:border-[#1B5E20]/50'
                      }`}
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={crop.image}
                          alt={crop.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white text-center">
                        <p className={`text-xs sm:text-sm font-semibold transition-colors ${
                          selectedCrop === crop.id
                            ? 'text-[#1B5E20]'
                            : 'text-gray-700'
                        }`}>
                          {crop.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-gray-700 uppercase mb-2 sm:mb-3">
                  2. Upload photo (optional)
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden border-2 border-[#1B5E20]">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 sm:h-64 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-[#1B5E20] hover:bg-[#1B5E20]/5 transition-all duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">Click to upload photo</p>
                        <p className="text-xs text-gray-500">High-quality photos get more buyers</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* 3. Quantity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold tracking-wider text-gray-700 uppercase mb-2 sm:mb-3">
                    3. Quantity (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.00"
                      className="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                    />
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold tracking-wider text-gray-700 uppercase mb-2 sm:mb-3">
                    4. Price per kg (GH₵)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                    />
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">GH₵</span>
                  </div>
                </div>
              </div>

              {/* 5. Location */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-gray-700 uppercase mb-2 sm:mb-3">
                  5. Pickup location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Techiman, Bono East"
                  className="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                />
              </div>

              {/* 6. Freshness */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-gray-700 uppercase mb-2 sm:mb-3">
                  6. Freshness
                </label>
                <div className="space-y-2">
                  {FRESHNESS_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setFreshness(opt.id)}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 font-medium transition-all text-left text-sm sm:text-base ${
                        freshness === opt.id
                          ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                          : 'border-gray-300 text-gray-700 hover:border-[#1B5E20]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-green-700 font-medium">
                    Your listing has been published successfully! Buyers can see it now.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex-1 bg-[#1B5E20] text-white py-3 px-4 sm:px-6 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-sm sm:text-base"
                >
                  {uploading ? 'Uploading...' : submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
                <Link
                  to="/marketplace"
                  className="flex-1 border-2 border-[#1B5E20] text-[#1B5E20] py-3 px-4 sm:px-6 rounded-lg font-bold hover:bg-[#1B5E20]/5 transition-all text-center text-sm sm:text-base"
                >
                  View Marketplace
                </Link>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{user?.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs uppercase font-bold text-gray-500 mb-2">Account Role</p>
                <p className="font-semibold text-gray-800 text-sm capitalize">Farmer</p>
              </div>
            </div>

            {/* Active Listings Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
              <h2 className="font-bold text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">My Active Listings</h2>
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#E8F5E9] rounded-lg">
                <p className="text-xs text-gray-600 uppercase font-bold">Total listings</p>
                <p className="text-3xl sm:text-4xl font-bold text-[#1B5E20]">{listingCount}</p>
              </div>

              {myListings.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 text-center py-6">
                  No listings yet. Publish your first harvest above.
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={listing.image_url}
                        alt={listing.crop_type}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{listing.crop_type}</p>
                        <p className="text-xs text-gray-600">
                          {listing.quantity}kg at GH₵{listing.price_per_unit}/kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Market Insight Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src="/images/market/market-general.jpg"
                  alt="Market insight"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Market Trend</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Grade-A tomatoes trending upward in Techiman Hub. Buyers actively seeking quality produce.
                </p>
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="bg-[#1B5E20] text-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Quick Tips</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>Upload clear, quality photos</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>Price competitively with trends</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span>Fresh harvests get more interest</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default FarmerDashboard