import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // LES DOSSIERS REMPLACENT LES GROUPES (TOUT EN LOCAL)
  const [folders, setFolders] = useState(() => JSON.parse(localStorage.getItem('pb_folders')) || []);

  useEffect(() => {
    localStorage.setItem('pb_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) syncProfile(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) syncProfile(session.user);
      else { setCurrentUser(null); setLoading(false); }
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
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    return data.user;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => { await supabase.auth.signOut(); };

  // GESTION DES DOSSIERS (LOCAL)
  const createFolder = (name) => {
    const newFolder = { id: crypto.randomUUID(), name, owner_id: currentUser?.id };
    setFolders([...folders, newFolder]);
    return newFolder;
  };

  const deleteFolder = (folderId) => {
    setFolders(folders.filter(f => f.id !== folderId));
  };

  return (
    <AuthContext.Provider value={{
      currentUser, loading, folders,
      signup, login, logout, createFolder, deleteFolder
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
