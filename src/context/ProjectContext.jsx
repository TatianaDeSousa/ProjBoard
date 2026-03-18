import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('pb_projects')) || []);

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
      folderId: projectData.folderId || null,
      milestones: [],
      logs: [{ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Projet Créé', details: `Bienvenue sur ProjBoard !` }],
      updatedAt: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  };

  const deleteProject = (projectId) => setProjects(projects.filter(p => p.id !== projectId));

  const addMilestone = (projectId, milestone) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newM = { id: crypto.randomUUID(), status: 'todo', ...milestone };
        return { 
          ...p, 
          milestones: [...(p.milestones || []), newM],
          logs: [...(p.logs || []), { id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Nouveau Jalon', details: `Ajout : ${milestone.name}` }]
        };
      }
      return p;
    }));
  };

  const updateMilestone = (projectId, milestoneId, updates) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const milestone = (p.milestones || []).find(m => m.id === milestoneId);
        const newMs = (p.milestones || []).map(m => m.id === milestoneId ? { ...m, ...updates } : m);
        
        let details = "";
        if (updates.status === 'doing') details = `Lancement de : ${milestone?.name || 'Inconnu'}`;
        if (updates.status === 'done') details = `Validation de : ${milestone?.name || 'Inconnu'}`;
        if (updates.status === 'todo') details = `Remise à zéro : ${milestone?.name || 'Inconnu'}`;

        const newLog = { id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Mise à jour Jalon', details };
        
        return { 
          ...p, 
          milestones: newMs, 
          logs: [...(p.logs || []), newLog],
          updatedAt: new Date().toISOString()
        };
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
      const { data: existing, error: selectError } = await supabase
        .from('client_links')
        .select('token')
        .eq('project_id', projectId)
        .maybeSingle();
      
      if (selectError) throw selectError;

      if (existing) {
        await supabase.from('client_links').update({ project_data: project }).eq('token', existing.token);
        return existing.token;
      } else {
        const { data, error: insError } = await supabase
          .from('client_links').insert([{ project_id: projectId, project_data: project }]).select().single();
        if (insError) throw insError;
        return data.token;
      }
    } catch (err) {
      console.error('[CLOUD ERROR]', err);
      // On retourne une erreur explicite pour que le bouton puisse l'afficher
      throw new Error("L'accès à Supabase a échoué. Avez-vous exécuté le SQL v4 ?");
    }
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
