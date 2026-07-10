import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const ROLES = ['farmer', 'buyer', 'transporter']
const REGIONS = ['Bono East', 'Ashanti', 'Northern', 'Eastern', 'Volta', 'Greater Accra']

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('farmer')
  const [region, setRegion] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [newUserRole, setNewUserRole] = useState(null)

  const handleSignup = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    const { error: profileError } = await supabase.from('users').insert({
      auth_id: authData.user.id,
      role,
      name,
      phone: phone.startsWith('+233') ? phone : `+233${phone}`,
      region: role === 'farmer' ? region : null,
    })

    setSubmitting(false)

    if (profileError) {
      setError(profileError.message)
    } else {
      setNewUserRole(role)
      setShowWelcome(true)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  const handleContinue = () => {
    const routes = {
      farmer: '/dashboard',
      buyer: '/marketplace',
      transporter: '/logistics',
    }
    navigate(routes[newUserRole])
  }

  // Welcome Screen (Post-Signup)
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center"
        >
          <h1 className="font-[var(--font-heading)] text-3xl text-[var(--color-primary)] mb-2">
            Welcome, {name}!
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            You're registered as a <strong className="capitalize">{newUserRole}</strong>
          </p>

          <div className="bg-[#E8F5E9] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              {newUserRole === 'farmer' &&
                'You can now publish your produce listings, manage your inventory, and receive orders from buyers.'}
              {newUserRole === 'buyer' &&
                'You can now browse the marketplace, place orders, and track your deliveries in real-time.'}
              {newUserRole === 'transporter' &&
                'You can now accept delivery jobs, manage your route, and track earnings.'}
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-md font-bold text-lg hover:brightness-95 active:scale-[0.98] transition-all"
          >
            Get Started →
          </button>

          <p className="mt-4 text-xs text-gray-500">
            You can always log out and switch roles later
          </p>
        </motion.div>
      </div>
    )
  }

  // Existing Auth Forms
  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SIDE - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex flex-col justify-center items-center px-10 py-16 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]"
      >
        <h2 className="font-[var(--font-heading)] text-4xl text-[#1B5E20] text-center font-bold">
          AgriMatch
        </h2>

        <p className="mt-4 text-center text-[#2E7D32] max-w-xs leading-relaxed text-base font-medium">
          Connecting Ghana's farmers, buyers, and transporters. Direct marketplace. Real prices. Fast logistics.
        </p>

        <div className="mt-8 space-y-3 text-sm text-[#1B5E20]">
          <div className="flex items-start gap-3">
            <span className="text-xl">-</span>
            <span className="font-medium">No middlemen, fair pricing</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">-</span>
            <span className="font-medium">Verified farmers & buyers</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">-</span>
            <span className="font-medium">12-hour farm to delivery</span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT SIDE - Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center px-6 md:px-10 py-16 bg-white md:bg-white"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">
            <h2 className="font-[var(--font-heading)] text-3xl text-[var(--color-primary)] font-bold">AgriMatch</h2>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-md text-sm font-semibold border transition-all ${
                mode === 'signup'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-md text-sm font-semibold border transition-all ${
                mode === 'login'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
              }`}
            >
              Log In
            </button>
          </div>

          {mode === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">I am a</label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2.5 px-3 rounded-md text-xs font-semibold border capitalize transition-all ${
                        role === r
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'border-gray-300 text-gray-600 hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="24XXXXXXX"
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                />
              </div>

              {/* Region (Farmers only) */}
              {role === 'farmer' && (
                <div>
                  <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">Region</label>
                  <select
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password with Toggle Switch */}
              <div>
                <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">Password</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`w-12 h-7 rounded-full transition-all flex items-center px-1 ${
                      showPassword ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        showPassword ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-md font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-8 text-base"
              >
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password with Toggle Switch */}
              <div>
                <label className="text-xs font-bold tracking-wide text-gray-700 uppercase">Password</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`w-12 h-7 rounded-full transition-all flex items-center px-1 ${
                      showPassword ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        showPassword ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-md font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-8 text-base"
              >
                {submitting ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-700">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="text-[var(--color-primary)] font-bold hover:underline"
            >
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth