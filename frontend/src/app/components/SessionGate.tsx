"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-context'

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const user = getCurrentUser()
    const setup = localStorage.getItem('restaurantSetup')
    const isSetupComplete = setup ? JSON.parse(setup)?.setupCompleted : false

    // Allow login, signup, and any /auth/phone* routes always
    const allowedAuthPrefixes = ['/login', '/signup', '/auth/phone']
    if (allowedAuthPrefixes.some(prefix => pathname.startsWith(prefix))) {
      setChecked(true)
      return
    }

    // If not logged in, redirect to login
    if (!user) {
      router.replace('/login')
      return
    }

    // If owner and setup not complete, force setup
    if (user.role === 'owner' && !isSetupComplete && pathname !== '/setup') {
      router.replace('/setup')
      return
    }

    setChecked(true)
  }, [pathname, router])

  if (!checked) {
    return null // or a loading spinner
  }
  return <>{children}</>
} 