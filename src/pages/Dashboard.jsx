import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import AIAttackPlan from '../components/AIAttackPlan';
import VisualCalendar from '../components/VisualCalendar';
import { Plus, Search, Calendar, ChevronRight, AlertCircle, Folder, LogOut, User, Contact, Activity, Briefcase, RefreshCcw, LayoutGrid, StickyNote, CheckCircle2, HeartPulse } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const QuickNotes = () => {
  const [note, setNote] = useState(() => localStorage.getItem('pb_quick_note') || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem('pb_quick_note', note);
    const timeout = setTimeout(() => setSaved(true), 1500);
    return () => { clearTimeout(timeout); setSaved(false); };
  }, [note]);

  return (
    <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem] ring-1 ring-black/5 flex flex-col h-full hover:ring-primary/20 transition-all duration-500">
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center transition-transform hover:scale-110 shadow-sm"><StickyNote size={20} /></div>
             <h3 className="text-xl font-black tracking-tighter">Notes Stratégiques</h3>
          </div>
          {saved && <span className="text-[10px] font-black text-emerald-500 animate-in italic">Sauvé</span>}
       </div>
       <textarea 
         className="flex-1 w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-slate-600 focus:ring-1 focus:ring-amber-200 resize-none min-h-[220px] shadow-inner transition-colors focus:bg-white"
         placeholder="Ex: Ne pas oublier M. Redon..."
         value={note}
         onChange={(e) => setNote(e.target.value)}
       />
       <p className="mt-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Enregistrement local automatique</p>
    </Card>
  );
};

const ProjectList = ({ projects, title, icon: Icon, onShare }) => (
  <div className="space-y-6 mb-12 animate-in pb-12">
    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
      <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg">
        <Icon size={20} />
      </div>
      <h2 className="text-2xl font-black tracking-tighter text-slate-900">{title}</h2>
      <Badge className="ml-auto bg-slate-100 text-slate-400 border-none font-black text-xs px-3">{projects.length}</Badge>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map(project => {
        let deadlineStr = project.deadline ? format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr }) : 'Sans date';
        
        // CALCUL SCORE DE SANTÉ (Respect des délais + Étapes validées)
        const totalSteps = project.milestones?.length || 0;
        const doneSteps = project.milestones?.filter(m => m.status === 'done').length || 0;
        const progressSteps = totalSteps > 0 ? (doneSteps / totalSteps) * 50 : 0;
        const delayPenalty = project.status === 'delayed' ? 0 : 50; 
        const healthScore = Math.min(100, Math.round(progressSteps + delayPenalty));

        return (
          <Link key={project.id} to={`/project/${project.id}`} className="group h-full transition-all duration-300 hover:scale-[1.03]">
            <Card className="p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border-none h-full flex flex-col justify-between bg-white rounded-[2.5rem] ring-1 ring-black/5 relative overflow-hidden">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shadow-[0_0_10px]",
                        project.status === 'delayed' ? "bg-red-500 shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                      )} />
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest h-5 px-3 border-slate-100 text-slate-400">
                         {project.status === 'delayed' ? 'Retard' : 'Actif'}
                      </Badge>
                    </div>
                    <h3 className="font-black text-2xl leading-tight text-slate-900 group-hover:text-primary transition-colors truncate tracking-tighter">{project.name}</h3>
                    <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">{project.client}</p>
                  </div>
                  
                  {/* SCORE DE SANTÉ UNIQUE */}
                  <div className={cn(
                    "flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-none shadow-lg",
                    healthScore > 80 ? "bg-emerald-50 text-emerald-600" : healthScore > 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600 animate-pulse"
                  )}>
                     <HeartPulse size={14} className="mb-0.5" />
                     <span className="text-base font-black leading-none">{healthScore}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] mb-2 text-slate-400 font-extrabold uppercase tracking-widest italic">
                    <span>Avancement</span>
                    <span className="text-slate-900 font-black">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100 relative">
                    <div 
                      className="absolute left-0 top-0 h-full gradient-primary rounded-full transition-all duration-[2000ms] shadow-lg shadow-primary/30"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-400 group-hover:text-primary transition-colors">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{deadlineStr}</span>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(project.id); }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <RefreshCcw size={12} /> Partager
                </button>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  </div>
);

const Dashboard = () => {
  const { projects, getShareLink } = useProjects();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  const handleShare = async (id) => {
    try {
      const token = await getShareLink(id);
      const url = `${window.location.origin}/client?token=${token}`;
      await navigator.clipboard.writeText(url);
      alert("✅ Lien client synchronisé !");
    } catch (e) { alert("🚨 Sync Cloud Échouée."); }
  };

  const filteredProjects = projects.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.client || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8 animate-in text-slate-900 max-w-7xl pb-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 px-4">
        <div>
           <h1 className="text-5xl font-black tracking-tighter">Mon Dashboard Pro</h1>
           <p className="text-xl text-slate-400 font-black italic tracking-tight uppercase tracking-widest text-xs mt-2">v2.1 Hybrid Mode</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/contacts"><Button variant="outline" className="gap-2 font-black h-12 rounded-xl border-slate-100"><Contact size={20} /></Button></Link>
          <Link to="/folders"><Button variant="outline" className="gap-2 font-black h-12 rounded-xl border-slate-100"><Folder size={20} /></Button></Link>
          <Link to="/project/new"><Button className="gap-2 font-black shadow-2xl h-12 rounded-xl bg-slate-900 text-white border-none px-8 hover:bg-slate-800 transition-all hover:scale-105"><Plus size={20} /> Créer</Button></Link>
          <Button variant="ghost" onClick={() => { logout(); navigate('/login'); }} className="h-12 w-12 text-slate-300 hover:text-red-500 rounded-xl transition-colors"><LogOut size={20} /></Button>
        </div>
      </div>

      <div className="px-4 space-y-20">
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-stretch">
            <div className="xl:col-span-8 flex flex-col">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2"><Calendar size={14} /> Calendrier Mensuel</h3>
               <VisualCalendar projects={projects} />
            </div>
            <div className="xl:col-span-4 flex flex-col">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2"><StickyNote size={14} /> Rappels Directs</h3>
               <QuickNotes />
            </div>
         </div>

         <div className="pt-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 flex items-center gap-2 px-2"><Activity size={14} /> Plan d'Attaque Hebdomadaire</h3>
            <AIAttackPlan projects={projects} />
         </div>

         <div className="pt-16">
            <div className="relative mb-12">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
               <Input placeholder="Chercher un projet..." className="pl-14 h-16 text-lg bg-white shadow-sm border-none rounded-3xl ring-1 ring-black/5 font-black" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <ProjectList projects={filteredProjects} title="Base de Données Clients" icon={LayoutGrid} onShare={handleShare} />
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
