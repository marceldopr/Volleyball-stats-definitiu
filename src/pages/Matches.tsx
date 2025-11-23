import { Trophy, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Matches() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Trophy className="w-8 h-8 text-primary-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Partidos</h1>
                </div>
                <Link
                    to="/matches/new"
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Partido</span>
                </Link>
            </div>

            <div className="card">
                <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay partidos registrados</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Comienza creando un nuevo partido para registrar estadísticas.</p>
                </div>
            </div>
        </div>
    )
}
