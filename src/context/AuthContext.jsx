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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setCurrentUser(data);
      fetchTeams(user.id);
      fetchNotifications(user.id);
    }
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
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name, owner_id: currentUser.id }])
      .select()
      .single();

    if (data) {
      // Also add as member
      await supabase.from('team_members').insert([{ team_id: data.id, user_id: currentUser.id, role: 'owner' }]);
      fetchTeams(currentUser.id);
    }
    return data;
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
