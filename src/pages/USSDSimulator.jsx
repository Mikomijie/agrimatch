import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useCurrentUser } from '../lib/useCurrentUser'

const CROPS = ['Tomatoes', 'Peppers', 'Garden Eggs', 'Okra']

function USSDSimulator() {
  const { user } = useCurrentUser()
  const [step, setStep] = useState('menu')
  const [typed, setTyped] = useState('')
  const [crop, setCrop] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const resetAll = () => {
    setStep('menu')
    setTyped('')
    setCrop('')
    setQuantity('')
    setPrice('')
    setLocation('')
    setErrorMsg('')
  }

  const press = (char) => setTyped((t) => t + char)
  const backspace = () => setTyped((t) => t.slice(0, -1))

  // Direct selection for single-choice screens (menu, crop) — no typing needed
  const selectMenuOption = (option) => {
    if (option === '1') {
      setStep('crop')
    } else if (option === '2') {
      setStep('checkStatus')
    }
    setTyped('')
  }

  const selectCrop = (c) => {
    setCrop(c)
    setStep('quantity')
    setTyped('')
  }

  // Multi-digit entry screens still use keypad + SEND
  const handleSend = async () => {
    if (step === 'quantity') {
      if (typed) {
        setQuantity(typed)
        setStep('price')
        setTyped('')
      }
    } else if (step === 'price') {
      if (typed) {
        setPrice(typed)
        setStep('location')
        setTyped('')
      }
    } else if (step === 'location') {
      if (typed) {
        setLocation(typed)
        setStep('submitting')
        await submitListing(typed)
      }
    }
  }

 const submitListing = async (finalLocation) => {
    if (!user?.id) {
      setStep('done')
      return
    }

    const { error } = await supabase.from('listings').insert({
      farmer_id: user.id,
      crop_type: crop,
      quantity: Number(quantity),
      price_per_unit: Number(price),
      location: finalLocation,
      freshness: 'Harvested Today',
      image_url: `/images/produce/${crop.toLowerCase().replace(' ', '-')}.jpg`,
    })

    if (error) {
      setErrorMsg(error.message)
      setStep('error')
    } else {
      setStep('done')
    }
  }

  const getSpokenText = () => {
    switch (step) {
      case 'menu':
        return 'Welcome to AgriMatch. Press 1 to list new produce. Press 2 to check order status.'
      case 'crop':
        return `Select produce type. ${CROPS.map((c, i) => `Press ${i + 1} for ${c}`).join('. ')}.`
      case 'quantity':
        return `${crop} selected. Enter quantity in kilograms.`
      case 'price':
        return `${quantity} kilograms of ${crop}. Enter price per kilogram in Ghana cedis.`
      case 'location':
        return `Price set at ${price} cedis per kilogram. Enter your pickup location code.`
      case 'checkStatus':
        return 'Order status feature coming soon. Your recent orders will appear here.'
      case 'done':
        return `Success! Your listing of ${quantity} kilograms of ${crop} is now live for buyers.`
      default:
        return ''
    }
  }

  const speakScreen = () => {
    const utterance = new SpeechSynthesisUtterance(getSpokenText())
    utterance.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    speakScreen()
    return () => window.speechSynthesis.cancel()
  }, [step])
  const Screen = ({ children }) => (
    <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md min-h-[160px] flex flex-col justify-between">
      {children}
    </div>
  )

  const screenContent = () => {
    switch (step) {
      case 'menu':
        return (
          <>
            <p>Welcome to AgriMatch</p>
            <button
              onClick={() => selectMenuOption('1')}
              className="block mt-2 text-left hover:text-green-200 transition-colors"
            >
              1. List New Produce
            </button>
            <button
              onClick={() => selectMenuOption('2')}
              className="block text-left hover:text-green-200 transition-colors"
            >
              2. Check Order Status
            </button>
          </>
        )
      case 'crop':
        return (
          <>
            <p>Select Produce Type:</p>
            {CROPS.map((c, i) => (
              <button
                key={c}
                onClick={() => selectCrop(c)}
                className="block text-left hover:text-green-200 transition-colors"
              >
                {i + 1}. {c}
              </button>
            ))}
          </>
        )
      case 'quantity':
        return (
          <>
            <p>{crop} selected.</p>
            <p className="mt-2">Enter quantity (kg):</p>
          </>
        )
      case 'price':
        return (
          <>
            <p>{quantity}kg {crop}.</p>
            <p className="mt-2">Enter price per kg (GH₵):</p>
          </>
        )
      case 'location':
        return (
          <>
            <p>GH₵{price}/kg set.</p>
            <p className="mt-2">Enter pickup location (numbers only for demo):</p>
          </>
        )
      case 'submitting':
        return <p className="animate-pulse">Sending to AgriMatch network...</p>
      case 'checkStatus':
        return (
          <p>
            Order status feature coming soon. Your recent orders will appear here in a future
            update.
          </p>
        )
      case 'done':
        return (
          <p>
            END Success! Your {quantity}kg of {crop} at location code {location} is now live
            for buyers. You will get an SMS when a buyer matches.
          </p>
        )
      case 'error':
        return <p className="text-red-400">Error: {errorMsg}</p>
      default:
        return null
    }
  }

  const showKeypad = ['quantity', 'price', 'location'].includes(step)
  const showSpeaker = ['menu', 'crop', 'quantity', 'price', 'location', 'checkStatus', 'done'].includes(step)
  const showBackButton = ['checkStatus', 'done', 'error'].includes(step)

  const KeypadButton = ({ label, onClick }) => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="bg-gray-700 text-white rounded-md py-3 text-base font-medium hover:bg-gray-600 transition-colors"
    >
      {label}
    </motion.button>
  )

return (
    <div className="min-h-screen bg-white">
      {/* Login not required for USSD demo */}
      <header   className="flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)] border-b border-gray-200">
        <Link to="/" className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/logistics">Logistics</Link>
        </nav>
      </header>

      <main className="max-w-md mx-auto px-6 py-16">
        <p className="text-xs font-semibold tracking-wide text-gray-500 text-center">
          LOW-CONNECTIVITY MODE
        </p>
        <h1 className="font-[var(--font-heading)] text-2xl text-center mt-2">
          USSD Listing Simulator
        </h1>
        <p className="text-xs text-gray-500 text-center mt-2 mb-8">
          Simulates *920# — for farmers without smartphone access.
        </p>

        <div className="bg-gray-900 rounded-3xl p-4 shadow-xl">
          <div className="bg-gray-800 rounded-xl p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Screen>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">{screenContent()}</div>
                    {showSpeaker && (
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={speakScreen}
                        className="flex-shrink-0 text-lg"
                        aria-label="Play voice prompt"
                      >
                        🔊
                      </motion.button>
                    )}
                  </div>
                  {showKeypad && (
                    <p className="border-t border-green-800 pt-2 mt-2">
                      {typed}<span className="animate-pulse">▌</span>
                    </p>
                  )}
                </Screen>

                {showKeypad && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                      <KeypadButton key={n} label={n} onClick={() => press(n)} />
                    ))}
                    <KeypadButton label="⌫" onClick={backspace} />
                    <KeypadButton label="0" onClick={() => press('0')} />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      className="bg-[var(--color-primary)] text-white rounded-md py-3 text-sm font-medium hover:brightness-95 transition-all"
                    >
                      SEND
                    </motion.button>
                  </div>
                )}

                {showBackButton && (
                  <button
                    onClick={resetAll}
                    className="w-full mt-3 border border-gray-300 bg-white py-2 rounded-md text-sm font-medium"
                  >
                    {step === 'done' ? 'Start New Session' : step === 'error' ? 'Try Again' : 'Back to Menu'}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          This simulates a real USSD session (e.g. dialing *920#) for farmers without
          smartphone or internet access. Data submitted here goes directly into the same
          AgriMatch database as the web app.
        </p>
        <p className="text-xs text-gray-400 text-center mt-2">
          🔊 Tap the speaker icon to hear each screen read aloud — demonstrating accessibility
          for non-literate users. Production version would use local-language (Twi/Dagbani)
          audio.
        </p>
      </main>
    </div>
  )
}

export default USSDSimulator