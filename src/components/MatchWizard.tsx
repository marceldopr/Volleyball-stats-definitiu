import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

interface MatchWizardProps {
    isOpen: boolean
    onClose: () => void
}

export function MatchWizard({ isOpen, onClose }: MatchWizardProps) {
    const navigate = useNavigate()
    const [opponent, setOpponent] = useState('')

    const handleCreate = () => {
        alert('Funcionalidad de creación de partido en desarrollo')
        onClose()
        navigate('/matches')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Crear Partido</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Equipo Rival</label>
                        <input
                            type="text"
                            value={opponent}
                            onChange={(e) => setOpponent(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Nombre del rival"
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                            Wizard temporal simplificado. La funcionalidad completa se restaurará próximamente.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Crear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
