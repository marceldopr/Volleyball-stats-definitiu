// src/services/playerService.ts
import { supabase } from '@/lib/supabaseClient'

export interface PlayerDB {
    id: string
    club_id: string
    first_name: string
    last_name: string
    birth_date: string | null
    main_position: 'S' | 'OH' | 'MB' | 'OPP' | 'L' | string
    secondary_position: string | null
    dominant_hand: 'left' | 'right' | null
    height_cm: number | null
    notes: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export type CreatePlayerData = Omit<PlayerDB, 'id' | 'club_id' | 'created_at' | 'updated_at'>

/**
 * Get all players for a specific club
 */
export async function getPlayersByClub(clubId: string): Promise<PlayerDB[]> {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('club_id', clubId)
            .order('last_name', { ascending: true })

        if (error) {
            console.error('Error fetching players:', error)
            throw new Error(`Failed to fetch players: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error('Error in getPlayersByClub:', error)
        throw error
    }
}

/**
 * Create a new player
 */
export async function createPlayer(clubId: string, data: CreatePlayerData): Promise<PlayerDB> {
    try {
        const playerData = {
            club_id: clubId,
            ...data,
        }

        const { data: newPlayer, error } = await supabase
            .from('players')
            .insert([playerData])
            .select()
            .single()

        if (error) {
            console.error('Error creating player:', error)
            throw new Error(`Failed to create player: ${error.message}`)
        }

        return newPlayer
    } catch (error) {
        console.error('Error in createPlayer:', error)
        throw error
    }
}

/**
 * Update an existing player
 */
export async function updatePlayer(id: string, data: Partial<CreatePlayerData>): Promise<PlayerDB> {
    try {
        const { data: updatedPlayer, error } = await supabase
            .from('players')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating player:', error)
            throw new Error(`Failed to update player: ${error.message}`)
        }

        return updatedPlayer
    } catch (error) {
        console.error('Error in updatePlayer:', error)
        throw error
    }
}

/**
 * Deactivate a player (soft delete)
 */
export async function deactivatePlayer(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('players')
            .update({ is_active: false })
            .eq('id', id)

        if (error) {
            console.error('Error deactivating player:', error)
            throw new Error(`Failed to deactivate player: ${error.message}`)
        }
    } catch (error) {
        console.error('Error in deactivatePlayer:', error)
        throw error
    }
}
