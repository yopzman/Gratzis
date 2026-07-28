import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            maxWidth: 600,
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: 12 }}>⚠️ Something went wrong in the App</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: 16 }}>
              {this.state.error && this.state.error.toString()}
            </p>
            {this.state.errorInfo && (
              <pre style={{
                backgroundColor: '#0f172a',
                padding: 12,
                borderRadius: 8,
                fontSize: '0.75rem',
                color: '#94a3b8',
                overflowX: 'auto',
                maxHeight: 200
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <button
              onClick={() => {
                sessionStorage.clear();
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                marginTop: 20,
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
