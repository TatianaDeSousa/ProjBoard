-- TABLE POUR LES LIENS CLIENTS (SYCHRONISATION LOCALE -> CLOUD)
DROP TABLE IF EXISTS client_links CASCADE;
CREATE TABLE client_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  project_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS TOTALEMENT OUVERT POUR LE PARTAGE (Plus d'erreur possible)
ALTER TABLE client_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow everything for everyone" ON client_links FOR ALL USING (true) WITH CHECK (true);
