import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('pb_projects')) || []);
  const { currentUser, addNotification } = useAuth();

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
      healthScore: 100,
      deadline: projectData.deadline || null,
      teamId: projectData.teamId || null,
      milestones: [],
      logs: [{ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Projet Créé', details: 'Initialisation du dossier' }],
      feedback: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        // Log status change
        if (updates.status) {
          updated.logs.push({ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Statut mis à jour', details: `Nouveau statut : ${updates.status}` });
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const addMilestone = (projectId, milestone) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newMilestone = { id: crypto.randomUUID(), status: 'todo', ...milestone };
        const updated = { ...p, milestones: [...p.milestones, newMilestone] };
        updated.logs.push({ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Jalon ajouté', details: `Nouveau jalon : "${milestone.name}"` });
        return updated;
      }
      return p;
    }));
  };

  const updateMilestone = (projectId, milestoneId, updates) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedMilestones = p.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m);
        const updated = { ...p, milestones: updatedMilestones };
        if (updates.status) {
           updated.logs.push({ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Jalon mis à jour', details: `Statut modifié pour "${milestoneId}"` });
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteMilestone = (projectId, milestoneId) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, milestones: p.milestones.filter(m => m.id !== milestoneId) } : p));
  };

  const addFeedback = (projectId, value) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newFeedback = { id: crypto.randomUUID(), date: new Date().toISOString(), value };
        const updated = { ...p, feedback: [...p.feedback, newFeedback] };
        updated.logs.push({ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Humeur Client', details: `Nouveau feedback : ${value}` });
        return updated;
      }
      return p;
    }));
  };

  // NOUVELLE FONCTION : GÉNÉRER UN LIEN RÉEL VIA SUPABASE
  const getShareLink = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    // On synchronise vers Supabase
    const { data: existing } = await supabase.from('client_links').select('token').eq('project_data->>id', projectId).single();
    
    if (existing) {
      // Mise à jour de la version cloud
      await supabase.from('client_links').update({ project_data: project }).eq('token', existing.token);
      return existing.token;
    } else {
      // Premier partage
      const { data, error } = await supabase.from('client_links').insert([{ project_data: project }]).select().single();
      if (error) throw error;
      return data.token;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects, createProject, updateProject, deleteProject,
      addMilestone, updateMilestone, deleteMilestone, addFeedback,
      getShareLink
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
