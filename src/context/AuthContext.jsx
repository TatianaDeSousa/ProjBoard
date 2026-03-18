import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // TOUT LE RESTE EST EN LOCALSTORAGE (MODE STABLE)
  const [teams, setTeams] = useState(() => JSON.parse(localStorage.getItem('pb_teams')) || []);
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('pb_notifications')) || []);

  useEffect(() => {
    localStorage.setItem('pb_teams', JSON.stringify(teams));
    localStorage.setItem('pb_notifications', JSON.stringify(notifications));
  }, [teams, notifications]);

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        syncProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Échanges auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        syncProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = (user) => {
    setCurrentUser({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      avatar_initials: (user.user_metadata?.name || 'U').charAt(0).toUpperCase()
    });
    setLoading(false);
  };

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data.user;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // SERVICES DE GROUPE (LOCAL)
  const createTeam = (name) => {
    const newTeam = {
      id: crypto.randomUUID(),
      name,
      owner_id: currentUser.id,
      members: [currentUser.id],
      team_members: [{ user_id: currentUser.id, name: currentUser.name, role: 'owner' }]
    };
    setTeams([...teams, newTeam]);
    return newTeam;
  };

  const deleteTeam = (teamId) => {
    setTeams(teams.filter(t => t.id !== teamId));
  };

  // INVITATIONS RÉELLES (CLOUD)
  const inviteUserToTeam = async (teamId, email) => {
    const team = teams.find(t => t.id === teamId);
    const token = crypto.randomUUID();
    
    const { error } = await supabase
      .from('invitations')
      .insert([{ 
        team_id: teamId, 
        invited_email: email.toLowerCase(), 
        token, 
        team_name: team.name 
      }]);
    
    if (error) throw error;
    return { type: 'external', token };
  };

  const addNotification = (notif) => {
    const newNotif = { id: crypto.randomUUID(), created_at: new Date().toISOString(), read: false, ...notif };
    setNotifications([newNotif, ...notifications]);
    return newNotif;
  };

  const acceptTeamInvitation = (notifId) => {
    // En mode hybride, on ajoute le membre au groupe local (simulation de groupe projet)
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true, status: 'accepted' } : n));
  };

  const rejectTeamInvitation = (notifId) => {
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true, status: 'rejected' } : n));
  };

  const getUserTeams = () => teams;
  const getUserNotifications = () => notifications;

  return (
    <AuthContext.Provider value={{
      currentUser, loading, teams, notifications,
      signup, login, logout, createTeam, deleteTeam,
      inviteUserToTeam, acceptTeamInvitation, rejectTeamInvitation,
      getUserTeams, getUserNotifications, addNotification
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
