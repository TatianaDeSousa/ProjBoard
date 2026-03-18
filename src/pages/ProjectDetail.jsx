import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, Input, cn } from '../components/ui';
import { 
  ChevronLeft, Calendar, Clock, CheckCircle2, 
  Plus, Activity, Trash2, Share2, RefreshCcw, StickyNote, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, addMilestone, updateMilestone, deleteMilestone, getShareLink } = useProjects();
  
  const project = projects.find(p => p.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project?.name || '');
  const [editedClient, setEditedClient] = useState(project?.client || '');
  const [editedDeadline, setEditedDeadline] = useState(project?.deadline?.split('T')[0] || '');
  const [notes, setNotes] = useState(project?.description || '');
  
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [copyStatus, setCopyStatus] = useState('idle'); // idle, loading, success

  // Auto-save notes
  useEffect(() => {
    if (project && notes !== project.description) {
      const timeout = setTimeout(() => {
        updateProject(id, { description: notes });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [notes, id, project, updateProject]);

  if (!project) return <div className="p-20 text-center font-black text-slate-400">Dossier introuvable...</div>;

  const handleSaveProject = () => {
    updateProject(id, {
      name: editedName,
      client: editedClient,
      deadline: editedDeadline ? new Date(editedDeadline).toISOString() : project.deadline
    });
    setIsEditing(false);
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
      setCopyStatus('idle');
    }
  };

  const milestones = project.milestones || [];
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in pb-40">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* COLONNE GAUCHE (PROJET) */}
        <div className="flex-1 space-y-8 w-full">
           <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                {isEditing ? (
                  <div className="space-y-4 w-full max-w-md">
                    <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="text-3xl font-black h-16 shadow-inner" />
                    <Input value={editedClient} onChange={e => setEditedClient(e.target.value)} className="font-bold text-slate-500 shadow-inner" />
                    <Input type="date" value={editedDeadline} onChange={e => setEditedDeadline(e.target.value)} className="h-12 shadow-inner" />
                    <div className="flex gap-2">
                       <Button onClick={handleSaveProject} className="gradient-primary border-none font-black shadow-lg rounded-xl">Sauvegarder</Button>
                       <Button variant="ghost" onClick={() => setIsEditing(false)} className="font-bold">Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                       <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-widest h-6 px-3 shadow-lg shadow-primary/20">Dossier Actif</Badge>
                       {project.folderId && <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest h-6 px-3">Classé</Badge>}
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">{project.name}</h1>
                    <p className="text-xl text-slate-400 font-black italic tracking-tight">{project.client}</p>
                  </div>
                )}

                <div className="flex gap-3">
                   <Button 
                     onClick={syncAndCopyLink}
                     disabled={copyStatus === 'loading'}
                     className={cn(
                       "h-14 px-8 font-black rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-2xl flex gap-3 border-none",
                       copyStatus === 'success' ? "bg-emerald-500 text-white" : "gradient-primary text-white"
                     )}
                   >
                      {copyStatus === 'loading' ? <RefreshCcw size={22} className="animate-spin" /> : 
                       copyStatus === 'success' ? <><CheckCircle2 size={22} /> Lien Copié</> : 
                       <><Share2 size={22} /> Partager au Client</>}
                   </Button>
                   <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm" onClick={() => { if(confirm('Supprimer définitivement ce dossier ?')) { deleteProject(id); navigate('/'); } }}><Trash2 size={20} /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 pt-10 border-t border-slate-50">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Avancement</p>
                    <p className="text-4xl font-black text-slate-900">{progress}%</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Deadline</p>
                    <p className="text-3xl font-black text-slate-900">{project.deadline ? format(new Date(project.deadline), 'dd MMM') : '—'}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Santé</p>
                    <p className="text-3xl font-black text-emerald-500">{project.healthScore || 100}%</p>
                 </div>
                 <Button variant="ghost" className="h-auto py-2 text-slate-300 font-bold text-xs uppercase hover:text-primary self-center bg-slate-50 rounded-xl" onClick={() => setIsEditing(true)}>Modifier Dossier</Button>
              </div>
           </Card>

           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 ml-4 flex items-center gap-2"><Activity size={14} /> Chronologie des Jalons</h3>
              <div className="grid gap-4">
                 {milestones.map((m, idx) => (
                   <Card key={m.id} className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex items-center justify-between group hover:ring-1 hover:ring-primary/20 transition-all scale-in">
                      <div className="flex items-center gap-6">
                         <button 
                           onClick={() => updateMilestone(id, m.id, { status: m.status === 'done' ? 'todo' : 'done' })}
                           className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110",
                             m.status === 'done' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-50 text-slate-300"
                           )}
                         >
                            <CheckCircle2 size={24} />
                         </button>
                         <div>
                            <p className={cn("font-black text-xl tracking-tight", m.status === 'done' && "text-slate-300 line-through")}>{m.name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono tracking-tighter">Échéance : {m.dueDate ? format(new Date(m.dueDate), 'dd MMMM', { locale: fr }) : 'Non planifiée'}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-500 transition-all" onClick={() => deleteMilestone(id, m.id)}><Trash2 size={18} /></Button>
                   </Card>
                 ))}

                 <Card className="p-8 border-2 border-dashed border-slate-100 bg-slate-50/20 rounded-[2.5rem] transition-colors hover:border-primary/20">
                    <form onSubmit={(e) => { e.preventDefault(); if(!newMilestoneName) return; addMilestone(id, { name: newMilestoneName, dueDate: newMilestoneDate ? new Date(newMilestoneDate).toISOString() : null }); setNewMilestoneName(''); setNewMilestoneDate(''); }} className="flex flex-col md:flex-row gap-4">
                       <Input placeholder="Titre de l'étape à réaliser..." value={newMilestoneName} onChange={e => setNewMilestoneName(e.target.value)} className="h-14 font-black border-none shadow-inner rounded-xl" />
                       <Input type="date" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} className="h-14 font-black border-none shadow-inner rounded-xl md:w-56" />
                       <Button type="submit" className="h-14 px-10 gradient-primary border-none text-white font-black rounded-xl shadow-lg">Ajouter</Button>
                    </form>
                 </Card>
              </div>
           </div>
        </div>

        {/* COLONNE DROITE (NOTES & LOGS) */}
        <div className="w-full lg:w-96 space-y-8">
           <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem] ring-1 ring-black/5 flex flex-col group transition-all duration-500 hover:ring-amber-200/50">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm"><StickyNote size={20} /></div>
                    <h3 className="text-xl font-black tracking-tighter">Notes du Projet</h3>
                 </div>
              </div>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-slate-600 focus:ring-1 focus:ring-amber-200 resize-none min-h-[300px] shadow-inner transition-colors focus:bg-white"
                placeholder="Ex: À faire valider couleur du flyer... Ne pas oublier de facturer l'acompte..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="mt-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center italic">Enregistrement automatique local</p>
           </Card>

           <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem] ring-1 ring-black/5 group">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400 flex items-center gap-2"><Activity size={14} /> Historique Dossier</h3>
              <div className="space-y-6">
                 {(project.logs || []).slice(-5).reverse().map((log, i) => (
                    <div key={i} className="flex gap-4 items-start animate-in fade-in">
                       <div className="w-2 h-2 rounded-full bg-primary/40 mt-1.5 shrink-0 group-hover:bg-primary transition-colors duration-1000" />
                       <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{log.action}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{log.details}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
