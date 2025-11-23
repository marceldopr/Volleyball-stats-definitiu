import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MatchWizard } from '@/components/MatchWizard'

export function NewMatch() {
    const navigate = useNavigate()
    const [isWizardOpen, setIsWizardOpen] = useState(true)

    const handleClose = () => {
        setIsWizardOpen(false)
        navigate('/matches')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-500">Abriendo asistente...</p>
            </div>
            <MatchWizard
                isOpen={isWizardOpen}
                onClose={handleClose}
            />
        </div>
    )
}
