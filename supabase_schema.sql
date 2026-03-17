-- 1. Profiles (extending auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Teams
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team Members
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'owner', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  client TEXT,
  type TEXT,
  status TEXT DEFAULT 'on_track',
  progress INTEGER DEFAULT 0,
  deadline DATE,
  health_score INTEGER DEFAULT 100,
  iterations INTEGER DEFAULT 0,
  share_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Milestones
CREATE TABLE milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  due_date DATE,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assignee_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Logs
CREATE TABLE project_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Feedback
CREATE TABLE project_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  value TEXT NOT NULL, -- 'good', 'medium', 'difficult'
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Invitations
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- 9. Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  project_id UUID,
  team_id UUID,
  team_name TEXT,
  from_name TEXT,
  status TEXT, -- 'accepted', 'rejected' for invites
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for broad access among team members)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Team access." ON teams FOR ALL USING (
  owner_id = auth.uid() OR id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

CREATE POLICY "Member access." ON team_members FOR ALL USING (
  user_id = auth.uid() OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Project access." ON projects FOR ALL USING (
  owner_id = auth.uid() OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

CREATE POLICY "Milestone access." ON milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id)
);
CREATE POLICY "Log access." ON project_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id)
);
CREATE POLICY "Feedback access." ON project_feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id)
);

CREATE POLICY "Invite access." ON invitations FOR ALL USING (true); -- Simplified

CREATE POLICY "Notification access." ON notifications FOR ALL USING (user_id = auth.uid());

-- Trigger for profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_initials)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', SUBSTRING(new.raw_user_meta_data->>'name' FROM 1 FOR 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Contacts
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own contacts." ON contacts FOR ALL USING (owner_id = auth.uid());
