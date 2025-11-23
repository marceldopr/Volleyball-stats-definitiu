// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabaseClient'

export type UserRole = 'director_tecnic' | 'entrenador'

export interface Profile {
    id: string
    club_id: string
    full_name: string
    role: UserRole | null
}

interface AuthState {
    session: any | null
    profile: Profile | null
    loading: boolean
    error: string | null
    isAuthenticated: boolean
    setSession: (session: any | null) => void
    setProfile: (profile: Profile | null) => void
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            session: null,
            profile: null,
            loading: false,
            error: null,
            get isAuthenticated() {
                const state = get()
                return !!(state.session && state.profile)
            },
            setSession: (session) => set({ session }),
            setProfile: (profile) => set({ profile }),
            login: async (email, password) => {
                set({ loading: true, error: null })
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (signInError || !signInData?.session) {
                    set({ error: signInError?.message ?? 'Login failed', loading: false })
                    return
                }
                const session = signInData.session
                const userId = session.user.id
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()
                if (profileError || !profileData) {
                    set({ error: profileError?.message ?? 'Failed to fetch profile', loading: false })
                    return
                }
                const profile: Profile = {
                    id: profileData.id,
                    club_id: profileData.club_id,
                    full_name: profileData.full_name,
                    role: profileData.role as UserRole,
                }
                set({ session, profile, loading: false })
            },
            logout: async () => {
                set({ loading: true })
                await supabase.auth.signOut()
                set({ session: null, profile: null, loading: false })
            },
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                session: state.session,
                profile: state.profile
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.loading = false;
                }
            },
        },
    ),
)
