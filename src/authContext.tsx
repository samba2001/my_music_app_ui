import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as api from './api'

type User = any

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: (opts?: { revokeEmail?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const handleSessionExpired = () => {
      if (!active) return
      setUser(null)
      setIsLoading(false)
      // Prevent infinite page reload loop if already on the login route
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    window.addEventListener('resona-session-expired', handleSessionExpired)

    api.getCurrentUser()
      .then((data) => {
        if (active) setUser(data?.user ?? data)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
      window.removeEventListener('resona-session-expired', handleSessionExpired)
    }
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setIsLoading(true)
    try {
      await api.postGoogleAuth(idToken)
      const data = await api.getCurrentUser()
      setUser(data?.user ?? data)
      window.dispatchEvent(new CustomEvent('resona-signed-in'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (opts?: { revokeEmail?: string }) => {
    try {
      await api.postLogout()
    } catch (error) {
      console.error('Server logout failed', error)
    } finally {
      setUser(null)
    }
    try {
      const g = (window as any).google
      if (g?.accounts?.id?.disableAutoSelect) g.accounts.id.disableAutoSelect()
      if (opts?.revokeEmail && g?.accounts?.id?.revoke) g.accounts.id.revoke(opts.revokeEmail, () => {})
    } catch {
      // Google Identity Services may not be loaded.
    }
    window.dispatchEvent(new CustomEvent('resona-signed-out', { detail: { email: opts?.revokeEmail } }))
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext