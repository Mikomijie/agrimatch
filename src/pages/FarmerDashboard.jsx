import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'
const CROPS = [
  { id: 'Tomatoes', label: 'Tomatoes', image: 'https://images.unsplash.com/photo-1592141521565-92f2a7c443e8?w=400&h=300&fit=crop' },
  { id: 'Peppers', label: 'Peppers', image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94549?w=400&h=300&fit=crop' },
  { id: 'Garden Eggs', label: 'Garden Eggs', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop' },
  { id: 'Okra', label: 'Okra', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop' },
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
  const [uploading, setUploading] = useState(false)
  const [myListings, setMyListings] = useState([])
  const handlePublish = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    let imageUrl = CROPS.find((c) => c.id === selectedCrop)?.image // fallback default

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
    }
    fetchMyListings()
  }, [user, success])
if (userLoading) return <p className="p-10 text-center text-gray-500">Loading...</p>
  if (!user) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Please log in to access the farmer dashboard.</p>
      <Link to="/auth" className="text-[var(--color-primary)] underline mt-2 inline-block">Go to Login</Link>
    </div>
  )
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)] border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace" className="text-gray-600 hover:text-[var(--color-charcoal)]">Marketplace</Link>
          <span className="pb-1 border-b-2 border-[var(--color-primary)]">Dashboard</span>
          <Link to="/logistics">Logistics</Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline">Logged in as {user?.name}</span>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
        <form onSubmit={handlePublish} className="md:col-span-2 space-y-6 md:space-y-8">
          <div>
            <h1 className="font-[var(--font-heading)] text-4xl md:text-5xl leading-tight">
              List your fresh <span className="italic text-[var(--color-secondary)]">harvest today.</span>
            </h1>
            <p className="mt-3 text-gray-600 max-w-md">
              Direct access to Ghanaian retailers and bulk buyers.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 mb-3">
              1. SELECT CROP TYPE
            </p>
            <div className="grid grid-cols-4 gap-3">
              {CROPS.map((crop) => (
                <button
                  type="button"
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`text-left rounded-lg overflow-hidden border transition-all ${
                    selectedCrop === crop.id
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                      : 'border-gray-200 hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    <img src={crop.image} alt={crop.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="px-3 py-2 text-sm font-medium">{crop.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              UPLOAD A REAL PHOTO (OPTIONAL — uses default crop image if skipped)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:text-white file:text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">
                2. TOTAL QUANTITY (KG)
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">
                3. PRICE PER KG (GH₵)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              4. PICKUP LOCATION
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Town, Region (e.g. Techiman, Bono East)"
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              5. HARVEST &amp; FRESHNESS
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              {FRESHNESS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFreshness(opt.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors ${
                    freshness === opt.id
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-[var(--color-primary)]">✓ Listing published successfully!</p>}

          <div className="flex gap-3 pt-2">
              <button
              type="submit"
              disabled={submitting}
              className="bg-[var(--color-secondary)] text-white px-6 py-3 rounded-md font-medium tracking-wide hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {uploading ? 'UPLOADING PHOTO...' : submitting ? 'PUBLISHING...' : 'PUBLISH LISTING'}
            </button>
            <Link
              to="/marketplace"
              className="border border-gray-300 px-6 py-3 rounded-md font-medium tracking-wide hover:bg-gray-50 transition-colors"
            >
              VIEW MARKETPLACE
            </Link>
            <Link
  to="/ussd"
  className="border border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-md font-medium tracking-wide hover:bg-[var(--color-primary)]/5 transition-colors"
>
  📵 TRY LOW-CONNECTIVITY MODE
</Link>
          </div>
        </form>

        <aside className="space-y-6 md:col-start-3">
          <div className="border border-gray-200 rounded-lg p-5">
            <h2 className="font-[var(--font-heading)] text-xl">My Active Listings</h2>
            {myListings.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">You haven't listed any produce yet.</p>
            )}
            <div className="mt-3 space-y-3">
              {myListings.map((l) => (
                <div key={l.id} className="flex items-center gap-3 text-sm">
                  <img src={l.image_url} alt={l.crop_type} className="w-10 h-10 rounded-md object-cover" />
                  <div>
                    <p className="font-medium">{l.crop_type}</p>
                    <p className="text-xs text-gray-500">{l.quantity}kg · GH₵{l.price_per_unit}/kg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 bg-[var(--color-background-warm)]">
            <h2 className="font-[var(--font-heading)] text-xl">Market Insight</h2>
            <p className="mt-2 text-sm text-gray-600">
              Current market prices in <strong>Techiman Hub</strong> are trending upward for
              grade-A tomatoes.
            </p>
            <div className="mt-4 aspect-[3/4] rounded-md overflow-hidden bg-gray-100">
             <img
                src="https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop"
                alt="Farmer in field" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default FarmerDashboard