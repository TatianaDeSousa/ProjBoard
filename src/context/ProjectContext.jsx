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
      logs: [{ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Dossier Créé', details: `Dossier ${projectData.name} initialisé` }],
      updatedAt: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects(projects.map(p => p.id === projectId ? { 
      ...p, 
      ...updates, 
      updatedAt: new Date().toISOString(),
      // Ajout auto d'un log si on change le statut
      logs: updates.status && updates.status !== p.status ? [
        ...p.logs, 
        { id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Statut Changé', details: `Passage vers ${updates.status}` }
      ] : p.logs
    } : p));
  };

  const deleteProject = (projectId) => setProjects(projects.filter(p => p.id !== projectId));

  const addMilestone = (projectId, milestone) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newM = { id: crypto.randomUUID(), status: 'todo', ...milestone };
        return { 
          ...p, 
          milestones: [...(p.milestones || []), newM],
          logs: [...(p.logs || []), { id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Nouvelle Étape', details: `Ajout : ${milestone.name}` }]
        };
      }
      return p;
    }));
  };

  const updateMilestone = (projectId, milestoneId, updates) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const milestone = p.milestones.find(m => m.id === milestoneId);
        const newMs = (p.milestones || []).map(m => m.id === milestoneId ? { ...m, ...updates } : m);
        
        // CORRECTION HISTORIQUE (NOM AU LIEU DE ID)
        let logAction = p.logs;
        if (updates.status === 'done') {
           logAction = [...p.logs, { id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Étape Validée', details: `Jalon terminé : ${milestone?.name || 'Inconnu'}` }];
        }
        
        return { ...p, milestones: newMs, logs: logAction, updatedAt: new Date().toISOString() };
      }
      return p;
    }));
  };

  const deleteMilestone = (projectId, milestoneId) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, milestones: (p.milestones || []).filter(m => m.id !== milestoneId) } : p));
  };

  // 🚀 PARTAGE V4 REFORCÉ (avec project_id TEXT)
  const getShareLink = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    try {
      console.log('[SUPABASE V4] Sync en cours...');
      const { data: existing, error: selectError } = await supabase
        .from('client_links')
        .select('token')
        .eq('project_id', projectId)
        .maybeSingle();
      
      if (selectError) throw selectError;

      if (existing) {
        const { error: upError } = await supabase
          .from('client_links')
          .update({ project_data: project })
          .eq('token', existing.token);
        if (upError) throw upError;
        return existing.token;
      } else {
        const { data, error: insError } = await supabase
          .from('client_links')
          .insert([{ project_id: projectId, project_data: project }])
          .select()
          .single();
        if (insError) throw insError;
        return data.token;
      }
    } catch (err) {
      console.error('[ERREUR FATALE] Sync Cloud Impossible :', err);
      // Tentative de diagnostic pour l'utilisateur
      if (err.message?.includes('not found')) alert("La table client_links n'existe pas. Veuillez exécuter le SQL v4.");
      if (err.message?.includes('policy')) alert("Accès refusé par Supabase. RLS à corriger via SQL v4.");
      throw err;
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
