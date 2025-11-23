import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Activity, Ruler, Calendar } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { getPlayersByClub, PlayerDB } from '../services/playerService'
import { PlayerReports } from '../components/players/PlayerReports'

export function PlayerDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const [player, setPlayer] = useState<PlayerDB | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'info' | 'reports'>('reports')

    useEffect(() => {
        if (profile?.club_id && id) {
            loadPlayer()
        }
    }, [profile?.club_id, id])

    const loadPlayer = async () => {
        if (!profile?.club_id || !id) return

        try {
            setLoading(true)
            // Ideally we would have a getPlayerById service, but for this phase we filter from all players
            const players = await getPlayersByClub(profile.club_id)
            const foundPlayer = players.find(p => p.id === id)

            if (foundPlayer) {
                setPlayer(foundPlayer)
            } else {
                setError('Jugadora no encontrada')
            }
        } catch (err) {
            console.error('Error loading player:', err)
            setError('Error al cargar la información de la jugadora')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-500">Cargando perfil...</p>
                </div>
            </div>
        )
    }

    if (error || !player) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-center">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Error</h3>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Jugadora no encontrada'}</p>
                    <button
                        onClick={() => navigate('/players')}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Volver a Jugadoras
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate('/players')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil de Jugadora</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gestión y seguimiento</p>
                </div>
            </div>

            {/* Player Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-md">
                            <User className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-6 px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {player.first_name} {player.last_name}
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 uppercase tracking-wide">
                                    {player.main_position || 'Sin posición'}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${player.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {player.is_active ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex flex-col items-center">
                                <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                                    <Ruler className="w-4 h-4 text-gray-400" />
                                    {player.height_cm ? `${player.height_cm} cm` : '-'}
                                </span>
                                <span className="text-xs">Altura</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {player.birth_date ? new Date(player.birth_date).toLocaleDateString('es-ES') : '-'}
                                </span>
                                <span className="text-xs">Nacimiento</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-8">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reports'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Informes
                        </button>
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info'
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Información Personal
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'reports' && (
                    <PlayerReports playerId={player.id} />
                )}

                {activeTab === 'info' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            Datos Médicos y Físicos
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notas Adicionales</label>
                                <p className="text-gray-900 dark:text-white">{player.notes || 'Sin notas adicionales'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
