import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { differenceInDays, isValid } from 'date-fns';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

// CALCULATE HEALTH SCORE - SÉCURISÉ v2.9.3
export const calculateHealthScore = (project) => {
  if (!project) return 0;
  let pointsDeadline = 50; 
  let pointsUpdate = 0;
  let pointsFeedback = 0;

  // 1. Deadline (0.5)
  if (project.deadline) {
    const d = new Date(project.deadline);
    if (isValid(d)) {
      const daysLeft = differenceInDays(d, new Date());
      if (daysLeft > 7) pointsDeadline = 50;
      else if (daysLeft >= 3) pointsDeadline = 30;
      else if (daysLeft >= 0) pointsDeadline = 10;
      else pointsDeadline = 0;
    }
  }

  // 2. Mise à jour (0.3)
  const lastUpdate = project.updatedAt ? new Date(project.updatedAt) : new Date();
  if (isValid(lastUpdate)) {
    const daysSinceUpdate = differenceInDays(new Date(), lastUpdate);
    if (daysSinceUpdate < 2) pointsUpdate = 30;
    else if (daysSinceUpdate < 5) pointsUpdate = 15;
    else pointsUpdate = 0;
  }

  // 3. Retours (0.2)
  const loops = project.feedbackLoops || 0;
  if (loops <= 1) pointsFeedback = 20;
  else if (loops <= 3) pointsFeedback = 10;
  else pointsFeedback = 0;

  return Math.max(0, Math.min(100, Math.round((pointsDeadline * 0.5) + (pointsUpdate * 0.3) + (pointsFeedback * 0.2))));
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pb_projects')) || [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem('pb_projects', JSON.stringify(projects));
  }, [projects]);

  const createProject = (projectData) => {
    const newProject = {
      id: crypto.randomUUID(),
      name: projectData.name,
      client: projectData.client || 'Client Privé',
      description: projectData.description || '',
      status: 'on_track',
      progress: 0,
      feedbackLoops: 0,
      healthScore: 100,
      deadline: projectData.deadline || null,
      folderId: projectData.folderId || null,
      milestones: [],
      logs: [{ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Projet Créé', details: `Bienvenue sur ProjBoard !` }],
      updatedAt: new Date().toISOString(),
    };
    newProject.healthScore = calculateHealthScore(newProject);
    setProjects([newProject, ...projects]);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        updated.healthScore = calculateHealthScore(updated);
        return updated;
      }
      return p;
    }));
  };

  const deleteProject = (projectId) => setProjects(projects.filter(p => p.id !== projectId));

  const addMilestone = (projectId, milestone) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newM = { id: crypto.randomUUID(), status: 'todo', ...milestone };
        const updated = { 
          ...p, 
          milestones: [...(p.milestones || []), newM],
          logs: [...(p.logs || []), { id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Nouveau Jalon', details: `Ajout : ${milestone.name}` }],
          updatedAt: new Date().toISOString()
        };
        updated.healthScore = calculateHealthScore(updated);
        return updated;
      }
      return p;
    }));
  };

  const updateMilestone = (projectId, milestoneId, updates) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newMs = (p.milestones || []).map(m => m.id === milestoneId ? { ...m, ...updates } : m);
        const updated = { ...p, milestones: newMs, updatedAt: new Date().toISOString() };
        updated.healthScore = calculateHealthScore(updated);
        return updated;
      }
      return p;
    }));
  };

  const deleteMilestone = (projectId, milestoneId) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, milestones: (p.milestones || []).filter(m => m.id !== milestoneId) } : p));
  };

  const getShareLink = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    try {
      const { data: existing, error: selectError } = await supabase.from('client_links').select('token').eq('project_id', projectId).maybeSingle();
      if (selectError) throw selectError;
      if (existing) {
        await supabase.from('client_links').update({ project_data: project }).eq('token', existing.token);
        return existing.token;
      } else {
        const { data, error: insError } = await supabase.from('client_links').insert([{ project_id: projectId, project_data: project }]).select().single();
        if (insError) throw insError;
        return data.token;
      }
    } catch (err) { throw err; }
  };

  return (
    <ProjectContext.Provider value={{
      projects, createProject, updateProject, deleteProject,
      addMilestone, updateMilestone, deleteMilestone, getShareLink
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
