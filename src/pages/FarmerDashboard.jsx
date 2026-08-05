import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
import ChatWindow from '../components/ChatWindow'
import ConversationList from '../components/ConversationList'
import FarmerOrders from '../components/FarmerOrders'
import { isListingExpired } from '../lib/listingHelpers'

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
  const [showChat, setShowChat] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatName, setChatName] = useState('')
  const [listingCount, setListingCount] = useState(0)
  const [editingListing, setEditingListing] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editPrice, setEditPrice] = useState('')
 const [deletingId, setDeletingId] = useState(null)
const [newListingId, setNewListingId] = useState(null)
const [showOrderNotification, setShowOrderNotification] = useState(false)
const [newOrderMessage, setNewOrderMessage] = useState('')
const [unreadMessages, setUnreadMessages] = useState(0)
const [pendingOrders, setPendingOrders] = useState(0)

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

    const { data: newListing, error } = await supabase
      .from('listings')
      .insert({
        farmer_id: user.id,
        crop_type: selectedCrop,
        quantity: Number(quantity),
        price_per_unit: Number(price),
        location,
        freshness,
        image_url: imageUrl,
      })
      .select()
      .single()

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setNewListingId(newListing.id)
      setQuantity('')
      setPrice('')
      setLocation('')
      setImageFile(null)
      setImagePreview(null)
      setTimeout(() => {
        setSuccess(false)
        setNewListingId(null)
      }, 5000)
    }
  }
const startEdit = (listing) => {
    setEditingListing(listing.id)
    setEditQuantity(listing.quantity)
    setEditPrice(listing.price_per_unit)
  }

  const cancelEdit = () => {
    setEditingListing(null)
    setEditQuantity('')
    setEditPrice('')
  }

  const saveEdit = async (listingId) => {
    const { error } = await supabase
      .from('listings')
      .update({
        quantity: Number(editQuantity),
        price_per_unit: Number(editPrice),
      })
      .eq('id', listingId)

    if (!error) {
      setMyListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? { ...l, quantity: Number(editQuantity), price_per_unit: Number(editPrice) }
            : l
        )
      )
      cancelEdit()
    }
  }

  const deleteListing = async (listingId) => {
    setDeletingId(listingId)
    const { error } = await supabase.from('listings').delete().eq('id', listingId)

    if (!error) {
      setMyListings((prev) => prev.filter((l) => l.id !== listingId))
      setListingCount((prev) => prev - 1)
    }
    setDeletingId(null)
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

    // Listen for new orders on this farmer's listings
    const ordersChannel = supabase
      .channel('farmer-new-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setNewOrderMessage('🎉 New order received!')
          setShowOrderNotification(true)
          setTimeout(() => setShowOrderNotification(false), 4000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
    }
  }, [user, success])

  useEffect(() => {
    if (!user) return

    async function fetchBadges() {
      const { data: msgs } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('read', false)
      setUnreadMessages(msgs?.length || 0)

      const { data: listings } = await supabase
        .from('listings')
        .select('id')
        .eq('farmer_id', user.id)

      if (listings?.length) {
        const listingIds = listings.map((l) => l.id)
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .in('listing_id', listingIds)
          .eq('status', 'pending')
        setPendingOrders(orders?.length || 0)
      }
    }
    fetchBadges()

    const channel = supabase
      .channel('farmer-badges')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchBadges()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => fetchBadges()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  useEffect(() => {
    if (showChat || selectedChat) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showChat, selectedChat])

  if (userLoading) return (
    <div className="p-10 text-center text-gray-500">
      <p>Loading your dashboard...</p>
    </div>
  )

  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in to access the farmer dashboard.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block font-semibold">
        Go to Login
      </Link>
    </div>
  )

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
                onClick={() => navigate(-1)}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={() => navigate('/role-switch')}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                Switch Role
              </button>
              <Link to="/marketplace" className="text-white/80 hover:text-white transition-colors">
                Marketplace
              </Link>
              <button
  onClick={() => setShowChat(true)}
  className="relative text-white/80 hover:text-white transition-colors text-sm font-medium"
>
  Messages
  {unreadMessages > 0 && (
    <span className="absolute -top-2 -right-3 bg-[var(--color-secondary)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
      {unreadMessages}
    </span>
  )}
</button>
             <Link to="/logistics" className="text-white/80 hover:text-white transition-colors">
                Logistics
              </Link>
              <button
  onClick={() => navigate('/buyer-orders')}
  className="relative text-white/80 hover:text-white transition-colors text-sm font-medium"
>
  Orders
  {pendingOrders > 0 && (
    <span className="absolute -top-2 -right-3 bg-[var(--color-secondary)] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
      {pendingOrders}
    </span>
  )}
</button>
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

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 z-40 flex items-center justify-around px-2 py-3">
          <Link to="/marketplace" className="flex flex-col items-center text-xs text-[var(--color-charcoal)]/70">
            <span className="text-lg">🛒</span>Market
          </Link>
          <button onClick={() => setShowChat(true)} className="relative flex flex-col items-center text-xs text-[var(--color-charcoal)]/70">
            <span className="text-lg">💬</span>Messages
            {unreadMessages > 0 && <span className="absolute -top-1 right-1 bg-[var(--color-secondary)] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadMessages}</span>}
          </button>
          <Link to="/buyer-orders" className="relative flex flex-col items-center text-xs text-[var(--color-charcoal)]/70">
            <span className="text-lg">📦</span>Orders
            {pendingOrders > 0 && <span className="absolute -top-1 right-1 bg-[var(--color-secondary)] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{pendingOrders}</span>}
          </Link>
          <Link to="/logistics" className="flex flex-col items-center text-xs text-[var(--color-charcoal)]/70">
            <span className="text-lg">🚛</span>Logistics
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12 pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* LEFT COLUMN - Form */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">
            {/* Hero Section */}
            <div>
              <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] mb-3 sm:mb-4">
                List your fresh <span className="text-[var(--color-primary)] italic">harvest.</span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-charcoal)]/70 max-w-md">
                Direct access to Ghanaian retailers and bulk buyers. No middlemen, fair prices.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePublish} className="space-y-6 sm:space-y-8">
              {/* 1. Crop Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-3 sm:mb-5">
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
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-lg'
                          : 'border-black/10 hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="aspect-square bg-[var(--color-surface)] overflow-hidden">
                        <img
                          src={crop.image}
                          alt={crop.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white text-center">
                        <p className={`text-xs sm:text-sm font-semibold transition-colors ${
                          selectedCrop === crop.id
                            ? 'text-[var(--color-primary)]'
                            : 'text-[var(--color-charcoal)]/70'
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
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                  2. Upload photo (optional)
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden border-2 border-[var(--color-primary)]">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 sm:h-64 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        className="absolute top-2 right-2 bg-[var(--color-secondary-dark)] text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold hover:brightness-95 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-black/15 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-[var(--color-charcoal)]/80">Click to upload photo</p>
                        <p className="text-xs text-[var(--color-charcoal)]/50">High-quality photos get more buyers</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* 3. Quantity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                    3. Quantity (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.00"
                      className="w-full border-2 border-black/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    />
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[var(--color-charcoal)]/50 font-semibold text-sm">kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                    4. Price per kg (GH₵)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full border-2 border-black/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    />
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[var(--color-charcoal)]/50 font-semibold text-sm">GH₵</span>
                  </div>
                </div>
              </div>

              {/* 5. Location */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
                  5. Pickup location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Techiman, Bono East"
                  className="w-full border-2 border-black/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                />
              </div>

              {/* 6. Freshness */}
              <div>
                <label className="block text-xs sm:text-sm font-bold tracking-wider text-[var(--color-charcoal)]/80 uppercase mb-2 sm:mb-3">
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
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'border-black/10 text-[var(--color-charcoal)]/80 hover:border-[var(--color-primary)]'
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
                <div className="bg-[var(--color-primary-light)]/20 border-2 border-[var(--color-primary)]/30 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-[var(--color-primary-dark)] font-medium mb-3">
                    Your listing has been published successfully! Buyers can see it now.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/product/${newListingId}`}
                      className="text-xs font-bold text-white bg-[var(--color-primary)] px-3 py-1.5 rounded-md hover:brightness-95 transition-all"
                    >
                      View Listing
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccess(false)
                        setNewListingId(null)
                      }}
                      className="text-xs font-bold text-[var(--color-primary-dark)] border border-[var(--color-primary)]/40 px-3 py-1.5 rounded-md hover:bg-[var(--color-primary)]/5 transition-all"
                    >
                      Add Another
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex-1 bg-[var(--color-primary)] text-white py-3 px-4 sm:px-6 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-sm sm:text-base"
                >
                  {uploading ? 'Uploading...' : submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
                <Link
                  to="/marketplace"
                  className="flex-1 border-2 border-[var(--color-primary)] text-[var(--color-primary)] py-3 px-4 sm:px-6 rounded-lg font-bold hover:bg-[var(--color-primary)]/5 transition-all text-center text-sm sm:text-base"
                >
                  View Marketplace
                </Link>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black/10 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--color-charcoal)] text-sm sm:text-base truncate">{user?.name}</h3>
                  <p className="text-xs text-[var(--color-charcoal)]/50 truncate">{user?.phone}</p>
                </div>
              </div>
              <div className="border-t border-black/10 pt-4">
                <p className="text-xs uppercase font-bold text-[var(--color-charcoal)]/50 mb-2">Account Role</p>
                <p className="font-semibold text-[var(--color-charcoal)] text-sm capitalize">Farmer</p>
              </div>
            </div>

            {/* Orders Received Card */}
            <FarmerOrders user={user} />

            {/* Active Listings Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black/10 p-4 sm:p-6 shadow-sm">
              <h2 className="font-[var(--font-heading)] text-base sm:text-lg text-[var(--color-charcoal)] mb-3 sm:mb-4">My Active Listings</h2>
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[var(--color-primary-light)]/25 rounded-lg">
                <p className="text-xs text-[var(--color-charcoal)]/60 uppercase font-bold">Total listings</p>
                <p className="font-[var(--font-heading)] text-3xl sm:text-4xl font-bold text-[var(--color-secondary)]">{listingCount}</p>
              </div>

              {myListings.length === 0 ? (
                <p className="text-xs sm:text-sm text-[var(--color-charcoal)]/50 text-center py-6">
                  No listings yet. Publish your first harvest above.
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className={`p-2 sm:p-3 rounded-lg hover:brightness-95 transition-colors ${
                        listing.id === newListingId
                          ? 'bg-[var(--color-secondary-light)]/25 ring-2 ring-[var(--color-secondary)]'
                          : 'bg-[var(--color-surface)]'
                      }`}
                    >
                      {editingListing === listing.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={listing.image_url}
                              alt={listing.crop_type}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                            <p className="font-semibold text-[var(--color-charcoal)] text-xs sm:text-sm">{listing.crop_type}</p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              placeholder="Qty (kg)"
                              className="w-1/2 border border-black/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-[var(--color-primary)]"
                            />
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder="Price/kg"
                              className="w-1/2 border border-black/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-[var(--color-primary)]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(listing.id)}
                              className="flex-1 bg-[var(--color-primary)] text-white text-xs font-semibold py-1.5 rounded hover:brightness-95 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 border border-black/10 text-[var(--color-charcoal)]/70 text-xs font-semibold py-1.5 rounded hover:bg-black/5 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img
                            src={listing.image_url}
                            alt={listing.crop_type}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[var(--color-charcoal)] text-xs sm:text-sm truncate">
                              {listing.crop_type}
                              {isListingExpired(listing) && (
                                <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">EXPIRED</span>
                              )}
                            </p>
                            <p className="text-xs text-[var(--color-charcoal)]/60">
                              {listing.quantity}kg at GH₵{listing.price_per_unit}/kg
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => startEdit(listing)}
                              className="text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)] px-2 py-1 rounded hover:bg-[var(--color-primary)]/5 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteListing(listing.id)}
                              disabled={deletingId === listing.id}
                              className="text-xs font-semibold text-red-600 border border-red-300 px-2 py-1 rounded hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                              {deletingId === listing.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Market Insight Card */}
            <div className="bg-white rounded-lg sm:rounded-xl border-2 border-black/10 overflow-hidden shadow-sm">
              <div className="aspect-video bg-[var(--color-surface)] overflow-hidden">
                <img
                  src="/images/market/market-general.jpg"
                  alt="Market insight"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="font-[var(--font-heading)] text-[var(--color-charcoal)] mb-2 text-sm sm:text-base">Market Trend</h3>
                <p className="text-xs sm:text-sm text-[var(--color-charcoal)]/70 leading-relaxed">
                  Grade-A produce trending upward in Techiman Hub. Buyers actively seeking quality harvests.
                </p>
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="bg-[var(--color-primary-dark)] text-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="font-[var(--font-heading)] mb-3 sm:mb-4 text-sm sm:text-base">Quick Tips</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0 text-[var(--color-primary-light)]">•</span>
                  <span className="text-white/90">Upload clear, quality photos</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0 text-[var(--color-primary-light)]">•</span>
                  <span className="text-white/90">Price competitively with trends</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold flex-shrink-0 text-[var(--color-primary-light)]">•</span>
                  <span className="text-white/90">Fresh harvests get more interest</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
   </main>

      {/* Order Notification Toast */}
      {showOrderNotification && (
        <div className="fixed top-6 right-6 bg-[var(--color-primary-dark)] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg z-50 animate-pulse">
          <p className="text-sm sm:text-base font-semibold">{newOrderMessage}</p>
        </div>
      )}

      {/* Chat Bubble - desktop only */}
      {!showChat && !selectedChat && (
        <button
          onClick={() => setShowChat(true)}
          className="hidden md:flex fixed right-6 bottom-6 w-14 h-14 rounded-full bg-[var(--color-secondary)] text-white items-center justify-center shadow-lg hover:brightness-95 transition-all z-[9999] text-2xl"
          title="Open messages"
        >
          💬
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--color-secondary-dark)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </button>
      )}

      {/* Desktop Chat Panel */}
      {(showChat || selectedChat) && (
        <div className="hidden md:block fixed right-6 bottom-6 z-50 w-96 shadow-2xl rounded-lg overflow-hidden"
          style={{ height: '480px' }}
        >
          {!selectedChat ? (
            <ConversationList
              currentUser={user}
              onSelectConversation={(id, name) => {
                setSelectedChat(id)
                setChatName(name)
              }}
              onClose={() => {
                setShowChat(false)
                setSelectedChat(null)
              }}
            />
          ) : (
            <ChatWindow
              conversationWith={selectedChat}
              conversationName={chatName}
              currentUser={user}
              onClose={() => {
                setSelectedChat(null)
                setShowChat(false)
              }}
            />
          )}
        </div>
      )}

      {/* Mobile Chat Modal */}
{(showChat || selectedChat) && (
  <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) { setShowChat(false); setSelectedChat(null) } }}>
    <div className="flex flex-col bg-white rounded-t-2xl overflow-hidden mt-auto" style={{ height: '85dvh' }}>
            {!selectedChat ? (
              <ConversationList
                currentUser={user}
                onSelectConversation={(id, name) => {
                  setSelectedChat(id)
                  setChatName(name)
                }}
                onClose={() => {
                  setShowChat(false)
                  setSelectedChat(null)
                }}
              />
            ) : (
              <ChatWindow
                conversationWith={selectedChat}
                conversationName={chatName}
                currentUser={user}
                onClose={() => {
                  setSelectedChat(null)
                  setShowChat(false)
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerDashboard