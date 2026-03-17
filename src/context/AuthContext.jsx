import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('projboard_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('projboard_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('projboard_teams');
    return saved ? JSON.parse(saved) : [];
  });

  const [invitations, setInvitations] = useState(() => {
    const saved = localStorage.getItem('projboard_invites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('projboard_auth', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('projboard_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('projboard_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('projboard_invites', JSON.stringify(invitations));
  }, [invitations]);

  const signup = (email, password, name) => {
    if (users.find(u => u.email === email)) {
      throw new Error("Cet email est déjà utilisé.");
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password, // In a real app, this would be hashed
      name,
      createdAt: new Date().toISOString()
    };

    // Create a default personal team for the user
    const defaultTeam = {
      id: crypto.randomUUID(),
      name: `Équipe de ${name}`,
      ownerId: newUser.id,
      members: [newUser.id]
    };

    setUsers(prev => [...prev, newUser]);
    setTeams(prev => [...prev, defaultTeam]);
    setCurrentUser(newUser);
    return newUser;
  };

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Email ou mot de passe incorrect.");
    }
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createTeam = (name) => {
    if (!currentUser) return;
    const newTeam = {
      id: crypto.randomUUID(),
      name,
      ownerId: currentUser.id,
      members: [currentUser.id],
      createdAt: new Date().toISOString()
    };
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const updateTeam = (teamId, updates) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
  };

  const deleteTeam = (teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const addMemberByEmail = (teamId, email) => {
    const userToAdd = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userToAdd) throw new Error("Utilisateur non trouvé. Demandez-lui de s'inscrire !");
    
    setTeams(prev => prev.map(t => {
      if (t.id === teamId && !t.members.includes(userToAdd.id)) {
        return { ...t, members: [...t.members, userToAdd.id] };
      }
      return t;
    }));
    return userToAdd;
  };

  const removeMemberFromTeam = (teamId, userId) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return { ...t, members: t.members.filter(id => id !== userId) };
      }
      return t;
    }));
  };

  const createInvite = (teamId) => {
    const inviteToken = crypto.randomUUID();
    const newInvite = {
      token: inviteToken,
      teamId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    setInvitations(prev => [...prev, newInvite]);
    return inviteToken;
  };

  const joinTeam = (token, userId) => {
    const invite = invitations.find(i => i.token === token);
    if (!invite) throw new Error("Invitation invalide.");
    if (new Date(invite.expiresAt) < new Date()) throw new Error("Invitation expirée.");

    setTeams(prev => prev.map(t => {
      if (t.id === invite.teamId && !t.members.includes(userId)) {
        return { ...t, members: [...t.members, userId] };
      }
      return t;
    }));
    
    return invite.teamId;
  };

  const getUserTeams = () => {
    if (!currentUser) return [];
    return teams.filter(t => t.members && t.members.includes(currentUser.id));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      teams,
      signup,
      login,
      logout,
      createTeam,
      updateTeam,
      deleteTeam,
      addMemberByEmail,
      removeMemberFromTeam,
      createInvite,
      joinTeam,
      getUserTeams
    }}>
      {children}
    </AuthContext.Provider>
  );
};
