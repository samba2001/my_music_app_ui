import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, info: any) {
    // log and show a toast
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info)
    window.dispatchEvent(new CustomEvent('resona-toast', { detail: { message: 'An unexpected error occurred', type: 'error' } }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>Try reloading the page or return to Home.</p>
          <div style={{ marginTop: 12 }}>
            <button className="primary-button" onClick={() => window.location.reload()}>Reload</button>
            <button style={{ marginLeft: 8 }} onClick={() => window.location.assign('/')}>Home</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
