import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrentUser } from '../lib/useCurrentUser'
import { useActiveRole } from '../lib/useActiveRole'

const ROLES = [
  { id: 'farmer', label: 'Farmer', desc: 'List harvests, manage sales' },
  { id: 'buyer', label: 'Buyer', desc: 'Browse produce, make purchases' },
  { id: 'transporter', label: 'Transporter', desc: 'Manage deliveries, logistics' }
]

function RoleSwitch() {
  const navigate = useNavigate()
  const { user, loading } = useCurrentUser()
  const [_, setActiveRole] = useActiveRole()

  if (loading) return <div className="p-10 text-center">Loading...</div>
  if (!user) return navigate('/auth')

  const handleSelectRole = (roleId) => {
    setActiveRole(roleId)
    if (roleId === 'farmer') navigate('/dashboard')
    else if (roleId === 'buyer') navigate('/marketplace')
    else navigate('/logistics')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F3F0] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <button
          onClick={() => navigate('/auth')}
          className="mb-4 text-sm font-semibold text-gray-600 hover:text-[#1B5E20] transition-colors text-left"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold text-[#1B5E20] mb-3">AgriMatch</h1>
        <p className="text-gray-600 text-base mb-12">What would you like to do today?</p>

        <div className="space-y-3">
          {ROLES.map((role, i) => (
            <motion.button
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-[#1B5E20] hover:bg-[#1B5E20]/5 transition-all text-left bg-white"
            >
              <p className="font-bold text-lg text-gray-900">{role.label}</p>
              <p className="text-sm text-gray-600 mt-1">{role.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default RoleSwitch