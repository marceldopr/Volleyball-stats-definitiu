import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, X, Calendar, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getCurrentSeasonByClub, createSeason, SeasonDB } from '@/services/seasonService'
import { getTeamsByClubAndSeason, createTeam, updateTeam, deleteTeam, TeamDB } from '@/services/teamService'
import { TeamRosterManager } from '@/components/teams/TeamRosterManager'

const CATEGORIES = ['Infantil', 'Cadete', 'Juvenil', 'Senior']
const GENDERS = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'mixed', label: 'Mixto' },
]

export function Teams() {
  const { profile } = useAuthStore()
  const [currentSeason, setCurrentSeason] = useState<SeasonDB | null>(null)
  const [teams, setTeams] = useState<TeamDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingSeason, setCreatingSeason] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamDB | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Senior',
    gender: 'female',
    competition_level: '',
    notes: '',
  })
  // Roster management state
  const [selectedTeam, setSelectedTeam] = useState<TeamDB | null>(null)

  // Load current season and teams
  useEffect(() => {
    if (profile?.club_id) {
      loadSeasonAndTeams()
    } else if (profile && !profile.club_id) {
      setLoading(false)
      setError('Tu usuario no tiene un club asignado. Contacta con el administrador.')
    }
  }, [profile])

  const loadSeasonAndTeams = async () => {
    if (!profile?.club_id) return

    try {
      setLoading(true)
      setError(null)

      // Load current season
      const season = await getCurrentSeasonByClub(profile.club_id)
      setCurrentSeason(season)

      // Load teams if there's a current season
      if (season) {
        const teamsData = await getTeamsByClubAndSeason(profile.club_id, season.id)
        setTeams(teamsData)
      } else {
        setTeams([])
      }
    } catch (err) {
      console.error('Error loading teams page data:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSeason = async () => {
    if (!profile?.club_id) return

    try {
      setCreatingSeason(true)
      const currentYear = new Date().getFullYear()
      const seasonName = `Temporada ${currentYear}-${currentYear + 1}`

      await createSeason(profile.club_id, {
        name: seasonName,
        is_current: true
      })
      await loadSeasonAndTeams()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear la temporada')
    } finally {
      setCreatingSeason(false)
    }
  }

  const handleOpenModal = (team?: TeamDB) => {
    if (team) {
      setEditingTeam(team)
      setFormData({
        name: team.name,
        category: team.category,
        gender: team.gender,
        competition_level: team.competition_level || '',
        notes: team.notes || '',
      })
    } else {
      setEditingTeam(null)
      setFormData({
        name: '',
        category: 'Senior',
        gender: 'female',
        competition_level: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTeam(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.club_id || !currentSeason) return

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, formData)
      } else {
        await createTeam(profile.club_id, currentSeason.id, formData)
      }
      await loadSeasonAndTeams()
      handleCloseModal()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar equipo')
    }
  }

  const handleDelete = async (team: TeamDB) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el equipo "${team.name}"?`)) {
      return
    }

    try {
      await deleteTeam(team.id)
      await loadSeasonAndTeams()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar equipo')
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
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando equipos...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Equipos</h1>
              {currentSeason && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Temporada: {currentSeason.name}
                </p>
              )}
            </div>
          </div>

          {/* Create Team Button - Always visible if season exists */}
          {currentSeason && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo equipo</span>
            </button>
          )}
        </div>
      </div>

      {/* No current season message */}
      {!currentSeason && !loading && !error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center max-w-2xl mx-auto">
          <Calendar className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            No hay ninguna temporada actual configurada para este club.
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-6">
            Para empezar a crear equipos, primero necesitas tener una temporada activa.
          </p>
          <button
            onClick={handleCreateSeason}
            disabled={creatingSeason}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingSeason ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Crear Temporada Actual</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-500" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => loadSeasonAndTeams()}
            className="text-sm text-red-700 dark:text-red-300 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Teams grid */}
      {currentSeason && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No hay equipos todavía</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
                Comienza creando los equipos para esta temporada.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear primer equipo
              </button>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {team.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {team.category}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {team.gender === 'female' ? 'Femenino' : team.gender === 'male' ? 'Masculino' : 'Mixto'}
                      </span>
                    </div>
                  </div>
                </div>

                {team.competition_level && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Competición:</span>
                    {team.competition_level}
                  </div>
                )}

                {team.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 italic">
                    "{team.notes}"
                  </p>
                )}

                <div className="mt-auto space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedTeam(team)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Gestionar plantilla
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(team)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(team)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {editingTeam ? <Edit className="w-6 h-6 text-indigo-500" /> : <Plus className="w-6 h-6 text-indigo-500" />}
                  {editingTeam ? 'Editar equipo' : 'Nuevo equipo'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre del equipo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Sénior Femenino A"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Género <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      {GENDERS.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Competition level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nivel de competición
                  </label>
                  <input
                    type="text"
                    value={formData.competition_level}
                    onChange={(e) => setFormData({ ...formData, competition_level: e.target.value })}
                    placeholder="Ej: 1ª Catalana, Preferente..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Notas adicionales
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Cualquier información relevante sobre el equipo..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {editingTeam ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingTeam ? 'Guardar cambios' : 'Crear equipo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Team Roster Manager */}
      {selectedTeam && currentSeason && (
        <TeamRosterManager
          team={selectedTeam}
          season={currentSeason}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  )
}