import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Aplicación</h1>
            <p className="text-gray-700 mb-4">
              La aplicación encontró un error y no puede continuar.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-800 font-mono">
                {this.state.error?.message || 'Error desconocido'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Recargar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #f9fafb; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Error Fatal</h1>
        <p style="color: #374151;">No se encontró el elemento 'root' en el HTML.</p>
      </div>
    </div>
  `
  throw new Error('Root element not found in DOM')
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Fatal error during React initialization:', error)
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; min-height: 100vh; background: #f9fafb; font-family: system-ui;">
      <div style="max-width: 28rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Error de Inicialización</h1>
        <p style="color: #374151; margin-bottom: 1rem;">La aplicación no pudo inicializarse.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.25rem; padding: 0.75rem; margin-bottom: 1rem;">
          <p style="color: #991b1b; font-size: 0.875rem; font-family: monospace;">
            ${error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
        <button onclick="window.location.reload()" style="width: 100%; padding: 0.5rem 1rem; background: #4f46e5; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
          Recargar Página
        </button>
      </div>
    </div>
  `
}