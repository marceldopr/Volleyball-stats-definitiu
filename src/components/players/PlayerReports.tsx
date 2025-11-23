import { useState, useEffect } from 'react'
import { Plus, FileText, Calendar, User, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { getReportsByPlayer, createPlayerReport, PlayerReportDB } from '../../services/reportService'

interface PlayerReportsProps {
    playerId: string
}

export function PlayerReports({ playerId }: PlayerReportsProps) {
    const { profile } = useAuthStore()
    const [reports, setReports] = useState<PlayerReportDB[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form state
    const [newReport, setNewReport] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        content: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (profile?.club_id && playerId) {
            loadReports()
        }
    }, [profile?.club_id, playerId])

    const loadReports = async () => {
        if (!profile?.club_id) return

        try {
            setLoading(true)
            const data = await getReportsByPlayer(profile.club_id, playerId)
            setReports(data)
            setError(null)
        } catch (err) {
            console.error('Error loading reports:', err)
            setError('Error al cargar los informes.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateReport = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile?.club_id || !profile?.id) return

        try {
            setSubmitting(true)
            await createPlayerReport({
                club_id: profile.club_id,
                player_id: playerId,
                author_user_id: profile.id,
                date: newReport.date,
                title: newReport.title,
                content: newReport.content
            })

            // Reset form and close modal
            setNewReport({
                title: '',
                date: new Date().toISOString().split('T')[0],
                content: ''
            })
            setIsModalOpen(false)

            // Reload reports
            loadReports()
        } catch (err) {
            console.error('Error creating report:', err)
            alert('Error al guardar el informe.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Informes de seguimiento
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Informe
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Cargando informes...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No hay informes registrados</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Crea el primer informe para esta jugadora</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{report.title}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(report.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {/* In a real app we might fetch the author name, for now we assume the current user is the author or just show 'Autor' */}
                                            {/* Ideally we would join with profiles table, but for this phase we keep it simple */}
                                            Autor
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {report.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Report Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Nuevo Informe</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReport} className="p-6 overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Título
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newReport.title}
                                        onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Ej: Evaluación técnica mensual"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={newReport.date}
                                        onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contenido
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={newReport.content}
                                        onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                        placeholder="Escribe aquí el contenido del informe..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar Informe'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
