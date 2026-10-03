import React from 'react'
import GoogleSignIn from '../components/GoogleSignIn'

const DEFAULT_SSO_START = '/api/v1/auth/google/start'

export default function LandingPage() {
  // Landing shows Google One Tap / button; manual paste removed for security.

  return (
    <div className="landing view fade-in" style={{ padding: 40, textAlign: 'center', maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>♫</div>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Welcome to Charan</h1>
        <p className="subtext" style={{ fontSize: 16, color: 'var(--muted)' }}>Stream your favorite music with ease</p>
      </div>
      <div style={{ marginTop: 32 }}>
        <GoogleSignIn />
      </div>
    </div>
  )
}
