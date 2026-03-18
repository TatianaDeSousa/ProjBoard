-- TABLE POUR LES LIENS CLIENTS (SYCHRONISATION LOCALE -> CLOUD)
-- Cette table sert de miroir public pour les projets stockés en local
DROP TABLE IF EXISTS client_links CASCADE;
CREATE TABLE client_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  project_data JSONB NOT NULL, -- On stocke tout l'objet projet ici
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- RLS POUR CLIENT_LINKS (Lecture publique via token)
ALTER TABLE client_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for client_links" ON client_links FOR SELECT USING (true);
CREATE POLICY "Insert for anyone" ON client_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Update for anyone" ON client_links FOR UPDATE USING (true);

-- ON GARDE LES INVITATIONS POUR LE FLUX D'INSCRIPTION
DROP TABLE IF EXISTS invitations CASCADE;
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  team_id TEXT NOT NULL, -- ID du groupe local de l'envoyeur
  team_name TEXT NOT NULL,
  invited_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Invitations access" ON invitations FOR ALL USING (true);
