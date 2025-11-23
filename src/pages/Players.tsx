import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getPlayersByClub, createPlayer, updatePlayer, PlayerDB, CreatePlayerData } from '@/services/playerService'
import { Users, Plus, Edit2, Search, X } from 'lucide-react'

const POSITIONS = [
    { value: 'S', label: 'Colocadora (S)' },
    { value: 'OH', label: 'Opuesta (OH)' },
    { value: 'MB', label: 'Central (MB)' },
    { value: 'OPP', label: 'Punta (OPP)' },
    { value: 'L', label: 'Líbero (L)' },
]

export function Players() {
    const navigate = useNavigate()
    const { profile } = useAuthStore()
    const [players, setPlayers] = useState<PlayerDB[]>([])
    const [filteredPlayers, setFilteredPlayers] = useState<PlayerDB[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [positionFilter, setPositionFilter] = useState<string>('all')
    const [activeFilter, setActiveFilter] = useState<string>('active')

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [editingPlayer, setEditingPlayer] = useState<PlayerDB | null>(null)
    const [formData, setFormData] = useState<CreatePlayerData>({
        first_name: '',
        last_name: '',
        birth_date: null,
        main_position: 'OH',
        secondary_position: null,
        dominant_hand: null,
        height_cm: null,
        notes: null,
        is_active: true,
    })

    // Load players
    useEffect(() => {
        if (profile?.club_id) {
            loadPlayers()
        }
    }, [profile?.club_id])

    // Apply filters
    useEffect(() => {
        let filtered = [...players]

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(p =>
                p.first_name.toLowerCase().includes(term) ||
                p.last_name.toLowerCase().includes(term)
            )
        }

        // Position filter
        if (positionFilter !== 'all') {
            filtered = filtered.filter(p => p.main_position === positionFilter)
        }

        // Active filter
        if (activeFilter === 'active') {
            filtered = filtered.filter(p => p.is_active)
        }

        setFilteredPlayers(filtered)
    }, [players, searchTerm, positionFilter, activeFilter])

    const loadPlayers = async () => {
        if (!profile?.club_id) return

        try {
            setLoading(true)
            setError(null)
            const data = await getPlayersByClub(profile.club_id)
            setPlayers(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar jugadoras')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (player?: PlayerDB) => {
        if (player) {
            setEditingPlayer(player)
            setFormData({
                first_name: player.first_name,
                last_name: player.last_name,
                birth_date: player.birth_date,
                main_position: player.main_position,
                secondary_position: player.secondary_position,
                dominant_hand: player.dominant_hand,
                height_cm: player.height_cm,
                notes: player.notes,
                is_active: player.is_active,
            })
        } else {
            setEditingPlayer(null)
            setFormData({
                first_name: '',
                last_name: '',
                birth_date: null,
                main_position: 'OH',
                secondary_position: null,
                dominant_hand: null,
                height_cm: null,
                notes: null,
                is_active: true,
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingPlayer(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile?.club_id) return

        try {
            if (editingPlayer) {
                await updatePlayer(editingPlayer.id, formData)
            } else {
                await createPlayer(profile.club_id, formData)
            }
            await loadPlayers()
            handleCloseModal()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al guardar jugadora')
        }
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500 dark:text-gray-400">Cargando perfil...</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando jugadoras...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jugadoras</h1>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva jugadora
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Position filter */}
                    <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">Todas las posiciones</option>
                        {POSITIONS.map(pos => (
                            <option key={pos.value} value={pos.value}>{pos.label}</option>
                        ))}
                    </select>

                    {/* Active filter */}
                    <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="active">Solo activas</option>
                        <option value="all">Todas</option>
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Players table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Posición
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Mano
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredPlayers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No se encontraron jugadoras
                                </td>
                            </tr>
                        ) : (
                            filteredPlayers.map((player) => (
                                <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {player.first_name} {player.last_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                            {player.main_position}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {player.dominant_hand === 'left' ? 'Zurda' : player.dominant_hand === 'right' ? 'Diestra' : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${player.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {player.is_active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/players/${player.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                                            title="Ver detalle"
                                        >
                                            <Search className="w-4 h-4 inline" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(player)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingPlayer ? 'Editar jugadora' : 'Nueva jugadora'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* First name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Last name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Apellidos *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Main position */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Posición principal *
                                        </label>
                                        <select
                                            required
                                            value={formData.main_position}
                                            onChange={(e) => setFormData({ ...formData, main_position: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {POSITIONS.map(pos => (
                                                <option key={pos.value} value={pos.value}>{pos.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dominant hand */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Mano dominante
                                        </label>
                                        <select
                                            value={formData.dominant_hand || ''}
                                            onChange={(e) => setFormData({ ...formData, dominant_hand: e.target.value as 'left' | 'right' | null })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">No especificada</option>
                                            <option value="right">Diestra</option>
                                            <option value="left">Zurda</option>
                                        </select>
                                    </div>

                                    {/* Birth date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Fecha de nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.birth_date || ''}
                                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value || null })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Height */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Altura (cm)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.height_cm || ''}
                                            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notas
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.notes || ''}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Active checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Jugadora activa
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        {editingPlayer ? 'Guardar cambios' : 'Crear jugadora'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
