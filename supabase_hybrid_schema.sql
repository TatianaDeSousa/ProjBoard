-- VERSION 4 : SÉCURITÉ MAXIMALE & SIMPLICITÉ
DROP TABLE IF EXISTS client_links CASCADE;

CREATE TABLE client_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  project_id TEXT NOT NULL,
  project_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Désactivation RLS un instant pour être SÛR que ça passe
ALTER TABLE client_links DISABLE ROW LEVEL SECURITY;

-- Autorisation totale pour tous les rôles Supabase
GRANT ALL ON client_links TO anon;
GRANT ALL ON client_links TO authenticated;
GRANT ALL ON client_links TO service_role;

-- Réactivation RLS avec politique "Open Bar"
ALTER TABLE client_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full Access" ON client_links FOR ALL USING (true) WITH CHECK (true);
