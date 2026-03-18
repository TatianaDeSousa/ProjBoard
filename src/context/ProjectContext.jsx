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
      logs: [{ id: crypto.randomUUID(), date: new Date().toISOString(), action: 'Dossier Créé', details: 'Initialisation système' }],
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
        return { ...p, milestones: [...(p.milestones || []), newM] };
      }
      return p;
    }));
  };

  const updateMilestone = (projectId, milestoneId, updates) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newMs = (p.milestones || []).map(m => m.id === milestoneId ? { ...m, ...updates } : m);
        return { ...p, milestones: newMs };
      }
      return p;
    }));
  };

  const deleteMilestone = (projectId, milestoneId) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, milestones: (p.milestones || []).filter(m => m.id !== milestoneId) } : p));
  };

  // 🚀 NOUVELLE LOGIQUE DE PARTAGE (V3 ROBUSTE)
  const getShareLink = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    try {
      console.log('[Sync Cloud] Recherche du lien pour :', projectId);
      // On cherche par la nouvelle colonne project_id
      const { data: existing, error: selectError } = await supabase
        .from('client_links')
        .select('token')
        .eq('project_id', projectId)
        .maybeSingle();
      
      if (selectError) throw selectError;

      if (existing) {
        console.log('[Sync Cloud] Mise à jour du lien existant :', existing.token);
        const { error: upError } = await supabase
          .from('client_links')
          .update({ project_data: project })
          .eq('token', existing.token);
        if (upError) throw upError;
        return existing.token;
      } else {
        console.log('[Sync Cloud] Premier partage, création du lien...');
        const { data, error: insError } = await supabase
          .from('client_links')
          .insert([{ project_id: projectId, project_data: project }])
          .select()
          .single();
        if (insError) throw insError;
        return data.token;
      }
    } catch (err) {
      console.error('[CRITIQUE] Échec Synchronisation Supabase :', err);
      // On log l'erreur pour que l'utilisateur puisse la voir dans sa console Vercel/Locale
      alert("Erreur de synchronisation cloud. Vérifiez que vous avez bien exécuté le SQL v3 dans Supabase.");
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
