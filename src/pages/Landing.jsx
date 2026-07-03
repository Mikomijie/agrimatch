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
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[var(--color-background-warm)]/95 backdrop-blur-sm border-b border-gray-200">
        <span className="font-[var(--font-heading)] italic text-2xl text-[var(--color-primary)]">
          AgriMatch
        </span>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-charcoal)]">
          <Link to="/marketplace" className="text-gray-600 hover:text-[var(--color-charcoal)]">Marketplace</Link>
          <Link to="/dashboard">Dashboard</Link>
          <span>Logistics</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative h-[500px] flex items-end overflow-hidden">
        <img
          src="/images/market/market-general.jpg"
          alt="Ghana farm at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          className="relative z-10 px-6 md:px-10 pb-12 max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h1 className="font-[var(--font-heading)] text-4xl md:text-6xl text-white leading-tight">
            Connecting <span className="italic">Ghana's Harvest</span>
          </h1>
          <p className="mt-4 text-white/90 max-w-md">
            Eliminating post-harvest loss through a direct, high-performance marketplace for
            premium Ghanaian produce.
          </p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block mt-6">
            <Link
              to="/dashboard"
              className="inline-block bg-[var(--color-secondary)] text-white px-6 py-3 rounded-md font-medium tracking-wide hover:brightness-95 transition-all"
            >
              GET STARTED
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="bg-[var(--color-primary)] text-white px-6 md:px-10 py-3 flex flex-wrap gap-6 justify-center text-xs md:text-sm tracking-wide">
        <span>HARVESTED TODAY IN TECHIMAN</span>
        <span>POST-HARVEST LOSS REDUCED BY 34%</span>
        <span>LIVE LOGISTICS TRACKING</span>
      </section>

      {/* Three role sections */}
      <AnimatedSection className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-12">
        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
          <img
            src="/images/farmers/farmer-portrait.jpg"
            alt="Farmer"
            className="w-full aspect-[4/3] object-cover rounded-lg mb-4"
          />
          <p className="text-xs font-semibold text-[var(--color-secondary)] tracking-wide">
            01 / FOR FARMERS
          </p>
          <h2 className="font-[var(--font-heading)] text-2xl mt-2">
            Command the value your soil deserves.
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            Direct access to high-volume buyers. No intermediaries, no uncertainty. Real-time
            pricing and guaranteed logistics.
          </p>
        </motion.div>

        <div className="flex flex-col justify-center gap-10">
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold text-[var(--color-secondary)] tracking-wide">
              02 / FOR BUYERS
            </p>
            <h2 className="font-[var(--font-heading)] text-2xl mt-2">
              Sourcing with surgical precision.
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Trace every kilogram back to its origin, with documented harvest times and a
              verified farmer network.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold text-[var(--color-secondary)] tracking-wide">
              03 / FOR TRANSPORTERS
            </p>
            <h2 className="font-[var(--font-heading)] text-2xl mt-2">
              Optimize every kilometer.
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Join a network of vetted carriers with access to high-demand routes from Bono
              East to urban hubs.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Bottom stats */}
      <AnimatedSection className="bg-[var(--color-primary-light)]/40 px-6 md:px-10 py-14 grid grid-cols-3 gap-6 text-center">
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
              to="/dashboard"
              className="inline-block bg-[var(--color-primary)] text-white px-6 py-3 rounded-md font-medium"
            >
              JOIN THE NETWORK
            </Link>
          </motion.div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="border border-gray-300 px-6 py-3 rounded-md font-medium"
          >
            LEARN MORE
          </motion.button>
        </motion.div>
      </AnimatedSection>

      <footer className="border-t border-gray-200 px-6 md:px-10 py-10 text-sm text-gray-500">
        <p className="font-[var(--font-heading)] text-[var(--color-charcoal)] text-lg">AgriMatch</p>
        <p className="mt-2 max-w-sm">
          Empowering the backbone of Ghana's economy through technology that respects the soil.
        </p>
        <p className="mt-6">© 2026 AgriMatch. Techiman Regional Hub, Bono East.</p>
      </footer>
    </div>
  )
}

export default Landing