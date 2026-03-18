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
  LayoutGrid, StickyNote, CheckCircle2, HeartPulse, Zap, Sparkles, Clock, Target, Flame, ArrowUpRight
} from 'lucide-react';
import { format, isSameMonth, isSameWeek, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const HealthBadge = ({ score }) => {
  let color = "bg-emerald-100 text-emerald-600";
  let label = "Santé Ok";
  if (score < 40) { color = "bg-red-100 text-red-600"; label = "En danger"; }
  else if (score < 70) { color = "bg-amber-100 text-amber-600"; label = "À surveiller"; }
  return <Badge className={cn("font-black text-[9px] uppercase tracking-widest border-none px-3 h-6", color)}>{label} • {score}</Badge>;
};

const QuickNotes = () => {
  const [note, setNote] = useState(() => localStorage.getItem('pb_quick_note') || '');
  useEffect(() => { localStorage.setItem('pb_quick_note', note); }, [note]);
  return (
    <Card className="p-8 border-none shadow-2xl bg-white rounded-[3rem] ring-1 ring-black/5 flex flex-col h-full group">
       <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform"><StickyNote size={20} /></div><h3 className="text-xl font-black tracking-tighter text-slate-900">Notes</h3></div>
       <textarea className="flex-1 w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-slate-600 focus:ring-1 focus:ring-amber-200 resize-none min-h-[180px] shadow-inner transition-all focus:bg-white text-md" placeholder="Notes..." value={note} onChange={(e) => setNote(e.target.value)} />
    </Card>
  );
};

const ProjectList = ({ projects, title, icon: Icon, onShare }) => {
  const sortedProjects = [...projects].sort((a, b) => {
    const scoreA = calculateHealthScore(a);
    const scoreB = calculateHealthScore(b);
    if (scoreA < 40 && scoreB >= 40) return -1;
    if (scoreB < 40 && scoreA >= 40) return 1;
    return 0;
  });

  return (
    <div className="space-y-8 mb-16 animate-in">
      <div className="flex items-center gap-4 px-2">
        <div className="p-3 bg-slate-900 text-white rounded-[1.2rem] shadow-xl"><Icon size={24} /></div>
        <h2 className="text-3xl font-black tracking-tighter text-slate-900">{title}</h2>
        <div className="h-px flex-1 bg-slate-100 ml-4 opacity-50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {sortedProjects.map(project => {
          const score = calculateHealthScore(project);
          const total = project.milestones?.length || 0;
          const done = project.milestones?.filter(m => m.status === 'done').length || 0;
          const progress = total > 0 ? Math.round((done / total) * 100) : (project.progress || 0);
          const isDanger = score < 40;

          return (
            <Link key={project.id} to={`/project/${project.id}`} className={cn("group transition-all duration-500 hover:-translate-y-2 relative", isDanger && "z-20 scale-105")}>
              <Card className={cn("p-10 hover:shadow-[0_40px_60px_-15px_rgba(99,102,241,0.15)] transition-all border-none h-full flex flex-col justify-between bg-white rounded-[3.5rem] ring-1 ring-black/5 overflow-hidden", isDanger ? "ring-2 ring-red-500 shadow-red-500/10" : "")}>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-4">
                         <div className={cn("w-3 h-3 rounded-full animate-pulse shadow-md", isDanger ? "bg-red-500" : "bg-emerald-500")} />
                         <HealthBadge score={score} />
                      </div>
                      <h3 className="font-black text-3xl leading-none text-slate-900 truncate tracking-tighter mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{project.client}</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-end"><span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Avancement</span><span className="text-xl font-black text-slate-900">{progress}%</span></div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner flex ring-1 ring-slate-100">
                      <div className="h-full rounded-full gradient-primary shadow-lg transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50"><div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className={cn("h-full transition-all duration-1000", score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${score}%` }} /></div></div>
                <div className="flex items-center justify-between mt-8 relative z-10">
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors"><Calendar size={14} /><span className="text-[10px] font-black uppercase tracking-widest">{project.deadline ? format(new Date(project.deadline), 'dd MMM') : 'Sans Date'}</span></div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(project.id); }} className="flex items-center gap-2 text-[10px] font-black uppercase bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all outline-none"><Zap size={12} /> Partager</button>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { projects, getShareLink } = useProjects();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  const healthFocus = [...projects].filter(p => p.status !== 'done').sort((a, b) => calculateHealthScore(a) - calculateHealthScore(b)).slice(0, 3);
  const dayFocus = projects.filter(p => {
    const score = calculateHealthScore(p);
    const daysLeft = p.deadline ? differenceInDays(new Date(p.deadline), new Date()) : 999;
    return score < 40 && daysLeft < 3;
  });

  const handleShare = async (id) => {
    try {
      const token = await getShareLink(id);
      const url = `${window.location.origin}/client?token=${token}`;
      await navigator.clipboard.writeText(url);
      alert("🚀 Lien Client prêt !");
    } catch (e) { alert("🚨 Erreur."); }
  };

  const filteredProjects = projects.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.client || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container mx-auto px-6 py-12 animate-in max-w-7xl pb-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10 px-4">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-2xl relative rotate-3"><Zap size={32} /></div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-900">ProjBoard</h1>
           </div>
           <p className="text-xl text-slate-400 font-extrabold italic"><Sparkles size={20} className="text-amber-400 inline mr-2" /> Pour que vos projets soient menés à bien</p>
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <Link to="/project/new"><Button className="h-20 px-10 font-black gradient-primary border-none shadow-premium text-white rounded-[2rem] hover:scale-105 transition-all active:scale-95 gap-4 text-xl"><Plus size={32} /> Nouveau Projet</Button></Link>
          <Button variant="ghost" onClick={() => logout()} className="h-16 w-12 text-slate-200 hover:text-red-500 transition-all"><LogOut size={28}/></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 px-4">
         {/* PLAN D'ATTAQUE IA v2.7 RESTAURÉ */}
         <div className="lg:col-span-12 xl:col-span-8 flex flex-col">
            <AIAttackPlan projects={projects} />
         </div>
         <div className="xl:col-span-4 flex flex-col h-full"><QuickNotes /></div>
      </div>

      {dayFocus.length > 0 && (
        <div className="mb-24 px-4">
           <div className="flex items-center gap-3 mb-8"><Flame size={24} className="text-red-500 animate-bounce" /><h3 className="text-xl font-black uppercase tracking-[0.3em] text-red-500">Urgence Absolue</h3></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dayFocus.map(p => (
                <Link key={p.id} to={`/project/${p.id}`}>
                  <Card className="p-8 border-none bg-red-500 text-white rounded-[2.5rem] shadow-2xl shadow-red-500/30 ring-4 ring-red-100 flex items-center justify-between hover:scale-[1.02] transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg"><AlertCircle size={32} /></div>
                        <div><p className="text-2xl font-black tracking-tighter">{p.name}</p><p className="text-xs font-black uppercase tracking-widest opacity-80">Score {calculateHealthScore(p)} • Deadline Imminente</p></div>
                     </div>
                     <ArrowUpRight size={32} />
                  </Card>
                </Link>
              ))}
           </div>
        </div>
      )}

      <div className="px-4 mb-24">
         <div className="flex items-center justify-between mb-8"><h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 flex items-center gap-3"><HeartPulse size={18} className="text-primary" /> État de Santé Critique</h3></div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthFocus.map(p => {
              const score = calculateHealthScore(p);
              return (
                <Card key={p.id} className={cn("p-6 border-none shadow-xl rounded-[2rem] flex flex-col justify-between transition-all", score < 40 ? "bg-red-50 ring-2 ring-red-100" : "bg-white")}>
                   <div><p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">{p.client}</p><h4 className="text-lg font-black tracking-tighter text-slate-900 mb-2 truncate">{p.name}</h4><p className={cn("text-5xl font-black tracking-tighter mb-4", score < 40 ? "text-red-500" : "text-amber-500")}>{score}%</p></div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className={cn("h-full transition-all duration-[2000ms]", score < 40 ? "bg-red-500" : "bg-amber-500")} style={{ width: `${score}%` }} /></div>
                </Card>
              );
            })}
         </div>
      </div>

      <div className="px-4 space-y-24">
         <div className="relative"><Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} /><Input placeholder="Filtre..." className="pl-20 h-20 text-xl bg-white shadow-2xl border-none rounded-[3rem] ring-1 ring-black/5 font-black uppercase placeholder:text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
         <ProjectList projects={filteredProjects} title="Catalogue Projets" icon={LayoutGrid} onShare={handleShare} />
         <div className="flex flex-col"><h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-3"><Calendar size={18} /> Chronologie Calendar</h3><VisualCalendar projects={projects} /></div>
      </div>
    </div>
  );
};

export default Dashboard;
