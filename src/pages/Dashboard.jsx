import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import AIAttackPlan from '../components/AIAttackPlan';
import VisualCalendar from '../components/VisualCalendar';
import { Plus, Search, Calendar, ChevronRight, AlertCircle, Folder, LogOut, User, Contact, Activity, Briefcase, RefreshCcw, LayoutGrid } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProjectList = ({ projects, title, icon: Icon, onShare }) => (
  <div className="space-y-6 mb-12 animate-in pb-12">
    <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
      <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg">
        <Icon size={20} />
      </div>
      <h2 className="text-2xl font-black tracking-tighter text-slate-900">{title}</h2>
      <Badge className="ml-auto bg-slate-100 text-slate-400 border-none font-black text-xs px-3">{projects.length}</Badge>
    </div>
    
    {projects.length === 0 ? (
      <div className="text-center py-16 bg-white/50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
        <p className="text-slate-400 font-bold italic">Aucun dossier dans cette catégorie.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => {
          let deadlineStr = project.deadline ? format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr }) : 'Pas de date';
          return (
            <Link key={project.id} to={`/project/${project.id}`} className="group h-full transition-all duration-500 hover:scale-[1.02]">
              <Card className="p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border-none h-full flex flex-col justify-between bg-white rounded-[2.5rem] ring-1 ring-black/5">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          project.status === 'delayed' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                          project.status === 'at_risk' ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : 
                          "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        )} />
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 h-5 px-2">
                           {project.status === 'delayed' ? 'En retard' : project.status === 'at_risk' ? 'À risque' : 'En bonne voie'}
                        </Badge>
                      </div>
                      <h3 className="font-black text-2xl leading-tight text-slate-900 group-hover:text-primary transition-colors truncate tracking-tighter">{project.name}</h3>
                      <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">{project.client}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-[10px] mb-2 text-slate-400 font-extrabold uppercase tracking-widest">
                           <span>Progression</span>
                           <span className="text-slate-900">{project.progress || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 ring-1 ring-slate-100 shadow-inner">
                           <div className="h-full rounded-full gradient-primary transition-all duration-1000 shadow-lg shadow-primary/20" style={{ width: `${project.progress || 0}%` }} />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{deadlineStr}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(project.id); }}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-lg hover:bg-primary hover:text-white transition-all"
                    >
                      <RefreshCcw size={10} /> Partager
                    </button>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-primary transition-all" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const { projects, getShareLink } = useProjects();
  const { currentUser, logout, folders } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleShare = async (id) => {
    try {
      const token = await getShareLink(id);
      const url = `${window.location.origin}/client?token=${token}`;
      await navigator.clipboard.writeText(url);
      alert("Lien client synchronisé et copié !");
    } catch (e) { alert("Erreur lors de la synchronisation cloud."); }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (project.client || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // STATS D'ORIGINE
  const activeProjects = projects.filter(p => p.status !== 'done');
  
  const now = new Date();
  const start = startOfWeek(now);
  const end = endOfWeek(now);
  const deadlinesThisWeek = projects.filter(p => p.deadline && isWithinInterval(new Date(p.deadline), { start, end }));

  const inValidation = projects.filter(p => (p.milestones || []).some(m => m.name?.toLowerCase().includes('validation') && m.status !== 'done'));
  
  const finishedThisMonth = projects.filter(p => p.status === 'done' && new Date(project.updatedAt).getMonth() === now.getMonth());

  return (
    <div className="container mx-auto px-4 py-8 animate-in text-slate-900 max-w-7xl pb-40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 px-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4">ProjBoard <span className="text-primary text-xl">v2.1</span></h1>
           </div>
           <p className="text-xl text-slate-400 font-medium italic">Tableau de bord de {currentUser.name}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/contacts"><Button variant="outline" className="gap-2 font-black h-12 rounded-xl border-slate-100 shadow-sm"><Contact size={20} /> Contacts</Button></Link>
          <Link to="/folders"><Button variant="outline" className="gap-2 font-black h-12 rounded-xl border-slate-100 shadow-sm"><Folder size={20} /> Dossiers</Button></Link>
          <Link to="/project/new"><Button className="gap-2 font-bold shadow-xl shadow-primary/20 h-12 rounded-xl bg-slate-900 text-white border-none px-6 hover:bg-slate-800"><Plus size={20} /> Créer un Projet</Button></Link>
          <Button variant="ghost" onClick={logout} className="h-12 w-12 text-slate-300 hover:text-red-500 rounded-xl"><LogOut size={20} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 px-4">
        <Card className="p-8 bg-indigo-50/50 border-none rounded-[2.5rem] ring-1 ring-indigo-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 relative z-10">Projets Actifs</p>
           <p className="text-5xl font-black text-indigo-900 relative z-10">{activeProjects.length}</p>
        </Card>
        <Card className="p-8 bg-orange-50/50 border-none rounded-[2.5rem] ring-1 ring-orange-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
           <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 relative z-10">Deadlines Semaine</p>
           <p className="text-5xl font-black text-orange-900 relative z-10">{deadlinesThisWeek.length}</p>
        </Card>
        <Card className="p-8 bg-sky-50/50 border-none rounded-[2.5rem] ring-1 ring-sky-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-sky-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
           <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3 relative z-10">En Validation</p>
           <p className="text-5xl font-black text-sky-900 relative z-10">{inValidation.length}</p>
        </Card>
        <Card className="p-8 bg-emerald-50/50 border-none rounded-[2.5rem] ring-1 ring-emerald-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 relative z-10">Client Terminés / Mois</p>
           <p className="text-5xl font-black text-emerald-900 relative z-10">{finishedThisMonth.length}</p>
        </Card>
      </div>

      <div className="px-4 space-y-20">
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
            <div className="xl:col-span-4 max-w-full">
               <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 mb-6 ml-2">Calendrier d'Équilibre</h3>
               <div className="transform scale-[0.85] origin-top-left -mt-6">
                  <VisualCalendar projects={projects} />
               </div>
            </div>
            <div className="xl:col-span-8">
               <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 mb-6 ml-2">Plan d'Attaque Stratégique</h3>
               <AIAttackPlan projects={projects} />
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-6">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <Input placeholder="Rechercher par projet ou client…" className="pl-12 h-14 text-lg bg-white shadow-sm border-none rounded-2xl ring-1 ring-black/5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <select className="h-14 rounded-2xl border-none bg-white px-6 font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5 focus:ring-primary" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
             <option value="all">Tous les statuts</option>
             <option value="on_track">En bonne voie</option>
             <option value="at_risk">À risque</option>
             <option value="delayed">En retard</option>
             <option value="done">Terminé</option>
           </select>
         </div>

         <ProjectList projects={filteredProjects} title="Catalogue Général" icon={LayoutGrid} onShare={handleShare} />
      </div>
    </div>
  );
};

export default Dashboard;
