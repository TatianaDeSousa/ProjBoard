import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useContacts } from '../context/ContactContext';
import { Button, Card, Badge, Input, cn } from '../components/ui';
import { 
  ChevronLeft, Calendar, Clock, CheckCircle2, 
  AlertCircle, Plus, Send, Activity, Trash2, 
  ExternalLink, Share2, Target, BarChart3, 
  Smile, RefreshCcw, User, Link as LinkIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, addMilestone, updateMilestone, deleteMilestone, addFeedback, getShareLink } = useProjects();
  const { teams } = useAuth();
  
  const project = projects.find(p => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project?.name || '');
  const [editedClient, setEditedClient] = useState(project?.client || '');
  const [editedDeadline, setEditedDeadline] = useState(project?.deadline?.split('T')[0] || '');
  
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  
  const [copyStatus, setCopyStatus] = useState('idle'); // idle, loading, success

  if (!project) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-black text-slate-400">Projet introuvable.</h2>
      <Link to="/" className="text-primary font-bold mt-4 block">Retour au dashboard</Link>
    </div>
  );

  const handleSaveProject = () => {
    updateProject(id, {
      name: editedName,
      client: editedClient,
      deadline: editedDeadline ? new Date(editedDeadline).toISOString() : project.deadline
    });
    setIsEditing(false);
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newMilestoneName || !newMilestoneDate) return;
    addMilestone(id, { name: newMilestoneName, dueDate: new Date(newMilestoneDate).toISOString() });
    setNewMilestoneName('');
    setNewMilestoneDate('');
  };

  const syncAndCopyLink = async () => {
    setCopyStatus('loading');
    try {
      const token = await getShareLink(id);
      const shareUrl = `${window.location.origin}/client?token=${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du lien cloud.");
      setCopyStatus('idle');
    }
  };

  // Stats calculate
  const milestones = project.milestones || [];
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in pb-32">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
            <ChevronLeft size={14} />
          </div>
          Tableau de Bord
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 space-y-10 w-full">
           <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                {isEditing ? (
                  <div className="space-y-4 w-full max-w-md">
                    <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="text-3xl font-black h-16" />
                    <Input value={editedClient} onChange={e => setEditedClient(e.target.value)} className="font-bold text-slate-500" />
                    <Input type="date" value={editedDeadline} onChange={e => setEditedDeadline(e.target.value)} className="h-12" />
                    <div className="flex gap-2">
                       <Button onClick={handleSaveProject} className="gradient-primary border-none font-black shadow-lg">Sauvegarder</Button>
                       <Button variant="ghost" onClick={() => setIsEditing(false)} className="font-bold">Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                       <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest h-6 px-3">Dossier en cours</Badge>
                       {project.teamId && <Badge className="bg-indigo-50 text-indigo-500 border-none font-black text-[10px] uppercase tracking-widest h-6 px-3">Équipe</Badge>}
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">{project.name}</h1>
                    <p className="text-xl text-slate-400 font-medium">{project.client}</p>
                  </div>
                )}

                <div className="flex gap-3">
                   <Button 
                     onClick={syncAndCopyLink}
                     disabled={copyStatus === 'loading'}
                     className={cn(
                       "h-14 px-8 font-black rounded-2xl transition-all shadow-xl flex gap-2 border-none",
                       copyStatus === 'success' ? "bg-emerald-500 text-white" : "gradient-primary text-white"
                     )}
                   >
                      {copyStatus === 'loading' ? <RefreshCcw size={20} className="animate-spin" /> : 
                       copyStatus === 'success' ? <><CheckCircle2 size={20} /> Lien Copié !</> : 
                       <><Share2 size={20} /> Partager au Client</>}
                   </Button>
                   <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50" onClick={() => { if(confirm('Supprimer ?')) { deleteProject(id); navigate('/'); } }}><Trash2 size={20} /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-10 border-t border-slate-50">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progression</p>
                    <p className="text-2xl font-black text-slate-900">{progress}%</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deadline</p>
                    <p className="text-2xl font-black text-slate-900">{project.deadline ? format(new Date(project.deadline), 'dd MMM') : '—'}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Santé</p>
                    <p className="text-2xl font-black text-emerald-500">{project.healthScore || 100}%</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</p>
                    <p className="text-2xl font-black text-slate-900">{milestones.length}</p>
                 </div>
              </div>
           </Card>

           <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 ml-4">Planning Opérationnel</h3>
              <div className="grid gap-4">
                 {milestones.map((m, idx) => (
                   <Card key={m.id} className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex items-center justify-between group animate-in slide-in-from-bottom" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="flex items-center gap-6">
                         <button 
                           onClick={() => updateMilestone(id, m.id, { status: m.status === 'done' ? 'todo' : 'done' })}
                           className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                             m.status === 'done' ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-300 hover:bg-slate-100"
                           )}
                         >
                            <CheckCircle2 size={24} />
                         </button>
                         <div>
                            <p className={cn("font-black text-lg", m.status === 'done' && "text-slate-300 line-through")}>{m.name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.dueDate ? format(new Date(m.dueDate), 'dd MMMM', { locale: fr }) : 'Pas de date'}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500" onClick={() => deleteMilestone(id, m.id)}><Trash2 size={18} /></Button>
                   </Card>
                 ))}

                 <Card className="p-8 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem]">
                    <form onSubmit={handleAddMilestone} className="flex flex-col md:flex-row gap-4">
                       <Input placeholder="Titre de l'étape…" value={newMilestoneName} onChange={e => setNewMilestoneName(e.target.value)} className="h-14 font-black border-none shadow-inner" />
                       <Input type="date" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} className="h-14 font-black border-none shadow-inner md:w-48" />
                       <Button type="submit" className="h-14 px-8 gradient-primary border-none shadow-lg font-black rounded-xl">Ajouter</Button>
                    </form>
                 </Card>
              </div>
           </div>
        </div>

        <div className="w-full lg:w-80 space-y-8">
           <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-slate-400 flex items-center gap-2"><Activity size={14} /> Journal de bord</h3>
              <div className="space-y-6">
                 {(project.logs || []).slice(-5).reverse().map((log, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                       <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                       <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{log.action}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{log.details}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 border-none shadow-2xl bg-slate-900 text-white rounded-[2.5rem]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-primary">Notes Stratégiques</h3>
              <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                 "{project.description || "Aucune note pour ce dossier. Prenez le temps d'y ajouter les points clés de la mission."}"
              </p>
              <Button variant="ghost" className="text-primary font-black text-[10px] uppercase tracking-widest p-0 h-auto hover:bg-transparent mt-4" onClick={() => setIsEditing(true)}>Modifier les notes</Button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
