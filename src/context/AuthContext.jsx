import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setCurrentUser(null);
        setTeams([]);
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user) => {
    console.log('[AuthContext] fetchProfile called for user:', user.id);
    
    // Retry up to 3 times — trigger can be slower than the auth event
    let data = null;
    for (let i = 0; i < 3; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 800)); // wait 800ms between retries
      const res = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      data = res.data;
      if (data) break;
      console.warn(`[AuthContext] Profile not found yet, retry ${i + 1}/3`);
    }

    if (data) {
      console.log('[AuthContext] Profile loaded:', data.name);
      setCurrentUser(data);
    } else {
      // Fallback: build a profile from auth metadata so the app still works
      console.warn('[AuthContext] Profile still missing after retries — using auth metadata fallback');
      const fallback = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
        avatar_initials: (user.user_metadata?.name || 'U').charAt(0).toUpperCase()
      };
      setCurrentUser(fallback);
    }

    fetchTeams(user.id);
    fetchNotifications(user.id);
    setLoading(false);
  };

  const fetchTeams = async (userId) => {
    const { data } = await supabase
      .from('teams')
      .select('*, team_members(*)');
    
    if (data) setTeams(data);
  };

  const fetchNotifications = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
  };

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;
    return data.user;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const createTeam = async (name) => {
    if (!currentUser) throw new Error('Vous devez être connecté.');
    console.log('[AuthContext] createTeam:', name);
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name, owner_id: currentUser.id }])
      .select()
      .single();

    if (error) {
      console.error('[AuthContext] createTeam error:', error);
      throw new Error(error.message);
    }

    if (data) {
      await supabase.from('team_members').insert([{ team_id: data.id, user_id: currentUser.id, role: 'owner' }]);
      await fetchTeams(currentUser.id);
      console.log('[AuthContext] team created:', data.id);
    }
    return data;
  };

  const deleteTeam = async (teamId) => {
    if (!currentUser) return;
    console.log('[AuthContext] deleteTeam:', teamId);
    const { error } = await supabase.from('teams').delete().eq('id', teamId).eq('owner_id', currentUser.id);
    if (error) { console.error('[AuthContext] deleteTeam error:', error); throw new Error(error.message); }
    await fetchTeams(currentUser.id);
  };

  const inviteUserToTeam = async (teamId, email) => {
    // Check if user exists
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase());

    const user = profiles?.[0];
    const team = teams.find(t => t.id === teamId);

    if (user) {
      // Internal notification
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .eq('read', false);

      if (existingNotif?.length > 0) throw new Error("Invitation déjà en attente.");

      await addNotification(user.id, {
        type: 'team_invite',
        team_id: teamId,
        team_name: team.name,
        from_name: currentUser.name,
        message: `${currentUser.name} vous invite à rejoindre "${team.name}"`
      });
      return { type: 'internal' };
    } else {
      // External invite
      const token = crypto.randomUUID();
      const { error } = await supabase
        .from('invitations')
        .insert([{ 
          team_id: teamId, 
          invited_email: email.toLowerCase(), 
          token 
        }]);
      
      if (error) throw error;
      return { type: 'external', token };
    }
  };

  const addNotification = async (userId, notification) => {
    const { data } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, ...notification }])
      .select()
      .single();
    return data;
  };

  const acceptTeamInvitation = async (notifId) => {
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;

    await supabase.from('team_members').insert([{ team_id: notif.team_id, user_id: currentUser.id }]);
    await supabase.from('notifications').update({ read: true, status: 'accepted' }).eq('id', notifId);
    
    fetchTeams(currentUser.id);
    fetchNotifications(currentUser.id);
  };

  const rejectTeamInvitation = async (notifId) => {
    await supabase.from('notifications').update({ read: true, status: 'rejected' }).eq('id', notifId);
    fetchNotifications(currentUser.id);
  };

  const markNotificationAsRead = async (notifId) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const getUserTeams = () => teams;
  const getUserNotifications = () => notifications;

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      teams,
      notifications,
      signup,
      login,
      logout,
      createTeam,
      deleteTeam,
      inviteUserToTeam,
      acceptTeamInvitation,
      rejectTeamInvitation,
      markNotificationAsRead,
      getUserTeams,
      getUserNotifications,
      addNotification
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
