import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const ROLES = ['farmer', 'buyer', 'transporter']
const REGIONS = ['Bono East', 'Ashanti', 'Northern', 'Eastern', 'Volta', 'Greater Accra']

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup') // 'signup' or 'login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('farmer')
  const [region, setRegion] = useState('')
  const [error, setError] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // 1. Create the auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    // 2. Upload profile photo if provided
    let avatarUrl = null
    if (profileImage) {
      const fileExt = profileImage.name.split('.').pop()
      const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('produce-images')
        .upload(fileName, profileImage)

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('produce-images')
          .getPublicUrl(fileName)
        avatarUrl = publicUrlData.publicUrl
      }
    }

    // 3. Create the matching row in our `users` table
    const { error: profileError } = await supabase.from('users').insert({
      auth_id: authData.user.id,
      role,
      name,
      phone: phone.startsWith('+233') ? phone : `+233${phone}`,
      region: role === 'farmer' ? region : null,
      avatar_url: avatarUrl,
    })

    setSubmitting(false)

    if (profileError) {
      setError(profileError.message)
    } else {
      navigate(role === 'farmer' ? '/dashboard' : role === 'buyer' ? '/marketplace' : '/logistics')
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>

        <div className="flex gap-2 mt-8 mb-6">
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
              mode === 'signup'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
              mode === 'login'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            Log In
          </button>
        </div>

        {mode === 'signup' ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">I AM A</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-md text-sm border capitalize transition-colors ${
                      role === r
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
             <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">
                PROFILE PHOTO (OPTIONAL)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
                className="mt-2 w-full text-sm border border-gray-300 rounded-md px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:text-white file:text-xs"
              />
            </div>   
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">FULL NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">PHONE NUMBER</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="24XXXXXXX"
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            {role === 'farmer' && (
              <div>
                <label className="text-xs font-semibold tracking-wide text-gray-500">REGION</label>
                <select
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                >
                  <option value="">Select region</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">PASSWORD</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-md font-medium hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wide text-gray-500">PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-md font-medium hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default Auth