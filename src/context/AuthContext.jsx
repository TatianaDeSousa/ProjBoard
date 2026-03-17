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

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('projboard_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [externalInvites, setExternalInvites] = useState(() => {
    const saved = localStorage.getItem('projboard_external_invites');
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

  useEffect(() => {
    localStorage.setItem('projboard_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('projboard_external_invites', JSON.stringify(externalInvites));
  }, [externalInvites]);

  const signup = (email, password, name) => {
    if (users.find(u => u.email === email)) {
      throw new Error("Cet email est déjà utilisé.");
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      createdAt: new Date().toISOString()
    };

    // Check for external invites for this email
    const pendingInvites = externalInvites.filter(inv => inv.email.toLowerCase() === email.toLowerCase());
    
    setUsers(prev => [...prev, newUser]);
    
    // Create teams state update
    const defaultTeam = {
      id: crypto.randomUUID(),
      name: `Équipe de ${name}`,
      ownerId: newUser.id,
      members: [newUser.id]
    };

    setTeams(prev => {
      let updatedTeams = [...prev, defaultTeam];
      // Auto-join teams from external invites
      pendingInvites.forEach(inv => {
        updatedTeams = updatedTeams.map(t => {
          if (t.id === inv.teamId && !t.members.includes(newUser.id)) {
            return { ...t, members: [...t.members, newUser.id] };
          }
          return t;
        });
      });
      return updatedTeams;
    });

    // Remove consumed external invites
    setExternalInvites(prev => prev.filter(inv => inv.email.toLowerCase() !== email.toLowerCase()));

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

  const addNotification = (userId, notification) => {
    const newNotif = {
      id: crypto.randomUUID(),
      userId,
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const inviteUserToTeam = (teamId, email) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const team = teams.find(t => t.id === teamId);
    
    if (user) {
      // Internal notification
      if (team.members.includes(user.id)) {
        throw new Error("Cet utilisateur est déjà membre de l'équipe.");
      }
      
      // Check if already invited
      if (notifications.find(n => n.userId === user.id && n.teamId === teamId && n.type === 'team_invite' && !n.read)) {
        throw new Error("Une invitation est déjà en attente pour cet utilisateur.");
      }

      addNotification(user.id, {
        type: 'team_invite',
        teamId,
        teamName: team.name,
        fromName: currentUser.name,
        message: `${currentUser.name} vous invite à rejoindre l'équipe "${team.name}"`
      });
      return { type: 'internal' };
    } else {
      // External invite
      const token = crypto.randomUUID();
      const newExtInvite = {
        token,
        teamId,
        email: email.toLowerCase(),
        createdAt: new Date().toISOString()
      };
      setExternalInvites(prev => [...prev, newExtInvite]);
      return { type: 'external', token };
    }
  };

  const acceptTeamInvitation = (notifId) => {
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;

    setTeams(prev => prev.map(t => {
      if (t.id === notif.teamId && !t.members.includes(currentUser.id)) {
        return { ...t, members: [...t.members, currentUser.id] };
      }
      return t;
    }));

    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true, status: 'accepted' } : n));
  };

  const rejectTeamInvitation = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true, status: 'rejected' } : n));
  };

  const getUserNotifications = () => {
    if (!currentUser) return [];
    return notifications.filter(n => n.userId === currentUser.id);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      teams,
      notifications,
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
      getUserTeams,
      inviteUserToTeam,
      acceptTeamInvitation,
      rejectTeamInvitation,
      markNotificationAsRead,
      getUserNotifications,
      addNotification,
      externalInvites
    }}>
      {children}
    </AuthContext.Provider>
  );
};
