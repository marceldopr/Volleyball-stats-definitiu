// src/services/playerTeamSeasonService.ts
import { supabase } from '@/lib/supabaseClient'

export interface PlayerTeamSeasonDB {
    id: string
    player_id: string
    team_id: string
    season_id: string
    jersey_number: string | null
    role: string | null
    expected_category: string | null
    current_category: string | null
    status: string | null
    notes: string | null
    created_at: string
    updated_at: string
    // Joined fields
    players?: {
        first_name: string
        last_name: string
        main_position: string
    }
}

export type AddPlayerToTeamData = {
    player_id: string
    team_id: string
    season_id: string
    jersey_number?: string
    role?: string
    expected_category?: string
    current_category?: string
    status?: string
    notes?: string
}

/**
 * Get all players in a specific team and season
 */
export async function getRosterByTeamAndSeason(teamId: string, seasonId: string): Promise<PlayerTeamSeasonDB[]> {
    try {
        const { data, error } = await supabase
            .from('player_team_season')
            .select(`
        *,
        players (
          first_name,
          last_name,
          main_position
        )
      `)
            .eq('team_id', teamId)
            .eq('season_id', seasonId)
            .order('jersey_number', { ascending: true })

        if (error) {
            console.error('Error fetching roster:', error)
            throw new Error(`Failed to fetch roster: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error('Error in getRosterByTeamAndSeason:', error)
        throw error
    }
}

/**
 * Add a player to a team for a specific season
 */
export async function addPlayerToTeamSeason(data: AddPlayerToTeamData): Promise<PlayerTeamSeasonDB> {
    try {
        const { data: newEntry, error } = await supabase
            .from('player_team_season')
            .insert([data])
            .select()
            .single()

        if (error) {
            console.error('Error adding player to team:', error)
            throw new Error(`Failed to add player to team: ${error.message}`)
        }

        return newEntry
    } catch (error) {
        console.error('Error in addPlayerToTeamSeason:', error)
        throw error
    }
}

/**
 * Update a player's details in a team roster
 */
export async function updatePlayerInTeamSeason(id: string, data: Partial<AddPlayerToTeamData>): Promise<PlayerTeamSeasonDB> {
    try {
        const { data: updatedEntry, error } = await supabase
            .from('player_team_season')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating player in team:', error)
            throw new Error(`Failed to update player in team: ${error.message}`)
        }

        return updatedEntry
    } catch (error) {
        console.error('Error in updatePlayerInTeamSeason:', error)
        throw error
    }
}

/**
 * Remove a player from a team roster
 */
export async function removePlayerFromTeamSeason(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('player_team_season')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error removing player from team:', error)
            throw new Error(`Failed to remove player from team: ${error.message}`)
        }
    } catch (error) {
        console.error('Error in removePlayerFromTeamSeason:', error)
        throw error
    }
}
