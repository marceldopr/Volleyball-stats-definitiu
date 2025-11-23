import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Test simple sin App.tsx
function TestApp() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Test de Renderizado</h1>
                <p className="text-gray-600">Si ves esto, React está funcionando correctamente</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        Ahora vamos a cargar la app real...
                    </p>
                </div>
            </div>
        </div>
    )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <TestApp />
    </React.StrictMode>,
)
