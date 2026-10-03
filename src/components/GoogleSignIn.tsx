import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../authContext'

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client'

declare global {
  interface Window {
    __google_gsi_initialized?: boolean
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      if ((window as any).google?.accounts?.id) {
        resolve()
      } else {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', () => reject(new Error('Failed to load script')))
      }
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load script'))
    document.head.appendChild(s)
  })
}

export default function GoogleSignIn({ buttonId = 'resona-google-btn' }: { buttonId?: string }) {
  const { loginWithGoogle } = useAuth()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const loginRef = useRef(loginWithGoogle)

  useEffect(() => {
    loginRef.current = loginWithGoogle
  }, [loginWithGoogle])

  const clientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
    (import.meta.env.VITE_SSO_CLIENT_ID as string) ||
    ''
  const [scriptError, setScriptError] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!clientId) return

    loadScript(GOOGLE_SCRIPT)
      .then(() => {
        if (!mounted) return
        const g = (window as any).google
        if (!g?.accounts?.id) {
          setScriptError(true)
          return
        }

        // Global flag prevents double-initialization in React StrictMode
        if (!window.__google_gsi_initialized) {
          g.accounts.id.initialize({
            client_id: clientId,
            auto_select: false,
            use_fedcm_for_prompt: true,
            callback: async (resp: any) => {
              const googleToken = resp?.credential
              if (!googleToken) return
              try {
                await loginRef.current(googleToken)
              } catch (e) {
                console.error('Sign-in failed', e)
              }
            },
          })
          window.__google_gsi_initialized = true
        }

        if (containerRef.current) {
          try {
            g.accounts.id.renderButton(containerRef.current, {
              theme: 'outline',
              size: 'large',
            })
          } catch {
            // Ignore re-render attempts
          }
        }
      })
      .catch(() => {
        if (mounted) setScriptError(true)
      })

    return () => {
      mounted = false
    }
  }, [clientId])

  if (!clientId) {
    return <div style={{ color: 'var(--muted)' }}>Google client ID not set.</div>
  }

  if (scriptError) {
    return <div style={{ color: 'var(--muted)' }}>Google sign-in unavailable.</div>
  }

  return <div id={buttonId} ref={containerRef} />
}