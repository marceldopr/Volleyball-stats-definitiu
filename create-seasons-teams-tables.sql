-- ============================================
-- FASE 4A: Crear tablas de temporadas y equipos
-- ============================================

-- Crear tabla seasons
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para seasons
CREATE INDEX IF NOT EXISTS seasons_club_id_idx ON seasons(club_id);
CREATE INDEX IF NOT EXISTS seasons_is_current_idx ON seasons(is_current);

-- Crear tabla teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('female', 'male', 'mixed')),
  competition_level TEXT,
  head_coach_id UUID,
  assistant_coach_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para teams
CREATE INDEX IF NOT EXISTS teams_club_id_idx ON teams(club_id);
CREATE INDEX IF NOT EXISTS teams_season_id_idx ON teams(season_id);
CREATE INDEX IF NOT EXISTS teams_category_idx ON teams(category);

-- Habilitar Row Level Security para seasons
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver temporadas de su club
CREATE POLICY "Users can view seasons from their club"
  ON seasons
  FOR SELECT
  USING (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden insertar temporadas en su club
CREATE POLICY "Users can insert seasons in their club"
  ON seasons
  FOR INSERT
  WITH CHECK (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden actualizar temporadas de su club
CREATE POLICY "Users can update seasons from their club"
  ON seasons
  FOR UPDATE
  USING (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Habilitar Row Level Security para teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver equipos de su club
CREATE POLICY "Users can view teams from their club"
  ON teams
  FOR SELECT
  USING (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden insertar equipos en su club
CREATE POLICY "Users can insert teams in their club"
  ON teams
  FOR INSERT
  WITH CHECK (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden actualizar equipos de su club
CREATE POLICY "Users can update teams from their club"
  ON teams
  FOR UPDATE
  USING (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden eliminar equipos de su club
CREATE POLICY "Users can delete teams from their club"
  ON teams
  FOR DELETE
  USING (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en seasons
CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
