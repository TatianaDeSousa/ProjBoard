import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const { currentUser, teams, addNotification } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [currentUser, teams]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        milestones (*),
        project_logs (*),
        project_feedback (*)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      // Format data to match local structure if needed
      const formatted = data.map(p => ({
        ...p,
        logs: p.project_logs || [],
        feedback: p.project_feedback || []
      }));
      setProjects(formatted);
    }
    setLoading(false);
  };

  const createProject = async (projectData) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        owner_id: currentUser.id,
        name: projectData.name,
        client: projectData.client,
        type: projectData.type,
        status: 'on_track',
        deadline: projectData.deadline,
        team_id: projectData.teamId || null
      }])
      .select()
      .single();

    if (data) {
      if (projectData.milestones) {
        const milestones = projectData.milestones.map(m => ({
          project_id: data.id,
          name: m.name,
          due_date: m.dueDate,
          status: 'todo'
        }));
        await supabase.from('milestones').insert(milestones);
      }
      
      await logAction(data.id, 'Projet Créé', `Initialisation de ${data.name}`);
      fetchProjects();
    }
    return data;
  };

  const updateProject = async (projectId, updates) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (data) {
      if (updates.status) {
        await logAction(projectId, `Statut: ${updates.status}`, `Mise à jour du statut général`);
        
        // Notify team
        const project = projects.find(p => p.id === projectId);
        if (project.team_id) {
          const team = teams.find(t => t.id === project.team_id);
          team?.team_members?.forEach(m => {
            if (m.user_id !== currentUser.id) {
              addNotification(m.user_id, {
                type: 'status_change',
                projectId,
                message: `Le projet "${project.name}" est passé en ${updates.status}`
              });
            }
          });
        }
      }
      fetchProjects();
    }
  };

  const deleteProject = async (projectId) => {
    await supabase.from('projects').delete().eq('id', projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addMilestone = async (projectId, milestoneData) => {
    const { data } = await supabase
      .from('milestones')
      .insert([{
        project_id: projectId,
        name: milestoneData.name,
        due_date: milestoneData.dueDate,
        status: 'todo',
        assignee_id: milestoneData.assigneeId || null
      }])
      .select()
      .single();

    if (data) {
      await logAction(projectId, 'Jalon ajouté', `Nouveau jalon: ${milestoneData.name}`);
      fetchProjects();
    }
  };

  const updateMilestone = async (projectId, milestoneId, updates) => {
    const { data } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId);

    if (updates.status) {
      await logAction(projectId, 'Jalon mis à jour', `Le jalon ${milestoneId} est passé en ${updates.status}`);
    }
    fetchProjects();
  };

  const deleteMilestone = async (projectId, milestoneId) => {
    await supabase.from('milestones').delete().eq('id', milestoneId);
    fetchProjects();
  };

  const addFeedback = async (projectId, value) => {
    const { data } = await supabase
      .from('project_feedback')
      .insert([{ project_id: projectId, value }])
      .select()
      .single();

    if (data) {
      await logAction(projectId, 'Humeur Client', `Nouveau feedback client: ${value}`);
      fetchProjects();
    }
  };

  const logAction = async (projectId, action, details) => {
    await supabase
      .from('project_logs')
      .insert([{ project_id: projectId, action, details }]);
  };

  return (
    <ProjectContext.Provider value={{
      projects: projects || [],
      loading,
      createProject,
      updateProject,
      deleteProject,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addFeedback
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
