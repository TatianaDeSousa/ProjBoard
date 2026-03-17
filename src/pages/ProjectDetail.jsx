import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useContacts } from '../context/ContactContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, Input, cn } from '../components/ui';
import { ChevronLeft, Plus, Calendar, User, CheckCircle2, Circle, Clock, Trash2, Link as LinkIcon, Share2, Save, Send, UserPlus, Activity, RefreshCcw, AlertCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, addMilestone, updateMilestone, deleteMilestone, recordIteration, toggleTimer, addFeedback } = useProjects();
  const { contacts, addContact } = useContacts();
  const { users, teams, currentUser } = useAuth();
  
  const project = projects.find(p => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project?.name || '');
  const [editedClient, setEditedClient] = useState(project?.client || '');
  const [editedDeadline, setEditedDeadline] = useState(project?.deadline?.split('T')[0] || '');
  
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneAssignee, setNewMilestoneAssignee] = useState('');
  const [newMilestoneAssigneeId, setNewMilestoneAssigneeId] = useState(null);
  
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [teamMemberSuggestions, setTeamMemberSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get project team members
  const projectTeam = teams.find(t => t.id === project?.teamId);
  const teamMembers = projectTeam ? users.filter(u => projectTeam.members.includes(u.id)) : [];

  const [copyStatus, setCopyStatus] = useState('idle'); // idle, success

  const handleSaveProject = () => {
    try {
      const deadlineDate = new Date(editedDeadline);
      if (isNaN(deadlineDate.getTime())) throw new Error("Date invalide");
      
      updateProject(id, {
        name: editedName,
        client: editedClient,
        deadline: deadlineDate.toISOString()
      });
      setIsEditing(false);
    } catch (err) {
      alert("Veuillez entrer une date valide.");
    }
  };

  const handleDeleteProject = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteProject(id);
      navigate('/');
    }
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newMilestoneName || !newMilestoneDate) return;
    
    addMilestone(id, {
      name: newMilestoneName,
      dueDate: new Date(newMilestoneDate).toISOString(),
      assignee: newMilestoneAssignee,
      assigneeId: newMilestoneAssigneeId
    });
    
    setNewMilestoneName('');
    setNewMilestoneDate('');
    setNewMilestoneAssignee('');
    setNewMilestoneAssigneeId(null);
    setShowSuggestions(false);
  };

  const handleAssigneeChange = (value) => {
    setNewMilestoneAssignee(value);
    setNewMilestoneAssigneeId(null);
    
    if (value.trim().length > 0) {
      const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase()) ||
        c.company.toLowerCase().includes(value.toLowerCase())
      );
      setContactSuggestions(filteredContacts);

      const filteredMembers = teamMembers.filter(m => 
        m.name.toLowerCase().includes(value.toLowerCase())
      );
      setTeamMemberSuggestions(filteredMembers);
      
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectContactSuggestion = (contact) => {
    setNewMilestoneAssignee(contact.name);
    setNewMilestoneAssigneeId(null);
    setShowSuggestions(false);
  };

  const selectMemberSuggestion = (member) => {
    setNewMilestoneAssignee(member.name);
    setNewMilestoneAssigneeId(member.id);
    setShowSuggestions(false);
  };

  const handleInviteTask = () => {
    if (!newMilestoneAssignee) return;
    
    const email = prompt(`Entrez l'email pour inviter ${newMilestoneAssignee} sur cette tâche :`);
    if (email) {
      const existing = contacts.find(c => c.name === newMilestoneAssignee || c.email === email);
      if (!existing) {
        addContact({
          name: newMilestoneAssignee,
          company: "Externe (Invité)",
          email: email
        });
      }
      alert(`Invitation envoyée à ${email} pour la tâche "${newMilestoneName || 'Nouvelle tâche'}" !`);
      setShowSuggestions(false);
    }
  };

  const toggleMilestoneStatus = (milestone) => {
    const nextStatus = {
      'todo': 'in_progress',
      'in_progress': 'done',
      'done': 'todo'
    }[milestone.status];
    
    updateMilestone(id, milestone.id, { status: nextStatus });
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${project.shareToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  if (!project) return <div>Projet non trouvé.</div>;

  return (
    <div className="container mx-auto px-4 py-12 animate-in pb-24">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
            <ChevronLeft size={14} />
          </div>
          Tableau de bord
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
        <div className="flex-1 space-y-8 w-full">
          {isEditing ? (
            <Card className="p-10 border-none shadow-2xl bg-white scale-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du projet</label>
                  <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="text-xl font-black h-14" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Client</label>
                  <Input value={editedClient} onChange={e => setEditedClient(e.target.value)} className="text-xl font-black h-14" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline Finale</label>
                  <Input type="date" value={editedDeadline} onChange={e => setEditedDeadline(e.target.value)} className="text-xl font-black h-14" />
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>
                <Button onClick={handleSaveProject} className="gap-2 px-8 gradient-primary border-none shadow-lg shadow-primary/20"><Save size={18} /> Enregistrer les modifications</Button>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge variant={project.status} className="h-6 px-3 glass">
                    {project.status === 'on_track' ? 'En bonne voie' : 
                     project.status === 'at_risk' ? 'À risque' : 
                     project.status === 'delayed' ? 'En retard' : 'Terminé'}
                  </Badge>
                  <div className="flex items-center gap-2 px-4 py-1 bg-white shadow-sm ring-1 ring-black/5 rounded-full">
                    <Activity size={12} className={
                      project.healthScore >= 70 ? "text-emerald-500" : 
                      project.healthScore >= 50 ? "text-orange-500" : "text-red-500"
                    } />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600">Santé {project.healthScore || 100}%</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">ID: #{project.id.slice(0, 8)}</span>
                </div>
                
                <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-2 leading-[0.9]">{project.name}</h1>
                <p className="text-2xl text-slate-400 font-medium tracking-tight mb-8">{project.client}</p>
                
                {project.healthScore < 50 && (
                  <div className="inline-flex items-center gap-3 bg-red-50 text-red-600 px-6 py-3 rounded-[1.25rem] font-black text-sm border border-red-100/50 animate-pulse shadow-lg shadow-red-500/5">
                    <AlertCircle size={20} /> ALERTE CRITIQUE : BESOIN D'ACTION IMMÉDIATE
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 shrink-0 pt-2 lg:pt-10">
                <div className="flex bg-slate-100/50 p-1.5 rounded-2xl ring-1 ring-slate-200">
                  <button onClick={() => addFeedback(project.id, 'good')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-emerald-500" title="Client Satisfait"><CheckCircle2 size={18} /></button>
                  <button onClick={() => addFeedback(project.id, 'medium')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-orange-500" title="Client Mitigé"><Clock size={18} /></button>
                  <button onClick={() => addFeedback(project.id, 'difficult')} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-red-500" title="Client Difficile"><AlertCircle size={18} /></button>
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2 h-12 px-6 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-black shadow-sm"
                  onClick={() => {
                    recordIteration(project.id);
                  }}
                >
                  <RefreshCcw size={18} /> Itération ({project.iterations || 0})
                </Button>
                <Button variant="outline" className="h-12 border-slate-200 text-slate-600 font-black shadow-sm" onClick={() => setIsEditing(true)}>Modifier</Button>
                <Button 
                  variant={copyStatus === 'success' ? "secondary" : "primary"} 
                  className={cn(
                    "gap-2 h-12 px-8 transition-all shadow-xl font-black border-none",
                    copyStatus === 'success' ? "bg-emerald-500 text-white" : "gradient-primary"
                  )}
                  onClick={copyShareLink}
                >
                  {copyStatus === 'success' ? (
                    <><CheckCircle2 size={18} /> Lien Copié !</>
                  ) : (
                    <><Share2 size={18} /> Lien Client</>
                  )}
                </Button>
                <Button variant="destructive" size="icon" className="h-12 w-12 rounded-2xl shadow-lg shadow-red-500/10" onClick={handleDeleteProject}>
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Progression globale de la mission</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">{project.progress}%</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 ring-1 ring-slate-200/50 shadow-inner">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary/20"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-8 animate-in slide-in-from-right-8 duration-700">
          <Card className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white border-none shadow-2xl shadow-indigo-500/5 ring-1 ring-black/5 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary/20" />
            <div className="w-16 h-16 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Calendar size={32} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Deadline Contractuelle</p>
              <p className="text-2xl font-black text-slate-800 tracking-tighter">{format(new Date(project.deadline), 'dd MMMM yyyy', { locale: fr })}</p>
            </div>
          </Card>

          <Card className="p-8 space-y-8 bg-white/80 glass border-none rounded-[2.5rem]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
              <Users size={14} className="text-primary" /> Architecture Équipe
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100 border border-white">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                  {project.ownerName ? project.ownerName.charAt(0) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate tracking-tight">{project.ownerName || 'Propriétaire'}</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">Lead Manager</p>
                </div>
              </div>

              {project.teamId ? (
                <div className="pt-6 space-y-6 border-t border-slate-100/50">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Agence: {project.teamName || 'Groupe'}</p>
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] px-2 h-4">{teamMembers.length} membres</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(member => (
                       <div key={member.id} className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center text-slate-400 font-black text-xs hover:ring-primary/30 transition-all cursor-default" title={member.name}>
                         {member.name.charAt(0)}
                       </div>
                    ))}
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-primary/30 hover:text-primary transition-all cursor-pointer">
                      <Plus size={16} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-6 border-t border-slate-100/50">
                  <p className="text-xs text-slate-500 italic font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl ring-1 ring-slate-100/50">
                    Mission individuelle. Aucun collaborateur assigné pour le moment.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Jalons Stratégiques</h2>
            <Badge className="bg-slate-100 text-slate-500 border-none font-black">{project.milestones.length} ÉTAPE(S)</Badge>
          </div>
 
          <div className="grid gap-6">
            {project.milestones.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-medium scale-in">
                Aucune étape définie. Commencez par en ajouter une.
              </div>
            ) : (
              project.milestones.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map((milestone, idx) => (
                <Card key={milestone.id} className="p-6 flex items-center gap-6 group hover:shadow-2xl hover:shadow-primary/5 transition-all bg-white border-none scale-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <button 
                    onClick={() => toggleMilestoneStatus(milestone)}
                    className="shrink-0 transition-transform active:scale-75 duration-300"
                  >
                    {milestone.status === 'done' ? (
                      <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                         <CheckCircle2 size={24} />
                      </div>
                    ) : milestone.status === 'in_progress' ? (
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                         <Clock size={24} className="animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-primary/30 group-hover:text-primary transition-all">
                         <Circle size={24} />
                      </div>
                    )}
                  </button>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <h4 className={cn(
                        "font-black text-lg tracking-tight transition-all",
                        milestone.status === 'done' ? "line-through text-slate-300" : "text-slate-800"
                      )}>
                        {milestone.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                         <Badge variant="outline" className="text-[8px] h-4 border-slate-100 bg-slate-50 text-slate-400">
                            {milestone.status === 'done' ? 'Terminé' : milestone.status === 'in_progress' ? 'En cours' : 'À faire'}
                         </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest">
                      <Calendar size={14} className="text-primary/40" />
                      {format(new Date(milestone.dueDate), 'dd MMM yyyy', { locale: fr })}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-black text-slate-900 tracking-tight bg-slate-50/50 p-2 rounded-xl ring-1 ring-black/5 w-fit">
                      <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] text-primary">
                        {milestone.assignee ? milestone.assignee.charAt(0) : '?'}
                      </div>
                      {milestone.assignee || 'Non assigné'}
                    </div>
                  </div>
 
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500 rounded-xl"
                    onClick={() => deleteMilestone(project.id, milestone.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </Card>
              ))
            )}
          </div>
 
          <Card className="p-10 border-none bg-indigo-50/30 scale-in [animation-delay:300ms]">
            <h3 className="text-xl font-black text-slate-900 mb-8">Ajouter une étape</h3>
            <form onSubmit={handleAddMilestone} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Intitulé de la tâche</label>
                  <Input 
                    placeholder="Ex: Validation Design, Prototype..." 
                    value={newMilestoneName}
                    onChange={e => setNewMilestoneName(e.target.value)}
                    required
                    className="h-14 font-black text-lg shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Échéance</label>
                  <Input 
                    type="date" 
                    value={newMilestoneDate}
                    onChange={e => setNewMilestoneDate(e.target.value)}
                    required
                    className="h-14 font-black shadow-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Responsable</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="Tapez un nom ou choisissez un membre..." 
                      value={newMilestoneAssignee}
                      onChange={e => handleAssigneeChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      className="h-14 font-black shadow-sm"
                    />
                    
                    {showSuggestions && (
                      <Card className="absolute bottom-full mb-4 left-0 w-full z-50 shadow-2xl border-none ring-1 ring-black/5 p-2 max-h-[400px] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-6 p-2">
                          {teamMemberSuggestions.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 px-2">Membres de l'Agence</p>
                              <div className="space-y-1">
                                {teamMemberSuggestions.map(member => (
                                  <button
                                    key={member.id}
                                    type="button"
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 rounded-2xl transition-all flex items-center justify-between group/item"
                                    onClick={() => selectMemberSuggestion(member)}
                                  >
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                         {member.name.charAt(0)}
                                       </div>
                                       <span className="font-extrabold text-slate-700">{member.name} {member.id === currentUser?.id && "(Vous)"}</span>
                                    </div>
                                    <Users size={14} className="text-slate-300 group-hover/item:text-primary transition-colors" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
 
                          {contactSuggestions.length > 0 && (
                            <div className="pt-2">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Contacts Internes/Externes</p>
                              <div className="space-y-1">
                                {contactSuggestions.map(contact => (
                                  <button
                                    key={contact.id}
                                    type="button"
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 rounded-2xl transition-all flex items-center justify-between group/item"
                                    onClick={() => selectContactSuggestion(contact)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-slate-700">{contact.name}</span>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{contact.company}</span>
                                    </div>
                                    <User size={14} className="text-slate-300 group-hover/item:text-primary transition-colors" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
 
                          {teamMemberSuggestions.length === 0 && contactSuggestions.length === 0 && (
                            <div className="px-4 py-8 text-center bg-slate-50 rounded-2xl">
                              <p className="text-xs text-slate-400 italic font-medium">Aucun profil correspondant à votre recherche.</p>
                            </div>
                          )}
                          
                          <div className="border-t border-slate-100 pt-2">
                            <button
                              type="button"
                              className="w-full text-left px-4 py-4 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-2xl flex items-center gap-3 transition-colors"
                              onClick={handleInviteTask}
                            >
                              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <UserPlus size={16} />
                              </div>
                              Créer et inviter un collaborateur externe
                            </button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                  <Button type="submit" className="h-14 gap-2 font-black px-10 gradient-primary border-none shadow-[0_10px_20px_rgba(99,102,241,0.2)] hover:scale-[1.02]">
                    <Plus size={24} /> Ajouter à la Board
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
 
        <div className="space-y-8">
          <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
            <Clock size={24} className="text-primary" /> Journal de Bord
          </h2>
          <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-indigo-500/5 ring-1 ring-black/5 bg-white rounded-[2.5rem]">
            <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
              {project.logs && project.logs.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {project.logs.map((log) => (
                    <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black underline underline-offset-4 decoration-primary/30 uppercase text-primary tracking-[0.2em]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">
                          {format(new Date(log.timestamp), 'HH:mm • dd MMM')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">{log.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center text-slate-300 italic text-sm font-medium">
                  Le journal est vide.
                </div>
              )}
            </div>
          </Card>
          <div className="p-8 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Activity size={40} className="text-indigo-600" />
            </div>
            <p className="text-xs text-indigo-600/70 font-bold italic leading-relaxed relative z-10">
              "Ce journal horodaté garantit l'intégrité de vos échanges. Il est un allié précieux pour valoriser votre réactivité auprès du client."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
