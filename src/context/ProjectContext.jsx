import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { currentUser, getUserTeams } = useAuth();
  
  const [projects, setProjects] = useState(() => {
    const savedData = localStorage.getItem('projboard_data');
    return savedData ? JSON.parse(savedData) : [];
  });

  useEffect(() => {
    localStorage.setItem('projboard_data', JSON.stringify(projects));
  }, [projects]);

  // Filter projects based on teams the user is a member of
  const userTeams = getUserTeams();
  const teamIds = (userTeams || []).map(t => t.id);
  
  const visibleProjects = (projects || []).filter(p => 
    (currentUser && p.ownerId === currentUser.id) || 
    (p.teamId && teamIds.includes(p.teamId))
  );

  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const doneCount = milestones.filter(m => m.status === 'done').length;
    return Math.round((doneCount / milestones.length) * 100);
  };

  const getAutoStatus = (project) => {
    const progress = calculateProgress(project.milestones);
    if (progress === 100) return 'done';
    
    const today = new Date();
    const deadline = new Date(project.deadline);
    
    if (deadline < today) return 'delayed';
    
    const diffTime = Math.abs(deadline - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && progress < 50) return 'at_risk';
    
    return 'on_track';
  };

  const toggleTimer = (projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const now = new Date().toISOString();
        if (p.timerActiveSince) {
          // Stopping timer
          const start = new Date(p.timerActiveSince);
          const end = new Date(now);
          const elapsed = Math.floor((end - start) / 1000);
          const totalTime = (p.totalTime || 0) + elapsed;
          
          const newLog = {
            id: crypto.randomUUID(),
            action: 'Chrono Arrêté',
            details: `Session de ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
            timestamp: now
          };

          return {
            ...p,
            totalTime,
            timerActiveSince: null,
            logs: [newLog, ...(p.logs || [])],
            updatedAt: now
          };
        } else {
          // Starting timer
          const newLog = {
            id: crypto.randomUUID(),
            action: 'Chrono Démarré',
            details: 'Travail en cours...',
            timestamp: now
          };
          return {
            ...p,
            timerActiveSince: now,
            logs: [newLog, ...(p.logs || [])],
            updatedAt: now
          };
        }
      }
      return p;
    }));
  };

  const addFeedback = (projectId, value) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newFeedback = {
          id: crypto.randomUUID(),
          value, // 'good', 'medium', 'difficult'
          timestamp: new Date().toISOString()
        };
        const updated = {
          ...p,
          feedback: [...(p.feedback || []), newFeedback],
          updatedAt: new Date().toISOString()
        };
        updated.healthScore = calculateHealthScore(updated);
        
        const newLog = {
          id: crypto.randomUUID(),
          action: 'Humeur Client',
          details: `Retour client: ${value === 'good' ? 'Bien' : value === 'medium' ? 'Moyen' : 'Difficile'}`,
          timestamp: new Date().toISOString()
        };
        updated.logs = [newLog, ...(updated.logs || [])];

        return updated;
      }
      return p;
    }));
  };

  const calculateHealthScore = (project) => {
    let score = 0;
    const now = new Date();
    const deadline = new Date(project.deadline);
    const lastUpdate = new Date(project.updatedAt || project.createdAt);
    const iterations = project.iterations || 0;
    const feedback = project.feedback || [];

    // 1. Deadline (50 pts)
    if (project.progress === 100) {
      score += 50;
    } else {
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 14) score += 50;
      else if (diffDays > 7) score += 35;
      else if (diffDays > 0) score += 15;
      else score += 0; // Overdue
    }

    // 2. Regularity (30 pts)
    const inactiveTime = now - lastUpdate;
    const inactiveDays = Math.ceil(inactiveTime / (1000 * 60 * 60 * 24));
    if (inactiveDays <= 2) score += 30;
    else if (inactiveDays <= 5) score += 20;
    else if (inactiveDays <= 10) score += 10;
    else score += 0;

    // 3. Iterations & Feedback (20 pts)
    const iterationScore = Math.max(0, 10 - (iterations * 2)); // Up to 10 pts
    const avgFeedback = feedback.length > 0 
      ? feedback.reduce((acc, f) => acc + (f.value === 'good' ? 10 : f.value === 'medium' ? 5 : 0), 0) / feedback.length
      : 10; // Default if no feedback
    
    score += iterationScore + avgFeedback;

    return Math.min(100, Math.max(0, score));
  };

  const addProject = (projectData) => {
    if (!currentUser) return;

    const userTeams = getUserTeams();
    const teamId = projectData.teamId !== undefined ? projectData.teamId : (userTeams.length > 0 ? userTeams[0].id : null);

    const newProject = {
      id: crypto.randomUUID(),
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      teamId: teamId,
      teamName: teamId ? userTeams.find(t => t.id === teamId)?.name : null,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareToken: crypto.randomUUID(),
      milestones: [],
      logs: [{ id: '1', action: 'Création', details: 'Projet créé', timestamp: new Date().toISOString() }],
      totalTime: 0, // in seconds
      timerActiveSince: null,
      feedback: [],
      progress: 0,
      status: 'on_track',
      iterations: 0,
      healthScore: 100
    };
    newProject.status = getAutoStatus(newProject);
    newProject.healthScore = calculateHealthScore(newProject);
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { 
          ...p, 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        updated.progress = calculateProgress(updated.milestones);
        updated.status = getAutoStatus(updated);
        updated.healthScore = calculateHealthScore(updated);
        
        // Automatic Logging
        const logAction = updates.status ? `Statut: ${updates.status}` : 'Mise à jour';
        const logDetails = updates.name ? `Renommé en ${updates.name}` : 'Modifications générales';
        
        const newLog = {
          id: crypto.randomUUID(),
          action: logAction,
          details: logDetails,
          timestamp: new Date().toISOString()
        };
        updated.logs = [newLog, ...(updated.logs || [])];

        return updated;
      }
      return p;
    }));
  };

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addMilestone = (projectId, milestoneData) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newMilestone = {
          id: crypto.randomUUID(),
          projectId,
          status: 'todo',
          assigneeId: milestoneData.assigneeId || null,
          ...milestoneData
        };
        const updatedMilestones = [...p.milestones, newMilestone];
        const updated = { 
          ...p, 
          milestones: updatedMilestones,
          updatedAt: new Date().toISOString()
        };
        updated.progress = calculateProgress(updatedMilestones);
        updated.status = getAutoStatus(updated);
        updated.healthScore = calculateHealthScore(updated);

        const newLog = {
          id: crypto.randomUUID(),
          action: 'Jalon ajouté',
          details: `Ajout de "${milestoneData.name}"`,
          timestamp: new Date().toISOString()
        };
        updated.logs = [newLog, ...(updated.logs || [])];

        return updated;
      }
      return p;
    }));
  };

  const updateMilestone = (projectId, milestoneId, updates) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        let actionLabel = 'Jalon modifié';
        const milestone = p.milestones.find(m => m.id === milestoneId);
        
        if (updates.status) {
          actionLabel = updates.status === 'done' ? 'Jalon Validé' : 
                        updates.status === 'in_progress' ? 'Jalon Démarré' : 'Jalon Réinitialisé';
        }

        const updatedMilestones = p.milestones.map(m => 
          m.id === milestoneId ? { ...m, ...updates } : m
        );
        const updated = { 
          ...p, 
          milestones: updatedMilestones,
          updatedAt: new Date().toISOString()
        };
        updated.progress = calculateProgress(updatedMilestones);
        updated.status = getAutoStatus(updated);
        updated.healthScore = calculateHealthScore(updated);

        const newLog = {
          id: crypto.randomUUID(),
          action: actionLabel,
          details: `Jalon: ${milestone?.name || ''}`,
          timestamp: new Date().toISOString()
        };
        updated.logs = [newLog, ...(updated.logs || [])];

        return updated;
      }
      return p;
    }));
  };

  const deleteMilestone = (projectId, milestoneId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const milestone = p.milestones.find(m => m.id === milestoneId);
        const updatedMilestones = p.milestones.filter(m => m.id !== milestoneId);
        const updated = { 
          ...p, 
          milestones: updatedMilestones,
          updatedAt: new Date().toISOString()
        };
        updated.progress = calculateProgress(updatedMilestones);
        updated.status = getAutoStatus(updated);
        updated.healthScore = calculateHealthScore(updated);

        const newLog = {
          id: crypto.randomUUID(),
          action: 'Jalon supprimé',
          details: `Suppression de "${milestone?.name || ''}"`,
          timestamp: new Date().toISOString()
        };
        updated.logs = [newLog, ...(updated.logs || [])];

        return updated;
      }
      return p;
    }));
  };

  const recordIteration = (projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updated = { 
          ...p, 
          iterations: (p.iterations || 0) + 1,
          updatedAt: new Date().toISOString() 
        };
        updated.healthScore = calculateHealthScore(updated);
        
        const newLog = {
          id: crypto.randomUUID(),
          action: 'Itération Client',
          details: `Nouvelle itération enregistrée (Total: ${updated.iterations})`,
          timestamp: new Date().toISOString()
        };
        updated.logs = [newLog, ...(updated.logs || [])];

        return updated;
      }
      return p;
    }));
  };

  const addLog = (projectId, action, details) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newLog = {
          id: crypto.randomUUID(),
          action,
          details,
          timestamp: new Date().toISOString()
        };
        return {
          ...p,
          logs: [newLog, ...(p.logs || [])],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  return (
    <ProjectContext.Provider value={{
      projects: visibleProjects,
      allProjects: projects,
      addProject,
      updateProject,
      deleteProject,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      recordIteration,
      toggleTimer,
      addFeedback,
      addLog
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
