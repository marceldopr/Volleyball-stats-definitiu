-- ============================================
-- FASE 4B: Crear tabla de plantillas (rosters)
-- ============================================

-- Crear tabla player_team_season
CREATE TABLE IF NOT EXISTS player_team_season (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  jersey_number TEXT,
  role TEXT,
  expected_category TEXT,
  current_category TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, team_id, season_id) -- Evitar duplicados del mismo jugador en el mismo equipo y temporada
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS roster_team_season_idx ON player_team_season(team_id, season_id);
CREATE INDEX IF NOT EXISTS roster_player_idx ON player_team_season(player_id);

-- Habilitar Row Level Security
ALTER TABLE player_team_season ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver plantillas de equipos de su club
-- (Se asume que si tienes acceso al equipo, tienes acceso a su plantilla)
CREATE POLICY "Users can view rosters from their club"
  ON player_team_season
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = player_team_season.team_id
      AND teams.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Política: Los usuarios pueden insertar jugadores en equipos de su club
CREATE POLICY "Users can insert players into rosters of their club"
  ON player_team_season
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = player_team_season.team_id
      AND teams.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Política: Los usuarios pueden actualizar jugadores en equipos de su club
CREATE POLICY "Users can update players in rosters of their club"
  ON player_team_season
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = player_team_season.team_id
      AND teams.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Política: Los usuarios pueden eliminar jugadores de equipos de su club
CREATE POLICY "Users can delete players from rosters of their club"
  ON player_team_season
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = player_team_season.team_id
      AND teams.club_id = (SELECT club_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_roster_updated_at
  BEFORE UPDATE ON player_team_season
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
