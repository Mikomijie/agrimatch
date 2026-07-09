import { useState, useEffect } from 'react'

export function useActiveRole() {
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('activeRole') || 'farmer'
  })

  useEffect(() => {
    localStorage.setItem('activeRole', activeRole)
  }, [activeRole])

  return [activeRole, setActiveRole]
}