import { supabase } from '@/lib/supabaseClient'

export interface SeasonDB {
    id: string
    club_id: string
    name: string
    start_date: string | null
    end_date: string | null
    is_current: boolean
    created_at: string
    updated_at: string
}

export const getSeasonsByClub = async (clubId: string): Promise<SeasonDB[]> => {
    const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('club_id', clubId)
        .order('start_date', { ascending: false })

    if (error) {
        console.error('Error fetching seasons:', error)
        throw new Error(`Failed to fetch seasons: ${error.message}`)
    }

    return data || []
}

export const getCurrentSeasonByClub = async (clubId: string): Promise<SeasonDB | null> => {
    const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('club_id', clubId)
        .eq('is_current', true)
        .single()

    if (error) {
        // It's common to not have a current season, so we just return null instead of throwing
        if (error.code === 'PGRST116') return null // No rows returned

        console.error('Error fetching current season:', error)
        return null
    }

    return data
}

export const createSeason = async (clubId: string, data: { name: string; start_date?: string; end_date?: string; is_current?: boolean }): Promise<SeasonDB> => {
    const { data: newSeason, error } = await supabase
        .from('seasons')
        .insert([
            {
                club_id: clubId,
                name: data.name,
                start_date: data.start_date || null,
                end_date: data.end_date || null,
                is_current: data.is_current || false
            }
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating season:', error)
        throw new Error(`Failed to create season: ${error.message}`)
    }

    return newSeason
}

export const setCurrentSeason = async (clubId: string, seasonId: string): Promise<void> => {
    // 1. Set all seasons to not current
    const { error: resetError } = await supabase
        .from('seasons')
        .update({ is_current: false })
        .eq('club_id', clubId)

    if (resetError) {
        console.error('Error resetting current seasons:', resetError)
        throw new Error(`Failed to reset seasons: ${resetError.message}`)
    }

    // 2. Set the selected season to current
    const { error: updateError } = await supabase
        .from('seasons')
        .update({ is_current: true })
        .eq('id', seasonId)

    if (updateError) {
        console.error('Error setting current season:', updateError)
        throw new Error(`Failed to set current season: ${updateError.message}`)
    }
}
