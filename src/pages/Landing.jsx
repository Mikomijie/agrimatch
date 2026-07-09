import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

function AnimatedSection({ children, className = '' }) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
      {children}
    </motion.section>
  )
}

function Counter({ value, suffix = '' }) {
  return (
    <motion.p
      className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-primary-dark)]"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {value}{suffix}
    </motion.p>
  )
}

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0F1C2E] backdrop-blur-sm border-b border-gray-700">
        <span className="font-[var(--font-heading)] italic text-2xl text-white">
          AgriMatch
        </span>
       <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <Link to="/marketplace" className="text-gray-300 hover:text-white">Marketplace</Link>
          <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link to="/logistics" className="text-gray-300 hover:text-white">Logistics</Link>
        </nav>
      </header>

    {/* Hero */}
      <section 
        className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/hero-ghana-farming.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          className="relative z-10 text-center px-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h1 className="font-[var(--font-heading)] text-4xl md:text-6xl text-white leading-tight">
            Connecting <span className="italic">Ghana's Harvest</span>
          </h1>
          <p className="mt-4 text-white/90 text-lg mx-auto">
            Eliminating post-harvest loss through a direct, high-performance marketplace for
            premium Ghanaian produce.
          </p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block mt-8">
            <Link
              to="/auth"
              className="inline-block bg-[var(--color-secondary)] text-white px-8 py-3 rounded-md font-medium tracking-wide hover:brightness-95 transition-all"
            >
              GET STARTED
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="bg-[var(--color-primary)] text-white px-6 md:px-10 py-6 md:py-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center text-xs md:text-sm tracking-wide">
        <span>HARVESTED TODAY IN TECHIMAN</span>
        <span>POST-HARVEST LOSS REDUCED BY 34%</span>
        <span>LIVE LOGISTICS TRACKING</span>
      </section>

      {/* Three role sections */}
      <AnimatedSection className="bg-gray-50 px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            variants={fadeUp} 
            transition={{ duration: 0.6 }}
            className="bg-[#E8F5E9] rounded-lg p-8 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs font-semibold text-[#2E7D32] tracking-wide">
              01 / FOR FARMERS
            </p>
            <h2 className="font-[var(--font-heading)] text-xl mt-4 text-[#1B5E20]">
              Command the value your soil deserves.
            </h2>
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">
              Direct access to high-volume buyers. No intermediaries, no uncertainty. Real-time pricing and guaranteed logistics.
            </p>
          </motion.div>

          <motion.div 
            variants={fadeUp} 
            transition={{ duration: 0.6 }}
            className="bg-[#FFE8D6] rounded-lg p-8 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs font-semibold text-[#D84315] tracking-wide">
              02 / FOR BUYERS
            </p>
            <h2 className="font-[var(--font-heading)] text-xl mt-4 text-[#BF360C]">
              Sourcing with surgical precision.
            </h2>
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">
              Trace every kilogram back to its origin, with documented harvest times and a verified farmer network.
            </p>
          </motion.div>

          <motion.div 
            variants={fadeUp} 
            transition={{ duration: 0.6 }}
            className="bg-[#E1F5FE] rounded-lg p-8 hover:shadow-lg transition-shadow"
          >
            <p className="text-xs font-semibold text-[#01579B] tracking-wide">
              03 / FOR TRANSPORTERS
            </p>
            <h2 className="font-[var(--font-heading)] text-xl mt-4 text-[#0D47A1]">
              Optimize every kilometer.
            </h2>
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">
              Join a network of vetted carriers with access to high-demand routes from Bono East to urban hubs.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>
  {/* Why AgriMatch */}
      <AnimatedSection className="bg-white px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl text-[var(--color-charcoal)]">
              Why AgriMatch Works
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Built for Ghana's farmers, buyers, and transporters. Trusted technology that delivers results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)]">
                Real-Time Pricing
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                No middlemen. Get fair prices updated daily based on live market data.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">✓</div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)]">
                Verified Farmers
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                Every producer is vetted. Trace every kilogram back to its source.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-[var(--font-heading)] text-xl text-[var(--color-charcoal)]">
                Fast Logistics
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                Farm to buyer in 12 hours. Coordinated, reliable transport network.
              </p>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
      {/* Bottom stats */}
      <AnimatedSection className="bg-[var(--color-primary-light)]/40 px-6 md:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center">
        <div>
          <Counter value="40" suffix="%" />
          <p className="text-xs text-gray-600 mt-1">
            Average post-harvest loss in traditional supply chains
          </p>
        </div>
        <div>
          <Counter value="2.4" suffix="k+" />
          <p className="text-xs text-gray-600 mt-1">
            Verified smallholder farmers in the Techiman Hub ecosystem
          </p>
        </div>
        <div>
          <Counter value="12" suffix="hrs" />
          <p className="text-xs text-gray-600 mt-1">
            Maximum time from harvest to logistics pickup
          </p>
        </div>
      </AnimatedSection>

      {/* Footer CTA */}
      <AnimatedSection className="text-center py-16 px-6">
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="font-[var(--font-heading)] text-3xl md:text-4xl"
        >
          Ready to bridge the <span className="italic">distance?</span>
        </motion.h2>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-6 flex gap-4 justify-center"
        >
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              to="/auth"
              className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-md font-medium"
            >
              JOIN THE NETWORK
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              to="/marketplace"
              className="inline-block border border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 rounded-md font-medium hover:bg-[var(--color-primary)]/5 transition-colors"
            >
              LEARN MORE
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">
            AgriMatch
          </p>
          
          <div className="my-4 h-px bg-gray-200" />
          
          <p className="text-gray-600 text-sm leading-relaxed">
            Empowering the backbone of Ghana's economy through technology that respects the soil.
          </p>
          
          <div className="my-4 h-px bg-gray-200" />
          
          <p className="text-gray-500 text-xs tracking-wide">
            © 2026 AgriMatch · Techiman Regional Hub, Bono East
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing