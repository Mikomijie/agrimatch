import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export function useCurrentUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single()

      setUser(profile)
      setLoading(false)
    }

    fetchUser()

    const { data } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [])

  return { user, loading }
}