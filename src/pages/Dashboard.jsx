import React, { useState, useEffect } from 'react';
import { useProjects, calculateHealthScore } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import AIAttackPlan from '../components/AIAttackPlan';
import VisualCalendar from '../components/VisualCalendar';
import { 
  Plus, Search, Calendar, ChevronRight, AlertCircle, Folder, 
  LogOut, User, Contact, Activity, Briefcase, RefreshCcw, 
  LayoutGrid, StickyNote, CheckCircle2, HeartPulse, Zap, Sparkles, Clock, Target
} from 'lucide-react';
import { format, isSameMonth, isSameWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const HealthBadge = ({ score }) => {
  let color = "bg-emerald-100 text-emerald-600";
  if (score < 40) color = "bg-red-100 text-red-600";
  else if (score < 70) color = "bg-amber-100 text-amber-600";
  
  return (
    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ml-2", color)}>
       {score}%
    </span>
  );
};

const QuickNotes = () => {
  const [note, setNote] = useState(() => localStorage.getItem('pb_quick_note') || '');
  useEffect(() => { localStorage.setItem('pb_quick_note', note); }, [note]);
  return (
    <Card className="p-8 border-none shadow-2xl bg-white rounded-[3rem] ring-1 ring-black/5 flex flex-col h-full hover:shadow-indigo-500/10 transition-all duration-500 group">
       <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12"><StickyNote size={20} /></div><h3 className="text-xl font-black tracking-tighter text-slate-900">Notes</h3></div>
       <textarea className="flex-1 w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-slate-600 focus:ring-1 focus:ring-amber-200 resize-none min-h-[300px] shadow-inner transition-all focus:bg-white text-md" placeholder="Notes rapides..." value={note} onChange={(e) => setNote(e.target.value)} />
    </Card>
  );
};

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
      alert("🚀 Lien Client prêt !");
    } catch (e) { alert("🚨 Erreur Cloud."); }
  };

  const filteredProjects = projects.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.client || '').toLowerCase().includes(searchTerm.toLowerCase()));

  // CALCULS STATS 
  const activeCount = projects.filter(p => p.status !== 'done').length;
  const deadlineThisWeek = projects.filter(p => p.deadline && isSameWeek(new Date(p.deadline), new Date(), { weekStartsOn: 1 })).length;
  const inValidation = projects.filter(p => p.milestones?.some(m => m.status === 'doing')).length;
  const doneThisMonth = projects.filter(p => p.status === 'done' && isSameMonth(new Date(p.updatedAt), new Date())).length;

  return (
    <div className="container mx-auto px-6 py-12 animate-in max-w-7xl pb-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10 px-4">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-2xl relative rotate-3"><Zap size={32} /></div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-900">ProjBoard</h1>
           </div>
           <p className="text-xl text-slate-400 font-extrabold italic">Pour que vos projets soient menés à bien</p>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mt-6">Bienvenue {currentUser.name}</p>
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <Link to="/contacts"><Button variant="outline" className="h-24 w-24 rounded-[2.5rem] shadow-premium flex flex-col items-center justify-center gap-2 border-none bg-white hover:scale-110 transition-all group"><Contact size={32} className="text-slate-400 group-hover:text-primary transition-colors"/><span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Contacts</span></Button></Link>
          <Link to="/folders"><Button variant="outline" className="h-24 w-24 rounded-[2.5rem] shadow-premium flex flex-col items-center justify-center gap-2 border-none bg-white hover:scale-110 transition-all group"><Folder size={32} className="text-slate-400 group-hover:text-primary transition-colors"/><span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Dossiers</span></Button></Link>
          <Link to="/project/new"><Button className="h-24 px-10 font-black gradient-primary border-none shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] text-white rounded-[2.5rem] hover:scale-105 transition-all text-xl gap-4 group"><Plus size={32} /><span>Nouveau Projet</span></Button></Link>
          <Button variant="ghost" onClick={() => logout()} className="h-24 w-12 text-slate-200 hover:text-red-500 transition-all"><LogOut size={28}/></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 px-4">
        {[
          { label: 'Projets Actifs', val: activeCount, color: 'indigo', icon: Briefcase },
          { label: 'De la Semaine', val: deadlineThisWeek, color: 'amber', icon: Clock },
          { label: 'En Validation', val: inValidation, color: 'primary', icon: Activity },
          { label: 'Terminé ce mois', val: doneThisMonth, color: 'emerald', icon: CheckCircle2 }
        ].map((stat, i) => (
          <Card key={i} className="p-8 border-none shadow-xl bg-white rounded-[2.5rem] flex flex-col justify-between group">
             <div><div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg", `bg-${stat.color === 'primary' ? 'indigo' : stat.color}-50 text-${stat.color === 'primary' ? 'indigo' : stat.color}-600`)}><stat.icon size={20} /></div><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{stat.label}</p><p className={cn("text-6xl font-black tracking-tighter", `text-${stat.color === 'primary' ? 'indigo' : stat.color}-600`)}>{stat.val}</p></div>
          </Card>
        ))}
      </div>

      <div className="px-4 space-y-20">
         {/* ORDRE DEMANDÉ : CALENDRIER ET NOTES SIDE-BY-SIDE */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 flex flex-col">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-3 italic">Calendrier des flux</h3>
               {/* CALENDRIER TRÈS LÉGÈREMENT PLUS PETIT v2.9.1 */}
               <div className="max-w-[100%] mx-auto w-full"><VisualCalendar projects={projects} /></div>
            </div>
            <div className="lg:col-span-4 flex flex-col">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-3 italic">Notes Tactiques</h3>
               <QuickNotes />
            </div>
         </div>

         <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-3 italic">Plan d'Attaque Hebdomadaire</h3>
            <AIAttackPlan projects={projects} />
         </div>

         <div className="flex flex-col">
            <div className="relative mb-12"><Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} /><Input placeholder="Chercher une mission..." className="pl-20 h-20 text-xl bg-white shadow-2xl border-none rounded-[3rem] ring-1 ring-black/5 font-black" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProjects.map(project => {
                const score = calculateHealthScore(project);
                const total = project.milestones?.length || 0;
                const done = project.milestones?.filter(m => m.status === 'done').length || 0;
                const realProgress = total > 0 ? Math.round((done / total) * 100) : (project.progress || 0);
                
                return (
                  <Link key={project.id} to={`/project/${project.id}`} className="group h-full transition-all duration-500 hover:-translate-y-2 block">
                    <Card className="p-10 hover:shadow-[0_40px_60px_-15px_rgba(99,102,241,0.15)] transition-all border-none h-full flex flex-col justify-between bg-white rounded-[3.5rem] ring-1 ring-black/5 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center mb-4">
                               <div className={cn("w-3 h-3 rounded-full shadow-lg", score < 40 ? "bg-red-500 shadow-red-500/20" : "bg-emerald-500 shadow-emerald-500/20")} />
                               <HealthBadge score={score} />
                            </div>
                            <h3 className="font-black text-3xl leading-none text-slate-900 group-hover:text-primary transition-colors truncate tracking-tighter mb-2">{project.name}</h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{project.client}</p>
                          </div>
                        </div>
                        <div className="space-y-4 mb-10">
                          <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avancement</span><span className="text-xl font-black text-slate-900">{realProgress}%</span></div>
                          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner flex ring-1 ring-slate-100/50">
                            <div className="h-full gradient-primary shadow-lg transition-all duration-[1000ms]" style={{ width: `${realProgress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-50 relative z-10">
                        <div className="flex items-center gap-2 text-slate-400 font-black"><Calendar size={14} /><span className="text-[10px] uppercase tracking-widest">{project.deadline ? format(new Date(project.deadline), 'dd MMM y') : '—'}</span></div>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(project.id); }} className="flex items-center gap-2 text-[10px] font-black uppercase bg-primary text-white ml-auto px-6 py-2.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all outline-none"><Zap size={12} /> Partager</button>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
