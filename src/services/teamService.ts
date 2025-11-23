import { supabase } from '@/lib/supabaseClient'

export interface TeamDB {
    id: string
    club_id: string
    season_id: string
    name: string
    category: string
    gender: 'female' | 'male' | 'mixed' | string
    competition_level: string | null
    head_coach_id: string | null
    assistant_coach_id: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export const getTeamsByClubAndSeason = async (clubId: string, seasonId: string): Promise<TeamDB[]> => {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('club_id', clubId)
        .eq('season_id', seasonId)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching teams:', error)
        throw new Error(`Failed to fetch teams: ${error.message}`)
    }

    return data || []
}

export const createTeam = async (clubId: string, seasonId: string, data: { name: string; category: string; gender: string; competition_level?: string; notes?: string }): Promise<TeamDB> => {
    const { data: newTeam, error } = await supabase
        .from('teams')
        .insert([
            {
                club_id: clubId,
                season_id: seasonId,
                name: data.name,
                category: data.category,
                gender: data.gender,
                competition_level: data.competition_level || null,
                notes: data.notes || null
            }
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating team:', error)
        throw new Error(`Failed to create team: ${error.message}`)
    }

    return newTeam
}

export const updateTeam = async (id: string, data: Partial<TeamDB>): Promise<TeamDB> => {
    const { data: updatedTeam, error } = await supabase
        .from('teams')
        .update(data)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating team:', error)
        throw new Error(`Failed to update team: ${error.message}`)
    }

    return updatedTeam
}

export const deleteTeam = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting team:', error)
        throw new Error(`Failed to delete team: ${error.message}`)
    }
}
