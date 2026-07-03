import { useState } from 'react'
import { Link } from 'react-router-dom'

const CROPS = [
  { id: 'tomatoes', label: 'Tomatoes', image: '/images/produce/tomatoes.jpg' },
  { id: 'peppers', label: 'Peppers', image: '/images/produce/peppers.jpg' },
  { id: 'garden-eggs', label: 'Garden Eggs', image: '/images/produce/garden-eggs.jpg' },
]

const FRESHNESS_OPTIONS = [
  { id: 'today', label: 'Harvested Today' },
  { id: 'yesterday', label: 'Harvested Yesterday' },
  { id: 'tomorrow', label: 'Harvesting Tomorrow' },
]

function App() {
  const [selectedCrop, setSelectedCrop] = useState('tomatoes')
  const [freshness, setFreshness] = useState('today')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')

  const handlePublish = (e) => {
    e.preventDefault()
    console.log({ selectedCrop, quantity, price, location, freshness })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)] border-b border-gray-200">
        <span className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </span>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace" className="text-gray-600 hover:text-[var(--color-charcoal)]">Marketplace</Link>
          <span className="pb-1 border-b-2 border-[var(--color-primary)]">Dashboard</span>
          <span>Logistics</span>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-12 grid md:grid-cols-3 gap-12">
        {/* Left: listing form */}
        <form onSubmit={handlePublish} className="md:col-span-2 space-y-8">
          <div>
            <h1 className="font-[var(--font-heading)] text-4xl md:text-5xl leading-tight">
              List your fresh <span className="italic text-[var(--color-secondary)]">harvest today.</span>
            </h1>
            <p className="mt-3 text-gray-600 max-w-md">
              Direct access to Ghanaian retailers and bulk buyers. Provide accurate details to
              ensure trust and speed in your transactions.
            </p>
          </div>

          {/* Step 1: crop type */}
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 mb-3">
              1. SELECT CROP TYPE
            </p>
            <div className="grid grid-cols-3 gap-3">
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

          {/* Step 2 & 3: quantity + price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">
                2. TOTAL QUANTITY (CRATES)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">
                3. PRICE PER CRATE (GH₵)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>
          </div>

          {/* Step 4: location */}
          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-500">
              4. PICKUP LOCATION
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Town, Region (e.g. Techiman, Bono East)"
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
            />
          </div>

          {/* Step 5: freshness */}
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
                  <span
                    className={`w-2 h-2 rounded-full ${
                      opt.id === 'today' ? 'bg-[var(--color-secondary)] animate-pulse' : 'bg-gray-300'
                    }`}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-[var(--color-secondary)] text-white px-6 py-3 rounded-md font-medium tracking-wide hover:brightness-95 active:scale-[0.98] transition-all"
            >
              PUBLISH LISTING
            </button>
            <button
              type="button"
              className="border border-gray-300 px-6 py-3 rounded-md font-medium tracking-wide hover:bg-gray-50 transition-colors"
            >
              SAVE AS DRAFT
            </button>
          </div>
        </form>

        {/* Right: market insight sidebar */}
        <aside className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-5 bg-[var(--color-background-warm)]">
            <h2 className="font-[var(--font-heading)] text-xl">Market Insight</h2>
            <p className="mt-2 text-sm text-gray-600">
              Current market prices in <strong>Techiman Hub</strong> are trending upward for
              grade-A tomatoes.
            </p>
            <div className="mt-4 flex justify-between text-sm border-t border-gray-200 pt-3">
              <span className="text-gray-500">AVERAGE PRICE</span>
              <span className="font-[var(--font-heading)]">GH₵ 420.00</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">ACTIVE BUYERS</span>
              <span className="font-[var(--font-heading)]">142</span>
            </div>
            <div className="mt-4 aspect-[3/4] rounded-md overflow-hidden bg-gray-100">
              <img
                src="/images/farmers/farmer-portrait.jpg"
                alt="Farmer in field"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-[var(--color-primary)] text-white rounded-lg p-5">
            <h3 className="font-[var(--font-heading)] italic text-lg">Trusted Seller Program</h3>
            <p className="mt-2 text-sm text-white/85">
              Complete your 3rd successful harvest listing this month to unlock "Premium
              Producer" status and priority logistics.
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App