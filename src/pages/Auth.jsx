import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'

const ROLES = [
  { id: 'farmer', label: 'Farmer', color: '#1B5E20' },
  { id: 'buyer', label: 'Buyer', color: '#2E7D32' },
  { id: 'transporter', label: 'Transporter', color: '#558B2F' }
]

const REGIONS = ['Bono East', 'Ashanti', 'Northern', 'Eastern', 'Volta', 'Greater Accra', 'Western', 'Central']

function Auth() {
  const navigate = useNavigate()
  const [step, setStep] = useState('role')
  const [mode, setMode] = useState('signup') // Changed to 'signup' first
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [role, setRole] = useState('farmer')
  const [region, setRegion] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const firstInputRef = useRef(null)
  const emailInputRef = useRef(null)

  useEffect(() => {
    if (step === 'form') {
      setTimeout(() => {
        if (mode === 'signup' && firstInputRef.current) {
          firstInputRef.current.focus()
        } else if (mode === 'login' && emailInputRef.current) {
          emailInputRef.current.focus()
        }
      }, 100)
    }
  }, [step, mode])

  // Phone validation
  const validatePhone = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 0) {
      setPhoneError('')
      return
    }
    if (cleaned.length !== 9) {
      setPhoneError(`Need 9 digits (you have ${cleaned.length})`)
    } else {
      setPhoneError('Valid Ghana number')
    }
  }

  // Email check for signup
  const checkEmailExists = async (emailValue) => {
    if (!emailValue || mode === 'login') return

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: 'checkonly123'
      })

      // If no error, email exists
      if (!error) {
        setEmailError('Email already registered - try logging in')
      } else if (error.message.includes('Invalid login')) {
        setEmailError('')
      }
    } catch (err) {
      setEmailError('')
    }
  }

  // Friendly error messages
  const getFriendlyError = (errorMsg) => {
    if (errorMsg.includes('already registered')) return 'Email already in use - try logging in'
    if (errorMsg.includes('Invalid login')) return 'Wrong email or password'
    if (errorMsg.includes('password')) return 'Password must be at least 6 characters'
    if (errorMsg.includes('Email not confirmed')) return 'Check your email to confirm'
    return errorMsg
  }

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setStep('form')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      setSubmitting(false)
      return
    }

    let formattedPhone = phone
    if (!phone.startsWith('+233')) {
      if (phone.startsWith('0')) {
        formattedPhone = '+233' + phone.slice(1)
      } else {
        formattedPhone = '+233' + phone
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(getFriendlyError(authError.message))
      setSubmitting(false)
      return
    }

    const { error: profileError } = await supabase.from('users').insert({
      auth_id: authData.user.id,
      role,
      name,
      phone: formattedPhone,
      region: role === 'farmer' ? region : null,
    })

    if (profileError) {
      setError(getFriendlyError(profileError.message))
      setSubmitting(false)
    } else {
      setSuccess('Account created! Redirecting...')
      setTimeout(() => {
        navigate(role === 'farmer' ? '/dashboard' : role === 'buyer' ? '/marketplace' : '/logistics')
      }, 2500)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(getFriendlyError(error.message))
      setSubmitting(false)
    } else {
      setSuccess('Logged in successfully! Redirecting...')
      setTimeout(() => {
        navigate('/')
      }, 2500)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setResetSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(getFriendlyError(error.message))
    } else {
      setSuccess('Password reset link sent to your email')
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetEmail('')
      }, 2000)
    }

    setResetSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F3F0] flex items-center justify-center px-6 py-12">
      <AnimatePresence mode="wait">
        {step === 'role' ? (
          // STEP 1: Role Selection
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md text-center"
          >
            <h1 className="text-4xl font-bold text-[#1B5E20] mb-3">AgriMatch</h1>
            <p className="text-gray-600 text-base mb-12">What brings you here?</p>

            <div className="space-y-3">
              {ROLES.map((r, index) => (
                <motion.button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 border-2 border-gray-300 rounded-lg text-lg font-semibold text-gray-800 hover:border-[#1B5E20] hover:text-[#1B5E20] transition-all bg-white"
                >
                  {r.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          // STEP 2: Form (Login/Signup)
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Back Button */}
            <button
              onClick={() => {
                setStep('role')
                setError(null)
                setSuccess(null)
                setEmailError('')
                setPhoneError('')
                setShowForgotPassword(false)
              }}
              className="mb-6 text-sm font-semibold text-gray-600 hover:text-[#1B5E20] transition-colors"
            >
              ← Back to role selection
            </button>

            {/* Role Indicator */}
            <div className="mb-6">
              <div
                className="h-1 rounded-full mb-3 transition-all"
                style={{
                  backgroundColor: ROLES.find(r => r.id === role)?.color
                }}
              ></div>
              <p className="text-xs text-gray-600 font-semibold">
                Signing up as: <span className="text-[#1B5E20] font-bold">{ROLES.find(r => r.id === role)?.label}</span>
              </p>
            </div>

            {/* Forgot Password Form */}
            {showForgotPassword ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-4">Reset Password</h2>

                <div>
                  <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-2 w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all bg-white"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-green-700 font-medium">{success}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleForgotPassword}
                  disabled={resetSubmitting}
                  className="w-full bg-[#1B5E20] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
                >
                  {resetSubmitting ? 'Sending link...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setError(null)
                    setSuccess(null)
                  }}
                  className="w-full text-center text-sm font-semibold text-gray-600 hover:text-[#1B5E20] transition-colors"
                >
                  Back to login
                </button>
              </motion.div>
            ) : (
              <>
                {/* Mode Toggle */}
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={() => {
                      setMode('signup')
                      setError(null)
                      setSuccess(null)
                      setEmailError('')
                      setPhoneError('')
                    }}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                      mode === 'signup'
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'border-gray-300 text-gray-600 hover:border-[#1B5E20]'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setMode('login')
                      setError(null)
                      setSuccess(null)
                      setEmailError('')
                      setPhoneError('')
                    }}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                      mode === 'login'
                        ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                        : 'border-gray-300 text-gray-600 hover:border-[#1B5E20]'
                    }`}
                  >
                    Log In
                  </button>
                </div>

                {mode === 'signup' ? (
                  <motion.form
                    key="signup-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSignup}
                    className="space-y-5"
                  >
                    {/* Full Name */}
                    <div>
                      <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Full Name</label>
                      <input
                        ref={firstInputRef}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all bg-white"
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Phone Number</label>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center px-3 py-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                          <span className="text-sm font-semibold text-gray-600">+233</span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '')
                            setPhone(cleaned)
                            validatePhone(cleaned)
                          }}
                          className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all bg-white"
                          placeholder="201 234567"
                          maxLength="9"
                          autoComplete="tel"
                        />
                      </div>
                      {phoneError && (
                        <p className={`text-xs mt-1 ${phoneError.includes('Valid') ? 'text-green-600' : 'text-orange-600'} font-medium`}>
                          {phoneError}
                        </p>
                      )}
                    </div>

                    {/* Region (Farmers only) */}
                    {role === 'farmer' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Harvest Region</label>
                        <select
                          required
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="mt-2 w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                        >
                          <option value="">Select your region</option>
                          {REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => checkEmailExists(email)}
                        className="mt-2 w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all bg-white"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                      {emailError && (
                        <p className={`text-xs mt-1 ${emailError.includes('already') ? 'text-red-600' : 'text-gray-600'} font-medium`}>
                          {emailError}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Password</label>
                      <div className="mt-2 relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-14 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all bg-white"
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-[#1B5E20] transition-colors"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-2 border-gray-300 focus:ring-2 focus:ring-[#1B5E20]/20 cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                        I agree to AgriMatch's{' '}
                        <a href="/terms" className="text-[#1B5E20] font-bold hover:underline">
                          Terms and Conditions
                        </a>
                      </label>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
                      >
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </motion.div>
                    )}

                    {/* Success Alert */}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
                      >
                        <p className="text-sm text-green-700 font-medium">{success}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || emailError.includes('already')}
                      className="w-full bg-[#1B5E20] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-8 text-base"
                    >
                      {submitting ? 'Creating account...' : 'Create Account'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    {/* Email */}
                    <div>
                      <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Email</label>
                      <input
                        ref={emailInputRef}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all bg-white"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold tracking-wider text-gray-700 uppercase">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-[#1B5E20] hover:underline font-semibold"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-14 text-sm focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all bg-white"
                          placeholder="Your password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-[#1B5E20] transition-colors"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
                      >
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </motion.div>
                    )}

                    {/* Success Alert */}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
                      >
                        <p className="text-sm text-green-700 font-medium">{success}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#1B5E20] text-white py-3 rounded-lg font-bold hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-60 mt-8 text-base"
                    >
                      {submitting ? 'Logging in...' : 'Log In'}
                    </button>
                  </motion.form>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Auth