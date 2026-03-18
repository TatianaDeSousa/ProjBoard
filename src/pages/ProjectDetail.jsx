import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects, calculateHealthScore } from '../context/ProjectContext';
import { Button, Card, Badge, Input, cn } from '../components/ui';
import { 
  ChevronLeft, Calendar, Clock, CheckCircle2, 
  Plus, Activity, Trash2, Share2, RefreshCcw, StickyNote, AlertCircle, Circle, ArrowUpRight, Minus, Star
} from 'lucide-react';
import { format, isValid } from 'date-fns';
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
  const [shareLink, setShareLink] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);

  useEffect(() => {
    if (project && notes !== project.description) {
      const timeout = setTimeout(() => { updateProject(id, { description: notes }); }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [notes, id, project, updateProject]);

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center p-20 bg-slate-50">
       <div className="text-center space-y-4">
          <div className="text-8xl mb-8">🔍</div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Mission Introuvable</h2>
          <Button onClick={() => navigate('/')} className="gradient-primary">Retour à l'accueil</Button>
       </div>
    </div>
  );

  // CALCUL SCORE SÉCURISÉ
  const score = calculateHealthScore ? calculateHealthScore(project) : 0;
  const isDanger = score < 40;

  const handleSyncShare = async () => {
    setSyncBusy(true);
    try {
      const token = await getShareLink(id);
      if (token) {
        const url = `${window.location.origin}/client?token=${token}`;
        setShareLink(url);
        await navigator.clipboard.writeText(url);
      } else throw new Error("Erreur serveur");
    } catch (err) { alert("Le service Cloud est inaccessible pour le moment."); }
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

  // FORMATEUR DE DATE SÉCURISÉ
  const sFormat = (dateStr, fmt = 'dd MMMM') => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fmt, { locale: fr }) : null;
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl animate-in pb-40">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit transition-all hover:translate-x-[-10px]">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md"><ChevronLeft size={16} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 space-y-10 w-full">
           <Card className={cn(
             "p-12 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] bg-white rounded-[4rem] relative overflow-hidden group transition-all duration-700",
             isDanger ? "ring-2 ring-red-500 shadow-xl" : "ring-1 ring-slate-100"
           )}>
              <div className="absolute top-0 right-0 w-80 h-80 gradient-primary opacity-5 rounded-full blur-3xl -mr-40 -mt-40" />
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-12 relative z-10 gap-8">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-6">
                      <Badge className={cn("font-black text-[10px] uppercase tracking-widest px-4 h-8 flex items-center gap-2 border-none", score >= 70 ? "bg-emerald-100 text-emerald-600" : score >= 40 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600")}>
                         <Activity size={12} /> {score >= 70 ? 'Santé OK' : 'Moyen'} • {score}%
                      </Badge>
                      {project.id && <Badge className="bg-slate-50 text-slate-300 border-none font-black text-[10px] uppercase h-8 px-4 rounded-full italic shadow-sm">ID: {String(project.id).slice(0,8)}</Badge>}
                   </div>
                   <h1 className="text-7xl font-black tracking-tighter text-slate-900 mb-4 leading-none">{project.name}</h1>
                   <p className="text-2xl text-slate-400 font-extrabold italic tracking-tight uppercase text-xs opacity-60">Mission par {project.client}</p>
                </div>

                <div className="flex flex-col gap-4 min-w-[320px]">
                   <Button onClick={handleSyncShare} disabled={syncBusy} className="h-20 px-10 font-black gradient-primary border-none text-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all flex gap-4 text-2xl group relative overflow-hidden">
                      {syncBusy ? <RefreshCcw size={32} className="animate-spin" /> : <><Share2 size={32} /> Accès Client</>}
                   </Button>
                   
                   {shareLink && (
                     <div className="p-6 bg-slate-900 border-none rounded-[2rem] animate-in slide-in-from-top text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/10 opacity-50 blur-xl" />
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2 relative z-10">Lien Client Sécurisé Copié ! ✅</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 break-all select-all relative z-10 cursor-pointer">{shareLink}</p>
                     </div>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10 pt-10 border-t border-slate-50">
                 <div className="md:col-span-2 space-y-6">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Score de Vitalité</p>
                    <div className="flex items-center gap-8">
                       <p className={cn("text-7xl font-black leading-none", score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500")}>{score}%</p>
                       <div className="flex-1 space-y-2">
                          <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 relative shadow-inner ring-1 ring-slate-100">
                             <div className={cn("h-full rounded-full transition-all duration-[2000ms] shadow-lg", score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${score}%` }} />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3 md:pl-10 md:border-l border-slate-50">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Allers-Retours</p>
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-900 shadow-inner">{project.feedbackLoops || 0}</div>
                       <div className="flex flex-col gap-2">
                          <button onClick={() => updateProject(id, { feedbackLoops: (project.feedbackLoops || 0) + 1 })} className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-lg transition-all"><Plus size={16} /></button>
                          <button onClick={() => updateProject(id, { feedbackLoops: Math.max(0, (project.feedbackLoops || 0) - 1) })} className="p-2 bg-slate-100 hover:bg-slate-100 rounded-lg transition-all"><Minus size={16} /></button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 md:pl-10 md:border-l border-slate-50">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Avancement</p>
                    <p className="text-5xl font-black text-slate-900 leading-none">{progress}%</p>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-slate-200 transition-all" style={{ width: `${progress}%` }} /></div>
                 </div>
              </div>
           </Card>

           <div className="space-y-8 px-4">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-3 italic"><Star size={18} /> Chronologie des Jalons</h3>
              <div className="grid gap-6">
                 {milestones.map((m) => (
                   <Card key={m.id} className="p-10 border-none shadow-xl bg-white rounded-[3.5rem] flex items-center justify-between group hover:ring-2 hover:ring-primary/20 transition-all">
                      <div className="flex items-center gap-8">
                         <button onClick={() => cycleMilestone(m.id, m.status)} className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110", m.status === 'done' ? "bg-emerald-500 text-white shadow-emerald-500/20" : m.status === 'doing' ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-slate-50 text-slate-200")}>
                            {m.status === 'done' ? <CheckCircle2 size={40} /> : m.status === 'doing' ? <Clock size={40} className="animate-pulse" /> : <Circle size={40} />}
                         </button>
                         <div>
                            <div className="flex items-center gap-4 mb-2">
                               <p className={cn("font-black text-3xl tracking-tighter transition-all", m.status === 'done' ? "text-slate-300 line-through text-2xl" : "text-slate-900")}>{m.name}</p>
                               {m.status === 'doing' && <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[9px] h-6 px-3 rounded-full">EN PRODUCTION</Badge>}
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3"><Calendar size={14} /> {sFormat(m.dueDate) || 'Non daté'}</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-500 transition-all" onClick={() => deleteMilestone(id, m.id)}><Trash2 size={24} /></Button>
                   </Card>
                 ))}
                 <div className="p-10 border-4 border-dashed border-slate-100 bg-slate-50/10 rounded-[4rem] text-center">
                    <form onSubmit={(e) => { e.preventDefault(); if(!newMilestoneName) return; addMilestone(id, { name: newMilestoneName, dueDate: editedDeadline ? new Date(editedDeadline).toISOString() : null }); setNewMilestoneName(''); }} className="flex flex-col md:flex-row gap-6">
                       <Input placeholder="Titre du jalon..." value={newMilestoneName} onChange={e => setNewMilestoneName(e.target.value)} className="h-20 font-black border-none shadow-inner rounded-[2rem] bg-white text-xl" />
                       <Button type="submit" className="h-20 px-12 gradient-primary border-none text-white font-black rounded-[2rem] shadow-xl hover:scale-105 transition-all text-xl">Planifier l'étape</Button>
                    </form>
                 </div>
              </div>
           </div>
        </div>

        <div className="w-full lg:w-[450px] space-y-12">
           <Card className="p-12 border-none shadow-2xl bg-white rounded-[4rem] flex flex-col group transition-all duration-700 hover:ring-primary/20">
              <div className="flex items-center gap-4 mb-10"><div className="w-16 h-16 bg-primary/5 text-primary rounded-3xl flex items-center justify-center shadow-sm"><StickyNote size={32} /></div><h3 className="text-3xl font-black tracking-tighter text-slate-900">Briefing</h3></div>
              <textarea className="w-full bg-slate-50 border-none rounded-[3rem] p-10 font-bold text-slate-700 focus:ring-2 focus:ring-primary/10 resize-none min-h-[500px] shadow-inner transition-all focus:bg-white text-xl leading-relaxed" placeholder="Notes stratégiques..." value={notes} onChange={(e) => setNotes(e.target.value)} />
           </Card>

           <Card className="p-10 border-none shadow-premium bg-slate-900 text-white rounded-[4rem] group overflow-hidden relative">
              <div className="flex items-center gap-6 mb-12"><Activity size={32} className="text-primary animate-pulse" /><h3 className="text-2xl font-black tracking-tighter uppercase">Board Tactique</h3></div>
              <div className="space-y-10 relative z-10">
                 {(project.logs || []).slice(-8).reverse().map((log, i) => (
                    <div key={i} className="flex gap-6 items-start animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                       <div className="w-3.5 h-3.5 rounded-full bg-primary/40 mt-1.5 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                       <div><p className="text-base font-black text-white leading-none mb-1">{log.action}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60 leading-tight">{log.details}</p></div>
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
