import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

function Stars({ count }) {
  return (
    <span className="text-[#1B5E20] text-sm">
      {'★'.repeat(count)}
      <span className="text-gray-300">{'★'.repeat(5 - count)}</span>
    </span>
  )
}

function RatingsReviews() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, reviewer:reviewer_id(name), reviewed:reviewed_id(name, role)')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setReviews(data)
      }
      setLoading(false)
    }

    fetchReviews()
  }, [])

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
              <Link to="/marketplace" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Marketplace
              </Link>
              <span className="pb-2 border-b-2 border-[#1B5E20] text-[#1B5E20]">Reviews</span>
              <Link to="/dashboard" className="text-gray-600 hover:text-[#1B5E20] transition-colors">
                Dashboard
              </Link>
            </nav>
            <Link to="/auth" className="text-xs sm:text-sm font-semibold text-[#1B5E20] hover:text-[#0d3a14] transition-colors border-2 border-[#1B5E20] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
        {/* Hero */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
            Reputation & <span className="text-[#2E7D32]">Community</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-md">
            Transparency drives the AgriMatch ecosystem. Honest feedback from our network of farmers, buyers, and logistics partners.
          </p>
        </div>

        {loading && <p className="mt-12 text-center text-gray-600">Loading reviews...</p>}
        {error && <p className="mt-12 text-center text-red-600">Error: {error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p className="mt-12 text-center text-gray-600">No reviews yet.</p>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {review.reviewer?.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-gray-900 text-base sm:text-lg">
                          {review.reviewer?.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          reviewed <span className="font-semibold">{review.reviewed?.name}</span> 
                          <span className="text-gray-500"> ({review.reviewed?.role})</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Stars count={review.rating} />
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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

export default RatingsReviews