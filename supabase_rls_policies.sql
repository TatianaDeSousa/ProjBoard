-- ============================================================
-- SUPABASE RLS POLICIES — A EXECUTER DANS SQL EDITOR
-- Drop existing policies first, then recreate clean ones
-- ============================================================

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile." ON profiles;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ---- TEAMS ----
DROP POLICY IF EXISTS "Team access." ON teams;
DROP POLICY IF EXISTS "Users can create teams." ON teams;
DROP POLICY IF EXISTS "Users can view teams they belong to." ON teams;
DROP POLICY IF EXISTS "Owners can update teams." ON teams;

CREATE POLICY "teams_select" ON teams FOR SELECT USING (
  owner_id = auth.uid() OR
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "teams_insert" ON teams FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "teams_update" ON teams FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "teams_delete" ON teams FOR DELETE USING (owner_id = auth.uid());

-- ---- TEAM_MEMBERS ----
DROP POLICY IF EXISTS "Member access." ON team_members;
DROP POLICY IF EXISTS "Members can see other members." ON team_members;
DROP POLICY IF EXISTS "Owners can add members." ON team_members;

CREATE POLICY "team_members_select" ON team_members FOR SELECT USING (
  user_id = auth.uid() OR
  team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()) OR
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "team_members_insert" ON team_members FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);
CREATE POLICY "team_members_delete" ON team_members FOR DELETE USING (
  user_id = auth.uid() OR
  team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);

-- ---- PROJECTS ----
DROP POLICY IF EXISTS "Project access." ON projects;
DROP POLICY IF EXISTS "Users can view projects they own or team projects." ON projects;
DROP POLICY IF EXISTS "Users can insert projects." ON projects;
DROP POLICY IF EXISTS "Owners or team members can update projects." ON projects;

CREATE POLICY "projects_select" ON projects FOR SELECT USING (
  owner_id = auth.uid() OR
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (
  owner_id = auth.uid() OR
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (owner_id = auth.uid());

-- ---- MILESTONES ----
DROP POLICY IF EXISTS "Milestone access." ON milestones;

CREATE POLICY "milestones_select" ON milestones FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE
      owner_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);
CREATE POLICY "milestones_insert" ON milestones FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE
      owner_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);
CREATE POLICY "milestones_update" ON milestones FOR UPDATE USING (
  project_id IN (
    SELECT id FROM projects WHERE
      owner_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);
CREATE POLICY "milestones_delete" ON milestones FOR DELETE USING (
  project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
);

-- ---- PROJECT_LOGS ----
DROP POLICY IF EXISTS "Log access." ON project_logs;

CREATE POLICY "logs_select" ON project_logs FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE
      owner_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);
CREATE POLICY "logs_insert" ON project_logs FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE
      owner_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);

-- ---- PROJECT_FEEDBACK ----
DROP POLICY IF EXISTS "Feedback access." ON project_feedback;

-- Public read so clients without account can insert feedback
CREATE POLICY "feedback_select" ON project_feedback FOR SELECT USING (true);
CREATE POLICY "feedback_insert" ON project_feedback FOR INSERT WITH CHECK (true);

-- ---- INVITATIONS ----
DROP POLICY IF EXISTS "Invite access." ON invitations;

CREATE POLICY "invitations_select" ON invitations FOR SELECT USING (true);
CREATE POLICY "invitations_insert" ON invitations FOR INSERT WITH CHECK (
  team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
);
CREATE POLICY "invitations_update" ON invitations FOR UPDATE USING (true);

-- ---- NOTIFICATIONS ----
DROP POLICY IF EXISTS "Notification access." ON notifications;
DROP POLICY IF EXISTS "Users can see their own notifications." ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications." ON notifications;

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ---- CONTACTS ----
DROP POLICY IF EXISTS "Users can see their own contacts." ON contacts;

CREATE POLICY "contacts_all" ON contacts FOR ALL USING (owner_id = auth.uid());
