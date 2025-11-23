import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { session, profile, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!session || !profile) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
