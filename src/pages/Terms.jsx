import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--color-background-warm)]">
      {/* Header */}
      <div className="bg-[var(--color-primary-dark)] text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            ← Back
          </button>
          <h1 className="font-[var(--font-heading)] text-4xl font-bold">Terms and Conditions</h1>
          <p className="text-white/70 mt-2">Last updated: August 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">1. Agreement to Terms</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              By accessing and using AgriMatch, you agree to be bound by these Terms and Conditions. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">2. Use License</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on AgriMatch for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-charcoal)]/80">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on AgriMatch</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">3. Disclaimer</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              The materials on AgriMatch are provided on an 'as is' basis. AgriMatch makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">4. Limitations</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              In no event shall AgriMatch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AgriMatch, even if AgriMatch or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">5. Accuracy of Materials</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              The materials appearing on AgriMatch could include technical, typographical, or photographic errors. AgriMatch does not warrant that any of the materials on its website are accurate, complete, or current. AgriMatch may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">6. Links</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              AgriMatch has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AgriMatch of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">7. Modifications</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              AgriMatch may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">8. User Conduct</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed mb-4">
              All users of AgriMatch — farmers, buyers, and transporters — agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-charcoal)]/80">
              <li>Provide accurate and truthful information about products, prices, vehicles, and capacity</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in fraudulent or deceptive practices</li>
              <li>Respect the privacy and rights of other users</li>
            </ul>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed mt-4 mb-2 font-semibold">
              Transporters additionally agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-charcoal)]/80">
              <li>Handle produce with reasonable care throughout transit</li>
              <li>Communicate delays or issues promptly to the farmer and buyer</li>
              <li>Update delivery status accurately and in a timely manner</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">9. Governing Law</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of Ghana, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-primary-dark)] mb-4">10. Contact Us</h2>
            <p className="text-[var(--color-charcoal)]/80 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-[var(--color-primary-light)]/20 rounded-lg">
              <p className="font-semibold text-[var(--color-charcoal)]">AgriMatch Support</p>
              <p className="text-[var(--color-charcoal)]/80">Email: support@agrimatch.com</p>
              <p className="text-[var(--color-charcoal)]/80">Phone: +233 (0) 500 000 000</p>
              <p className="text-[var(--color-charcoal)]/80">Location: Techiman, Bono East, Ghana</p>
            </div>
          </section>
        </motion.div>

        {/* Accept & Back Buttons */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border-2 border-black/10 rounded-lg text-[var(--color-charcoal)]/80 font-bold hover:border-[var(--color-primary)] transition-all"
          >
            Back
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:brightness-95 transition-all"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default Terms