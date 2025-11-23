import { supabase } from '@/lib/supabaseClient'

export interface PlayerReportDB {
    id: string
    club_id: string
    player_id: string
    author_user_id: string
    date: string // ISO date string YYYY-MM-DD
    title: string
    content: string
    created_at: string
    updated_at: string
}

export type CreateReportData = {
    club_id: string
    player_id: string
    author_user_id: string
    date: string
    title: string
    content: string
}

/**
 * Get all reports for a specific player
 */
export async function getReportsByPlayer(clubId: string, playerId: string): Promise<PlayerReportDB[]> {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('club_id', clubId)
            .eq('player_id', playerId)
            .order('date', { ascending: false })

        if (error) {
            console.error('Error fetching player reports:', error)
            throw new Error(`Failed to fetch reports: ${error.message}`)
        }

        return data || []
    } catch (error) {
        console.error('Error in getReportsByPlayer:', error)
        throw error
    }
}

/**
 * Create a new player report
 */
export async function createPlayerReport(data: CreateReportData): Promise<PlayerReportDB> {
    try {
        const { data: newReport, error } = await supabase
            .from('reports')
            .insert([data])
            .select()
            .single()

        if (error) {
            console.error('Error creating player report:', error)
            throw new Error(`Failed to create report: ${error.message}`)
        }

        return newReport
    } catch (error) {
        console.error('Error in createPlayerReport:', error)
        throw error
    }
}

/**
 * Update a player report (Optional for now, but good to have structure)
 */
export async function updatePlayerReport(id: string, data: Partial<CreateReportData>): Promise<PlayerReportDB> {
    try {
        const { data: updatedReport, error } = await supabase
            .from('reports')
            .update(data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating player report:', error)
            throw new Error(`Failed to update report: ${error.message}`)
        }

        return updatedReport
    } catch (error) {
        console.error('Error in updatePlayerReport:', error)
        throw error
    }
}

/**
 * Delete a player report
 */
export async function deletePlayerReport(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting player report:', error)
            throw new Error(`Failed to delete report: ${error.message}`)
        }
    } catch (error) {
        console.error('Error in deletePlayerReport:', error)
        throw error
    }
}
