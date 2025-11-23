-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id TEXT NOT NULL,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow read access to users in the same club
CREATE POLICY "Users can view reports from their club" ON reports
    FOR SELECT
    USING (
        club_id IN (
            SELECT club_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Allow insert access to users in the same club
CREATE POLICY "Users can create reports for their club" ON reports
    FOR INSERT
    WITH CHECK (
        club_id IN (
            SELECT club_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Allow update/delete for own reports
CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE
    USING (
        author_user_id = auth.uid()
    );

CREATE POLICY "Users can delete their own reports" ON reports
    FOR DELETE
    USING (
        author_user_id = auth.uid()
    );
