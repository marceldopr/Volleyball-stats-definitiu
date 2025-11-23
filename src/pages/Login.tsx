// src/pages/Login.tsx
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export const Login = () => {
    const navigate = useNavigate()
    const { login, loading, error, session, profile } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Redirect if already authenticated
    useEffect(() => {
        if (session && profile) {
            navigate('/', { replace: true })
        }
    }, [session, profile, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await login(email, password)
        // If no error after login, navigate to dashboard
        const err = useAuthStore.getState().error
        if (!err) {
            navigate('/')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-900">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Login
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded border-gray-300 bg-white p-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded border-gray-300 bg-white p-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}
