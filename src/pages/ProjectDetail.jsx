import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Button, Card, Badge, Input, cn } from '../components/ui';
import { 
  ChevronLeft, Calendar, Clock, CheckCircle2, 
  Plus, Activity, Trash2, Share2, RefreshCcw, StickyNote, AlertCircle, Circle, ArrowUpRight, HeartPulse
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
  
  const [shareLink, setShareLink] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);

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
    updateProject(id, { name: editedName, client: editedClient, deadline: editedDeadline ? new Date(editedDeadline).toISOString() : project.deadline });
    setIsEditing(false);
  };

  const handleSyncShare = async () => {
    setSyncBusy(true);
    try {
      const token = await getShareLink(id);
      const url = `${window.location.origin}/client?token=${token}`;
      setShareLink(url);
      await navigator.clipboard.writeText(url);
    } catch (err) { alert(err.message); }
    setSyncBusy(false);
  };

  const cycleMilestone = (mId, currentStatus) => {
    let newStatus = 'todo';
    if (currentStatus === 'todo') newStatus = 'doing';
    else if (currentStatus === 'doing') newStatus = 'done';
    else newStatus = 'todo';
    updateMilestone(id, mId, { status: newStatus });
  };

  const milestones = project.milestones || [];
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl animate-in pb-40">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-all">
          <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md"><ChevronLeft size={16} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 space-y-10 w-full">
           <Card className="p-12 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] bg-white rounded-[3.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 gradient-primary opacity-5 rounded-full blur-3xl -mr-40 -mt-40" />
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-12 relative z-10 gap-8">
                {isEditing ? (
                  <div className="space-y-4 w-full max-w-lg">
                    <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="text-4xl font-black h-20 shadow-inner rounded-[1.5rem]" />
                    <Input value={editedClient} onChange={e => setEditedClient(e.target.value)} className="font-bold text-slate-500 shadow-inner rounded-xl" />
                    <div className="flex gap-4">
                       <Button onClick={handleSaveProject} className="gradient-primary border-none font-black shadow-lg rounded-2xl h-14 px-8 text-white">Sauvegarder</Button>
                       <Button variant="ghost" onClick={() => setIsEditing(false)} className="font-black h-14">Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                       <Badge className="bg-primary/10 text-primary border-none font-black text-xs uppercase tracking-widest h-8 px-4 rounded-full">Mission Prioritaire</Badge>
                       <Badge className="bg-slate-50 text-slate-300 border-none font-black text-[10px] uppercase h-8 px-4 rounded-full italic">ProjBoard Cloud ✅</Badge>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-4 leading-none">{project.name}</h1>
                    <p className="text-2xl text-slate-400 font-extrabold italic tracking-tight">{project.client}</p>
                  </div>
                )}

                <div className="flex flex-col gap-4 min-w-[280px]">
                   <Button onClick={handleSyncShare} disabled={syncBusy} className="h-16 px-10 font-black gradient-primary border-none text-white rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all flex gap-3 text-lg">
                      {syncBusy ? <RefreshCcw size={24} className="animate-spin" /> : <><Share2 size={24} /> Partager au Client</>}
                   </Button>
                   
                   {shareLink && (
                     <div className="p-4 bg-slate-50 border-2 border-dashed border-primary/20 rounded-2xl animate-in slide-in-from-top">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2 flex justify-between">Lien généré <span className="text-emerald-500">Copié !</span></p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 break-all select-all">{shareLink}</p>
                     </div>
                   )}

                   <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-100 hover:text-primary transition-all" onClick={() => setIsEditing(true)}>Éditer</Button>
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 border-none shadow-sm transition-all" onClick={() => { if(confirm('Supprimer ?')) { deleteProject(id); navigate('/'); } }}><Trash2 size={20} /></Button>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10 pt-10 border-t border-slate-50">
                 <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Avancement</p>
                    <div className="flex items-center gap-6">
                       <p className="text-5xl font-black text-slate-900 leading-none">{progress}%</p>
                       <div className="h-4 flex-1 bg-slate-50 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                          <div className="h-full gradient-primary rounded-full shadow-lg transition-all duration-[2000ms]" style={{ width: `${progress}%` }} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-1 md:pl-10 md:border-l border-slate-50">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Deadline</p>
                    <p className="text-4xl font-black text-slate-900">{project.deadline ? format(new Date(project.deadline), 'dd MMM') : '—'}</p>
                 </div>
                 <div className="space-y-1 md:pl-10 md:border-l border-slate-50">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Santé</p>
                    <div className="flex items-center gap-3">
                       <HeartPulse size={28} className={cn(progress < 20 ? "text-red-500 animate-pulse" : "text-emerald-500")} />
                       <p className="text-4xl font-black text-slate-900 font-black">{progress < 20 && milestones.length > 0 ? 'Urgent' : 'Ok'}</p>
                    </div>
                 </div>
              </div>
           </Card>

           <div className="space-y-8 px-4">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-3 italic"><Activity size={18} /> Chronologie Stratégique</h3>
              <div className="grid gap-6">
                 {milestones.map((m) => (
                   <Card key={m.id} className="p-8 border-none shadow-premium bg-white rounded-[2.5rem] flex items-center justify-between group hover:ring-2 hover:ring-primary/20 transition-all scale-in">
                      <div className="flex items-center gap-8">
                         <button onClick={() => cycleMilestone(m.id, m.status)} className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110", m.status === 'done' ? "bg-emerald-500 text-white shadow-emerald-500/20" : m.status === 'doing' ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-slate-50 text-slate-200")}>
                            {m.status === 'done' ? <CheckCircle2 size={32} /> : m.status === 'doing' ? <Clock size={32} className="animate-pulse" /> : <Circle size={32} />}
                         </button>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <p className={cn("font-black text-2xl tracking-tight transition-all", m.status === 'done' ? "text-slate-300 line-through" : "text-slate-900")}>{m.name}</p>
                               {m.status === 'doing' && <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[10px] h-6 px-3">EN COURS</Badge>}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Calendar size={12} /> {m.dueDate ? format(new Date(m.dueDate), 'dd MMMM', { locale: fr }) : 'Non daté'}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-500 transition-all" onClick={() => deleteMilestone(id, m.id)}><Trash2 size={24} /></Button>
                   </Card>
                 ))}
                 <Card className="p-10 border-4 border-dashed border-slate-100 bg-slate-50/10 rounded-[3rem] transition-colors hover:border-primary/20">
                    <form onSubmit={(e) => { e.preventDefault(); if(!newMilestoneName) return; addMilestone(id, { name: newMilestoneName, dueDate: newMilestoneDate ? new Date(newMilestoneDate).toISOString() : null }); setNewMilestoneName(''); setNewMilestoneDate(''); }} className="flex flex-col md:flex-row gap-6">
                       <Input placeholder="Titre de la prochaine étape..." value={newMilestoneName} onChange={e => setNewMilestoneName(e.target.value)} className="h-16 font-black border-none shadow-inner rounded-2xl bg-white" />
                       <Input type="date" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} className="h-16 font-black border-none shadow-inner rounded-2xl md:w-64 bg-white" />
                       <Button type="submit" className="h-16 px-12 gradient-primary border-none text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">Ajouter</Button>
                    </form>
                 </Card>
              </div>
           </div>
        </div>

        <div className="w-full lg:w-[450px] space-y-12">
           <Card className="p-10 border-none shadow-premium bg-white rounded-[3.5rem] flex flex-col group transition-all duration-700 hover:ring-primary/20">
              <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center shadow-sm"><StickyNote size={28} /></div><h3 className="text-2xl font-black tracking-tighter text-slate-900">Notes Stratégiques</h3></div></div>
              <textarea className="w-full bg-slate-50 border-none rounded-[2rem] p-8 font-bold text-slate-700 focus:ring-2 focus:ring-primary/10 resize-none min-h-[400px] shadow-inner transition-all focus:bg-white text-lg leading-relaxed" placeholder="Prendre des notes ici..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              <p className="mt-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center italic">Enregistrement Local ✅</p>
           </Card>

           <Card className="p-10 border-none shadow-premium bg-slate-900 text-white rounded-[3.5rem] group overflow-hidden relative">
              <div className="flex items-center gap-4 mb-10"><Activity size={24} className="text-primary animate-pulse" /><h3 className="text-xl font-black tracking-widest uppercase">Tableau de Bord Projet</h3></div>
              <div className="space-y-8 relative z-10">
                 {(project.logs || []).slice(-6).reverse().map((log, i) => (
                    <div key={i} className="flex gap-5 items-start animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                       <div className="w-3 h-3 rounded-full bg-primary/40 mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                       <div><p className="text-sm font-black text-white leading-none mb-2">{log.action}</p><p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{log.details}</p><p className="text-[9px] text-slate-600 font-black mt-1">{format(new Date(log.date), 'HH:mm')}</p></div>
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
