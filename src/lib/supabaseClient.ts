// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables are defined in Vite's .env files and are prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

/**
 * A typed Supabase client instance that can be imported throughout the app.
 * The generic types are left as default (any) because the project does not yet
 * define a full schema. Adjust the generics when you have a typed schema.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
