import { useState, useEffect } from 'react'
import { Plus, Trash2, UserPlus, X, Save, Shirt } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { TeamDB } from '@/services/teamService'
import { SeasonDB } from '@/services/seasonService'
import { getPlayersByClub, PlayerDB } from '@/services/playerService'
import {
    getRosterByTeamAndSeason,
    addPlayerToTeamSeason,
    removePlayerFromTeamSeason,
    updatePlayerInTeamSeason,
    PlayerTeamSeasonDB
} from '@/services/playerTeamSeasonService'

interface TeamRosterManagerProps {
    team: TeamDB
    season: SeasonDB
    onClose: () => void
}

export function TeamRosterManager({ team, season, onClose }: TeamRosterManagerProps) {
    const { profile } = useAuthStore()
    const [roster, setRoster] = useState<PlayerTeamSeasonDB[]>([])
    const [availablePlayers, setAvailablePlayers] = useState<PlayerDB[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    // Add player form state
    const [selectedPlayerId, setSelectedPlayerId] = useState('')
    const [jerseyNumber, setJerseyNumber] = useState('')
    const [role, setRole] = useState('Jugadora')

    // Edit player state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editJersey, setEditJersey] = useState('')
    const [editRole, setEditRole] = useState('')

    useEffect(() => {
        loadData()
    }, [team.id, season.id])

    const loadData = async () => {
        if (!profile?.club_id) return

        try {
            setLoading(true)
            const [rosterData, playersData] = await Promise.all([
                getRosterByTeamAndSeason(team.id, season.id),
                getPlayersByClub(profile.club_id)
            ])

            setRoster(rosterData)
            setAvailablePlayers(playersData.filter(p => p.is_active))
        } catch (error) {
            console.error('Error loading roster data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddPlayer = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPlayerId) return

        try {
            await addPlayerToTeamSeason({
                player_id: selectedPlayerId,
                team_id: team.id,
                season_id: season.id,
                jersey_number: jerseyNumber,
                role: role,
                status: 'active'
            })

            await loadData()
            setShowAddModal(false)
            setSelectedPlayerId('')
            setJerseyNumber('')
            setRole('Jugadora')
        } catch (error) {
            alert('Error al añadir jugadora. Verifica que no esté ya en el equipo.')
        }
    }

    const handleRemovePlayer = async (id: string, playerName: string) => {
        if (!window.confirm(`¿Quitar a ${playerName} del equipo?`)) return

        try {
            await removePlayerFromTeamSeason(id)
            await loadData()
        } catch (error) {
            alert('Error al quitar jugadora')
        }
    }

    const startEditing = (entry: PlayerTeamSeasonDB) => {
        setEditingId(entry.id)
        setEditJersey(entry.jersey_number || '')
        setEditRole(entry.role || '')
    }

    const saveEditing = async (id: string) => {
        try {
            await updatePlayerInTeamSeason(id, {
                jersey_number: editJersey,
                role: editRole
            })
            setEditingId(null)
            await loadData()
        } catch (error) {
            alert('Error al actualizar datos')
        }
    }

    // Filter out players already in the roster
    const playersToAdd = availablePlayers.filter(
        p => !roster.some(r => r.player_id === p.id)
    )

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Plantilla: {team.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Temporada {season.name} • {roster.length} jugadoras
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-8">Cargando...</div>
                    ) : (
                        <>
                            {/* Roster Table */}
                            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dorsal</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jugadora</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Posición</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {roster.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    No hay jugadoras en este equipo todavía.
                                                </td>
                                            </tr>
                                        ) : (
                                            roster.map((entry) => (
                                                <tr key={entry.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingId === entry.id ? (
                                                            <input
                                                                type="text"
                                                                value={editJersey}
                                                                onChange={(e) => setEditJersey(e.target.value)}
                                                                className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600"
                                                            />
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold text-sm">
                                                                {entry.jersey_number || '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {entry.players?.first_name} {entry.players?.last_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {entry.players?.main_position}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {editingId === entry.id ? (
                                                            <input
                                                                type="text"
                                                                value={editRole}
                                                                onChange={(e) => setEditRole(e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600"
                                                            />
                                                        ) : (
                                                            entry.role || '-'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {editingId === entry.id ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => saveEditing(entry.id)} className="text-green-600 hover:text-green-900">
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => startEditing(entry)}
                                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemovePlayer(entry.id, `${entry.players?.first_name} ${entry.players?.last_name}`)}
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                        Añadir jugadora
                    </button>
                </div>
            </div>

            {/* Add Player Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Añadir jugadora al equipo</h3>

                        <form onSubmit={handleAddPlayer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Seleccionar jugadora
                                </label>
                                <select
                                    required
                                    value={selectedPlayerId}
                                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    {playersToAdd.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.last_name}, {p.first_name} ({p.main_position})
                                        </option>
                                    ))}
                                </select>
                                {playersToAdd.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">No hay más jugadoras disponibles.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Dorsal
                                    </label>
                                    <input
                                        type="text"
                                        value={jerseyNumber}
                                        onChange={(e) => setJerseyNumber(e.target.value)}
                                        placeholder="#"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Rol
                                    </label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="Ej: Capitana"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={!selectedPlayerId}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Añadir
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
