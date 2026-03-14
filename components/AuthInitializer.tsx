'use client'

import { useEffect } from 'react'
import { useStore } from '@/hooks/use-store'

export function AuthInitializer() {
  const initAuth = useStore.getState().initAuth
  
  useEffect(() => {
    initAuth()
  }, [])

  return null
}

