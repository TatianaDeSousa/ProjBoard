import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import AIAttackPlan from '../components/AIAttackPlan';
import VisualCalendar from '../components/VisualCalendar';
import { Plus, Search, Calendar, ChevronRight, AlertCircle, Users, LogOut, User, Contact, Activity, Briefcase, Bell, Link as LinkIcon, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProjectList = ({ projects, title, icon: Icon, onShare }) => (
  <div className="space-y-6 mb-12">
    <div className="flex items-center gap-3 border-b pb-4">
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        <Icon size={20} />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <Badge variant="secondary" className="ml-auto font-black">{projects.length}</Badge>
    </div>
    
    {projects.length === 0 ? (
      <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed">
        <p className="text-muted-foreground text-sm italic">Aucun projet dans cette catégorie.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          let deadlineStr = project.deadline ? format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr }) : 'Pas de date';
          return (
            <Link key={project.id} to={`/project/${project.id}`} className="block h-full transition-all duration-300 hover:scale-[1.02]">
              <Card className="p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all border-none h-full flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          project.status === 'delayed' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                          project.status === 'at_risk' ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : 
                          project.status === 'on_track' ? "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        )} />
                        <Badge variant="outline" className="text-[9px] font-black py-0 px-2 h-4 border-primary/10">
                          {project.status === 'on_track' ? 'En bonne voie' : 
                           project.status === 'at_risk' ? 'À risque' : 
                           project.status === 'delayed' ? 'En retard' : 'Terminé'}
                        </Badge>
                      </div>
                      <h3 className="font-extrabold text-xl leading-tight text-slate-900 group-hover:text-primary transition-colors truncate">{project.name}</h3>
                      <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">{project.client}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] mb-2 text-slate-400 font-black uppercase tracking-widest">
                        <span>Avancement</span>
                        <span className="text-slate-900">{project.progress || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 ring-1 ring-slate-100">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-700", project.status === 'delayed' ? "bg-red-500" : "bg-primary")}
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-50 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{deadlineStr}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(project.id); }}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary hover:text-indigo-700 transition-colors bg-primary/5 px-2 py-1 rounded-md"
                    >
                      <LinkIcon size={10} /> Partager
                    </button>
                  </div>
                  <ChevronRight size={16} className="text-slate-200 group-hover:text-primary transition-all" />
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
  const { currentUser, logout, teams, notifications } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleShare = async (id) => {
    try {
      const token = await getShareLink(id);
      const url = `${window.location.origin}/client?token=${token}`;
      await navigator.clipboard.writeText(url);
      alert("Lien client (cloud) copié !");
    } catch (e) { alert("Erreur cloud."); }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (project.client || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = projects.filter(p => p.status !== 'done');
  const finishedThisMonth = projects.filter(p => p.status === 'done' && new Date(p.updatedAt).getMonth() === new Date().getMonth());
  const uniqueClients = new Set(activeProjects.map(p => p.client)).size;
  const delayedDeadlines = projects.filter(p => p.status === 'delayed').length;

  const zombieProjects = projects.filter(p => {
    if (p.status === 'done') return false;
    const hasActivity = (p.milestones || []).some(m => m.status === 'done');
    const overdue = p.deadline && new Date(p.deadline) < new Date();
    return !hasActivity && overdue;
  });

  const personalProjects = filteredProjects.filter(p => !p.teamId);
  const teamProjects = filteredProjects.filter(p => p.teamId);

  return (
    <div className="container mx-auto px-4 py-8 animate-in text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">ProjBoard <Badge variant="secondary" className="text-[10px]">HYBRIDE</Badge></h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Dashboard Local • Auth Cloud • Partage Sécurisé</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/contacts"><Button variant="outline" className="gap-2 font-bold h-10"><Contact size={16} /> Contacts</Button></Link>
          <Link to="/teams"><Button variant="outline" className="gap-2 font-bold h-10"><Users size={16} /> Groupes</Button></Link>
          <Link to="/notifications" className="relative">
            <Button variant="ghost" className="h-10 w-10 bg-white shadow-sm ring-1 ring-black/5"><Bell size={18} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
            </Button>
          </Link>
          <Link to="/project/new"><Button className="gap-2 font-bold shadow-lg shadow-primary/20 h-10"><Plus size={16} /> Nouveau</Button></Link>
          <Button variant="ghost" onClick={handleLogout} className="h-10 w-10 text-muted-foreground hover:text-red-600"><LogOut size={18} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 bg-indigo-50/50 border-indigo-100">
          <p className="text-xs font-black text-indigo-600 uppercase mb-1">Dossiers Actifs</p>
          <p className="text-4xl font-black text-indigo-900">{activeProjects.length}</p>
        </Card>
        <Card className="p-6 bg-red-50/50 border-red-100">
          <p className="text-xs font-black text-red-600 uppercase mb-1">Alertes Retard</p>
          <p className="text-4xl font-black text-red-900">{delayedDeadlines}</p>
        </Card>
        <Card className="p-6 bg-emerald-50/50 border-emerald-100">
          <p className="text-xs font-black text-emerald-600 uppercase mb-1">Terminés / Mois</p>
          <p className="text-4xl font-black text-emerald-900">{finishedThisMonth.length}</p>
        </Card>
        <Card className="p-6 bg-orange-50/50 border-orange-100">
          <p className="text-xs font-black text-orange-600 uppercase mb-1">Zombies 🧟</p>
          <p className="text-4xl font-black text-orange-900">{zombieProjects.length}</p>
        </Card>
      </div>

      {zombieProjects.length > 0 && (
         <div className="mb-16 space-y-4">
            <div className="flex items-center gap-3 border-b-2 border-red-100 pb-4">
               <AlertCircle className="text-red-500" />
               <h2 className="text-2xl font-black text-red-600">Projets Zombies</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {zombieProjects.map(z => (
                 <Link key={z.id} to={`/project/${z.id}`}>
                   <Card className="p-6 border-red-200 bg-red-50/20 hover:bg-red-50 transition-all">
                      <h3 className="font-black text-red-700">{z.name}</h3>
                      <p className="text-xs text-red-400 font-bold uppercase">{z.client}</p>
                   </Card>
                 </Link>
               ))}
            </div>
         </div>
      )}

      <VisualCalendar projects={projects} />
      <AIAttackPlan projects={projects} />

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <Search className="text-muted-foreground mr-2" />
        <Input placeholder="Rechercher…" className="h-12 text-lg shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="space-y-16">
        <ProjectList projects={personalProjects} title="Mes Dossiers Privés" icon={User} onShare={handleShare} />
        <ProjectList projects={teamProjects} title="Collaborations Équipe" icon={Briefcase} onShare={handleShare} />
      </div>
    </div>
  );
};

export default Dashboard;
