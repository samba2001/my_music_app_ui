import React from 'react'

export default function NoAccessPage() {
  return (
    <div style={{ padding: 18 }}>
      <h2>Admin access required</h2>
      <p>You don't currently have admin privileges to perform this action.</p>
      <p>If you believe this is an error, contact the site administrator or request access.</p>
      <div style={{ marginTop: 12 }}>
        <button className="primary-button" onClick={() => { window.dispatchEvent(new CustomEvent('resona-toast', { detail: { message: 'Access request sent', type: 'info' } })) }}>Request access</button>
        <button style={{ marginLeft: 8 }} onClick={() => window.location.assign('/')}>Return home</button>
      </div>
    </div>
  )
}
