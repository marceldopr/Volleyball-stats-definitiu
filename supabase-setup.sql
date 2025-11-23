-- ============================================
-- PASO 1: Crear la tabla profiles
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('director_tecnic', 'entrenador')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 2: Habilitar Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: Crear políticas de seguridad
-- ============================================

-- Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- PASO 4: Crear índice para mejorar rendimiento
-- ============================================

CREATE INDEX IF NOT EXISTS profiles_club_id_idx ON profiles(club_id);

-- ============================================
-- NOTA: Después de ejecutar este script,
-- necesitarás crear un usuario y su perfil
-- ============================================
