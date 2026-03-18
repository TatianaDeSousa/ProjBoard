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
  }, [currentUser]);

  const fetchProjects = async () => {
    console.log('[ProjectContext] fetchProjects called');
    setLoading(true);

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        milestones (*),
        project_logs (*),
        project_feedback (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProjectContext] fetchProjects error:', error);
      setLoading(false);
      return;
    }

    if (data) {
      console.log('[ProjectContext] fetched', data.length, 'projects');
      const formatted = data.map(p => ({
        ...p,
        milestones: p.milestones || [],
        logs: p.project_logs || [],
        feedback: p.project_feedback || [],
        // Compatibility shims for old field names used in UI
        teamId: p.team_id,
        shareToken: p.share_token,
        healthScore: p.health_score || 100,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
      setProjects(formatted);
    }
    setLoading(false);
  };

  const createProject = async (projectData) => {
    if (!currentUser) return null;
    console.log('[ProjectContext] createProject:', projectData);

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        owner_id: currentUser.id,
        name: projectData.name,
        client: projectData.client || '',
        type: projectData.type || null,
        status: 'on_track',
        progress: 0,
        health_score: 100,
        deadline: projectData.deadline || null,
        team_id: projectData.teamId || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('[ProjectContext] createProject error:', error);
      throw new Error(error.message);
    }

    if (data) {
      if (projectData.milestones && projectData.milestones.length > 0) {
        const milestones = projectData.milestones.map(m => ({
          project_id: data.id,
          name: m.name,
          due_date: m.dueDate || null,
          status: 'todo',
        }));
        const { error: mError } = await supabase.from('milestones').insert(milestones);
        if (mError) console.error('[ProjectContext] milestones insert error:', mError);
      }

      await logAction(data.id, 'Projet Créé', `Initialisation de "${data.name}"`);
      await fetchProjects();
    }

    return data;
  };

  const updateProject = async (projectId, updates) => {
    console.log('[ProjectContext] updateProject:', projectId, updates);

    // Remap UI field names to DB field names
    const dbUpdates = { ...updates };
    if ('teamId' in updates) { dbUpdates.team_id = updates.teamId; delete dbUpdates.teamId; }
    if ('shareToken' in updates) { dbUpdates.share_token = updates.shareToken; delete dbUpdates.shareToken; }
    if ('healthScore' in updates) { dbUpdates.health_score = updates.healthScore; delete dbUpdates.healthScore; }

    const { error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', projectId);

    if (error) {
      console.error('[ProjectContext] updateProject error:', error);
      throw new Error(error.message);
    }

    if (updates.status) {
      await logAction(projectId, `Statut mis à jour`, `Nouveau statut : ${updates.status}`);

      // Notify team members
      const project = projects.find(p => p.id === projectId);
      if (project?.team_id) {
        const team = teams.find(t => t.id === project.team_id);
        (team?.team_members || []).forEach(m => {
          if (m.user_id !== currentUser.id) {
            addNotification(m.user_id, {
              type: 'status_change',
              project_id: projectId,
              message: `Le projet "${project.name}" est passé en ${updates.status}`
            }).catch(console.error);
          }
        });
      }
    }

    await fetchProjects();
  };

  const deleteProject = async (projectId) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) { console.error('[ProjectContext] deleteProject error:', error); throw new Error(error.message); }
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addMilestone = async (projectId, milestoneData) => {
    console.log('[ProjectContext] addMilestone:', projectId, milestoneData);

    const { data, error } = await supabase
      .from('milestones')
      .insert([{
        project_id: projectId,
        name: milestoneData.name,
        due_date: milestoneData.dueDate || milestoneData.due_date || null,
        status: 'todo',
        assignee_id: milestoneData.assignee_id || milestoneData.assigneeId || null,
        assignee_name: milestoneData.assignee || null,
      }])
      .select()
      .single();

    if (error) { console.error('[ProjectContext] addMilestone error:', error); throw new Error(error.message); }

    await logAction(projectId, 'Jalon ajouté', `Nouveau jalon : "${milestoneData.name}"`);
    await fetchProjects();
    return data;
  };

  const updateMilestone = async (projectId, milestoneId, updates) => {
    const dbUpdates = { ...updates };
    if ('dueDate' in updates) { dbUpdates.due_date = updates.dueDate; delete dbUpdates.dueDate; }

    const { error } = await supabase
      .from('milestones')
      .update(dbUpdates)
      .eq('id', milestoneId);

    if (error) { console.error('[ProjectContext] updateMilestone error:', error); throw new Error(error.message); }

    if (updates.status) {
      await logAction(projectId, 'Jalon mis à jour', `Statut : ${updates.status}`);
    }
    await fetchProjects();
  };

  const deleteMilestone = async (projectId, milestoneId) => {
    const { error } = await supabase.from('milestones').delete().eq('id', milestoneId);
    if (error) { console.error('[ProjectContext] deleteMilestone error:', error); throw new Error(error.message); }
    await fetchProjects();
  };

  const addFeedback = async (projectId, value) => {
    const { error } = await supabase
      .from('project_feedback')
      .insert([{ project_id: projectId, value }]);

    if (error) { console.error('[ProjectContext] addFeedback error:', error); return; }
    await logAction(projectId, 'Humeur Client', `Feedback : ${value}`);
    await fetchProjects();
  };

  const logAction = async (projectId, action, details) => {
    const { error } = await supabase
      .from('project_logs')
      .insert([{ project_id: projectId, action, details }]);
    if (error) console.error('[ProjectContext] logAction error:', error);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      createProject,
      updateProject,
      deleteProject,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addFeedback,
      refetch: fetchProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
