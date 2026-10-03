import React, { useEffect, useState } from 'react'

type ToastMessage = { id: number; message: string; type?: 'info'|'error'|'success' }

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handler = (e: any) => {
      const detail = e.detail || {}
      const id = Date.now() + Math.floor(Math.random() * 1000)
      const msg: ToastMessage = { id, message: detail.message || String(detail), type: detail.type || 'info' }
      setToasts((t) => [...t, msg])
      setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 4000)
    }
    window.addEventListener('resona-toast', handler as EventListener)
    return () => window.removeEventListener('resona-toast', handler as EventListener)
  }, [])

  return (
    <div className="toast-root" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>{t.message}</div>
      ))}
    </div>
  )
}

export default Toast
