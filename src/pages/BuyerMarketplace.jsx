import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const PRODUCE = [
  {
    id: 1,
    name: 'Grade-A Tomatoes',
    farmer: 'Kofi Mensah',
    location: 'Techiman Hub',
    distance: '1.2km',
    price: 45,
    unit: 'crate',
    image: '/images/produce/tomatoes.jpg',
    urgent: true,
    category: 'Vegetables',
  },
  {
    id: 2,
    name: 'Fresh Bird\'s Eye Peppers',
    farmer: 'Abena Osei',
    location: 'Tuobodom',
    distance: '4.5km',
    price: 30,
    unit: 'crate',
    image: '/images/produce/peppers.jpg',
    urgent: true,
    category: 'Vegetables',
  },
  {
    id: 3,
    name: 'Garden Eggs',
    farmer: 'Yaw Boateng',
    location: 'Techiman Central',
    distance: '0.8km',
    price: 25,
    unit: 'crate',
    image: '/images/produce/garden-eggs.jpg',
    urgent: false,
    category: 'Vegetables',
  },
  {
    id: 4,
    name: 'Fresh Okra',
    farmer: 'Ama Serwaa',
    location: 'Kintampo South',
    distance: '6.1km',
    price: 20,
    unit: 'crate',
    image: '/images/produce/okra.jpg',
    urgent: false,
    category: 'Vegetables',
  },
]

const CATEGORIES = ['All Produce', 'Tubers', 'Grains', 'Legumes', 'Fruits', 'Vegetables']

function ProductCard({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="border border-gray-200 rounded-lg overflow-hidden group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {item.urgent && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-pulse" />
            Urgent Pickup
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-[var(--font-heading)] text-lg">{item.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {item.farmer} · {item.location} ({item.distance})
            </p>
          </div>
          <p className="font-[var(--font-heading)] text-lg text-[var(--color-secondary)] whitespace-nowrap">
            GH₵{item.price}
            <span className="text-xs text-gray-400">/{item.unit}</span>
          </p>
        </div>
        <Link
          to={`/product/${item.id}`}
          className="mt-3 inline-block w-full text-center bg-[var(--color-primary)] text-white py-2 rounded-md text-sm font-medium hover:brightness-95 transition-all"
        >
          View & Order
        </Link>
      </div>
    </motion.div>
  )
}

function BuyerMarketplace() {
  const [activeCategory, setActiveCategory] = useState('All Produce')
  const [search, setSearch] = useState('')

  const filtered = PRODUCE.filter((item) => {
    const matchesCategory = activeCategory === 'All Produce' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <span className="pb-1 border-b-2 border-[var(--color-primary)]">Marketplace</span>
          <Link to="/dashboard">Dashboard</Link>
          <span>Logistics</span>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">The Seasonal Harvest</h1>
        <p className="mt-2 text-gray-600 text-sm max-w-md">
          Sourced directly from the Techiman Hub and surrounding Bono East farmlands.
          Freshness prioritized, quality guaranteed.
        </p>

        {/* Search */}
        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search harvests..."
            className="w-full md:w-80 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
          />
        </div>

        {/* Category filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                activeCategory === cat
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-gray-500">No produce matches your search.</p>
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500 mt-16">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-2 max-w-sm">
          Connecting Ghana's agricultural heritage with digital efficiency.
        </p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default BuyerMarketplace