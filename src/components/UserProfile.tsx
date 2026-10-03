import { X } from 'lucide-react'
import { isAdmin } from '../auth'
import { useAuth } from '../authContext'

export default function UserProfile({ onClose }: { onClose: () => void }) {
  const auth = useAuth()
  const payload = auth.user
  const name = payload?.name || payload?.given_name || payload?.preferred_username || payload?.sub || 'Unknown'
  const email = payload?.email || payload?.email_address || ''
  const lastLogin = payload?.last_login ? new Date(payload.last_login).toString() : (payload?.iat ? new Date((payload.iat||0)*1000).toString() : 'Unknown')
  console.log('UserProfile payload', payload, { name, email, lastLogin })
  const handleLogout = async () => {
    window.dispatchEvent(new CustomEvent('resona-toast', { detail: { message: 'Logged out', type: 'info' } }))
    await auth.logout()
    onClose()
  }

  return (
    <div className="profile-overlay">
      <div className="profile-panel">
        <div className="profile-header"><h3>Profile</h3><button className="icon-btn" onClick={onClose}><X /></button></div>
        <div style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar">{(name || '?').charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{email}</div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div><strong>Last login</strong></div>
            <div style={{ color: 'var(--muted)' }}>{lastLogin}</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div><strong>Role</strong></div>
            <div style={{ color: 'var(--muted)' }}>{isAdmin(auth.user) ? 'Admin' : 'User'}</div>
          </div>

          <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
            <button className="primary-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  )
}
