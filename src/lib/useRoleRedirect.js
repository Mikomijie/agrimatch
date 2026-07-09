import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from './useCurrentUser'

export function useRoleRedirect() {
  const navigate = useNavigate()
  const { user, loading } = useCurrentUser()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'farmer') {
        navigate('/dashboard')
      } else if (user.role === 'buyer') {
        navigate('/marketplace')
      } else if (user.role === 'transporter') {
        navigate('/logistics')
      } else {
        navigate('/')
      }
    }
  }, [user, loading, navigate])
}