import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import AIAttackPlan from '../components/AIAttackPlan';
import VisualCalendar from '../components/VisualCalendar';
import { 
  Plus, Search, Calendar, ChevronRight, AlertCircle, Folder, 
  LogOut, User, Contact, Activity, Briefcase, RefreshCcw, 
  LayoutGrid, StickyNote, CheckCircle2, HeartPulse, Zap, Sparkles, Clock
} from 'lucide-react';
import { format, isSameMonth, isSameWeek, startOfMonth } from 'date-fns';
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
    <Card className="p-8 border-none shadow-2xl bg-white rounded-[3rem] ring-1 ring-black/5 flex flex-col h-full hover:shadow-indigo-500/10 transition-all duration-500 group">
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3"><div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm"><StickyNote size={24} /></div><h3 className="text-xl font-black tracking-tighter text-slate-900">Notes Stratégiques</h3></div>
          {saved && <CheckCircle2 size={18} className="text-emerald-500 animate-in" />}
       </div>
       <textarea className="flex-1 w-full bg-slate-50 border-none rounded-2xl p-6 font-bold text-slate-600 focus:ring-2 focus:ring-amber-200 resize-none min-h-[220px] shadow-inner transition-all focus:bg-white text-lg" placeholder="Notes rapides..." value={note} onChange={(e) => setNote(e.target.value)} />
    </Card>
  );
};

const ProjectList = ({ projects, title, icon: Icon, onShare }) => (
  <div className="space-y-8 mb-16 animate-in">
    <div className="flex items-center gap-4 px-2">
      <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl"><Icon size={24} /></div>
      <h2 className="text-3xl font-black tracking-tighter text-slate-900">{title}</h2>
      <div className="h-px flex-1 bg-slate-100 ml-4 opacity-50" />
      <Badge className="bg-slate-100 text-slate-400 border-none font-black text-sm px-4 py-1 rounded-full">{projects.length}</Badge>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {projects.map(project => {
        let deadlineStr = project.deadline ? format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr }) : 'Sans Date';
        const total = project.milestones?.length || 0;
        const done = project.milestones?.filter(m => m.status === 'done').length || 0;
        const realProgress = total > 0 ? Math.round((done / total) * 100) : (project.progress || 0);
        let health = 100;
        if (project.status === 'delayed') health -= 40;
        if (realProgress < 20 && total > 0) health -= 20;
        const finalHealth = Math.max(0, health);
        return (
          <Link key={project.id} to={`/project/${project.id}`} className="group h-full transition-all duration-500 hover:-translate-y-2">
            <Card className="p-10 hover:shadow-[0_40px_60px_-15px_rgba(99,102,241,0.15)] transition-all border-none h-full flex flex-col justify-between bg-white rounded-[3.5rem] ring-1 ring-black/5 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-4">
                       <div className={cn("w-3 h-3 rounded-full animate-pulse", project.status === 'delayed' ? "bg-red-500 shadow-lg" : "bg-emerald-500 shadow-lg")} />
                       <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 border-slate-100 text-slate-400 font-black">{project.status === 'delayed' ? 'Retard' : 'Actif'}</Badge>
                    </div>
                    <h3 className="font-black text-3xl leading-none text-slate-900 group-hover:text-primary transition-colors truncate tracking-tighter mb-2">{project.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{project.client}</p>
                  </div>
                  <div className={cn("w-16 h-16 rounded-3xl flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110", finalHealth >= 80 ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" : finalHealth >= 50 ? "bg-amber-50 text-amber-600 shadow-amber-500/10" : "bg-red-50 text-red-600 shadow-red-500/20")}>
                     <HeartPulse size={16} className="mb-0.5" /><span className="text-xl font-black">{finalHealth}</span>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between items-end"><span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Avancement</span><span className="text-xl font-black text-slate-900">{realProgress}%</span></div>
                  <div className="h-3 w-full bg-slate-50 rounded-full p-0.5 ring-1 ring-slate-100 overflow-hidden shadow-inner flex">
                    <div className="h-full gradient-primary shadow-lg shadow-primary/20 transition-all duration-[1500ms]" style={{ width: `${realProgress}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-50 relative z-10">
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors"><Calendar size={16} /><span className="text-[11px] font-black uppercase tracking-widest">{deadlineStr}</span></div>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(project.id); }} className="flex items-center gap-2 text-[11px] font-black uppercase bg-primary text-white px-6 py-2.5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none"><Zap size={14} /> Partager</button>
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
      alert("🚀 Lien Client prêt !");
    } catch (e) { alert(e.message || "🚨 Erreur."); }
  };

  const filteredProjects = projects.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.client || '').toLowerCase().includes(searchTerm.toLowerCase()));

  // CALCULS STATS ORIGINALES
  const activeCount = projects.filter(p => p.status !== 'done').length;
  const deadlineThisWeek = projects.filter(p => p.deadline && isSameWeek(new Date(p.deadline), new Date(), { weekStartsOn: 1 })).length;
  const inValidation = projects.filter(p => p.milestones?.some(m => m.status === 'doing')).length;
  const doneThisMonth = projects.filter(p => p.status === 'done' && isSameMonth(new Date(p.updatedAt), new Date())).length;

  return (
    <div className="container mx-auto px-6 py-12 animate-in max-w-7xl pb-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-10 px-4">
        <div>
           <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-2xl relative rotate-3"><Zap size={32} /></div>
              <h1 className="text-6xl font-black tracking-tighter text-slate-900">ProjBoard</h1>
           </div>
           <p className="text-xl text-slate-400 font-extrabold italic flex items-center gap-2"><Sparkles size={20} className="text-amber-400" /> Pour que vos projets soient menés à bien</p>
           <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mt-6 ml-1">Bienvenue {currentUser.name}</p>
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <Link to="/contacts"><Button variant="outline" className="h-24 w-24 rounded-[2rem] shadow-premium flex flex-col items-center justify-center gap-2 border-none bg-white hover:scale-110 transition-all group"><Contact size={36} className="text-slate-400 group-hover:text-primary transition-colors"/><span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary">Contacts</span></Button></Link>
          <Link to="/folders"><Button variant="outline" className="h-24 w-24 rounded-[2rem] shadow-premium flex flex-col items-center justify-center gap-2 border-none bg-white hover:scale-110 transition-all group"><Folder size={36} className="text-slate-400 group-hover:text-primary transition-colors"/><span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary">Dossiers</span></Button></Link>
          <Link to="/project/new"><Button className="h-24 px-12 font-black gradient-primary border-none shadow-[0_25px_50px_-12px_rgba(99,102,241,0.4)] text-white rounded-[2rem] hover:scale-105 transition-all text-2xl gap-4 group relative overflow-hidden"><Plus size={36} /><span>Nouveau Projet</span></Button></Link>
          <Button variant="ghost" onClick={() => logout()} className="h-24 w-12 text-slate-200 hover:text-red-500 transition-all"><LogOut size={28}/></Button>
        </div>
      </div>

      {/* RESTAURATION STATS ORIGINALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-24 px-4">
        {[
          { label: 'Projets Actifs', val: activeCount, color: 'indigo', icon: Briefcase },
          { label: 'Deadlines du Moment', val: deadlineThisWeek, color: 'amber', icon: Clock },
          { label: 'En Validation Client', val: inValidation, color: 'primary', icon: Activity },
          { label: 'Terminé ce mois', val: doneThisMonth, color: 'emerald', icon: CheckCircle2 }
        ].map((stat, i) => (
          <Card key={i} className="p-10 border-none shadow-xl bg-white rounded-[3rem] ring-1 ring-black/5 hover:scale-105 transition-all duration-500 flex flex-col justify-between group">
             <div>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg", `bg-${stat.color === 'primary' ? 'indigo' : stat.color}-50 text-${stat.color === 'primary' ? 'indigo' : stat.color}-600`)}>
                   <stat.icon size={24} />
                </div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">{stat.label}</p>
                <p className={cn("text-6xl font-black tracking-tighter", `text-${stat.color === 'primary' ? 'indigo' : stat.color}-600`)}>{stat.val}</p>
             </div>
             <div className="mt-6 h-1 w-12 bg-slate-100 rounded-full group-hover:w-full transition-all duration-1000" />
          </Card>
        ))}
      </div>

      <div className="px-4 space-y-24">
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            <div className="xl:col-span-8 flex flex-col"><h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-3"><Calendar size={18} /> Flux Temporel</h3><VisualCalendar projects={projects} /></div>
            <div className="xl:col-span-4 flex flex-col"><h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 mb-8 flex items-center gap-3"><StickyNote size={18} /> Bloc-Notes Tactique</h3><QuickNotes /></div>
         </div>
         <div className="relative"><Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={24} /><Input placeholder="Chercher une mission..." className="pl-20 h-24 text-2xl bg-white shadow-2xl border-none rounded-[3rem] ring-1 ring-black/5 font-black placeholder:text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
         <ProjectList projects={filteredProjects} title="Base de Données Projets" icon={LayoutGrid} onShare={handleShare} />
      </div>
    </div>
  );
};

export default Dashboard;
