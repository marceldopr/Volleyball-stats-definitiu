-- ============================================
-- FASE 3: Crear tabla de jugadoras
-- ============================================

-- Crear tabla players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  main_position TEXT CHECK (main_position IN ('S', 'OH', 'MB', 'OPP', 'L')),
  secondary_position TEXT,
  dominant_hand TEXT CHECK (dominant_hand IN ('left', 'right')),
  height_cm INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS players_club_id_idx ON players(club_id);
CREATE INDEX IF NOT EXISTS players_is_active_idx ON players(is_active);
CREATE INDEX IF NOT EXISTS players_last_name_idx ON players(last_name);

-- Habilitar Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver jugadores de su club
CREATE POLICY "Users can view players from their club"
  ON players
  FOR SELECT
  USING (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden insertar jugadores en su club
CREATE POLICY "Users can insert players in their club"
  ON players
  FOR INSERT
  WITH CHECK (
    club_id = (
      SELECT club_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden actualizar jugadores de su club
CREATE POLICY "Users can update players from their club"
  ON players
  FOR UPDATE
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

-- Trigger para actualizar updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
