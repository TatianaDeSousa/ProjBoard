-- VERSION 3 : ROBUSTE
DROP TABLE IF EXISTS client_links CASCADE;
CREATE TABLE client_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  project_id TEXT NOT NULL, -- On indexe par ID texte pour être sûr
  project_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche rapide
CREATE INDEX idx_client_links_project_id ON client_links(project_id);

-- ACCÈS TOTALEMENT OUVERT POUR LE MODE HYBRIDE
ALTER TABLE client_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Full Access" ON client_links FOR ALL USING (true) WITH CHECK (true);
