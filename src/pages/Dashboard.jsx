import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import AIAttackPlan from '../components/AIAttackPlan';
import VisualCalendar from '../components/VisualCalendar';
import { Plus, Search, Calendar, ChevronRight, AlertCircle, Users, LogOut, User, Contact, Activity, Briefcase, Bell, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProjectList = ({ projects, title, icon: Icon }) => (
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
          let deadlineStr = 'Pas de date';
          try {
            if (project.deadline) {
              deadlineStr = format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr });
            }
          } catch (e) {
            console.error("Error formatting date", e);
          }

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
                    
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Activity size={12} className={cn(
                          project.healthScore >= 70 ? "text-emerald-500" : 
                          project.healthScore >= 50 ? "text-orange-500" : "text-red-500"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{project.healthScore || 0}%</span>
                      </div>
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            project.healthScore >= 70 ? "bg-emerald-500" : 
                            project.healthScore >= 50 ? "bg-orange-500" : "bg-red-500"
                          )}
                          style={{ width: `${project.healthScore || 0}%` }}
                        />
                      </div>
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
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            project.status === 'delayed' ? "bg-red-500" : "bg-primary"
                          )}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const clientUrl = `${window.location.origin}/client?token=${project.share_token}`;
                        navigator.clipboard.writeText(clientUrl);
                        alert("Lien client copié !");
                      }}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary hover:text-indigo-700 transition-colors bg-primary/5 px-2 py-1 rounded-md"
                    >
                      <LinkIcon size={10} /> Lien Client
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ChevronRight size={16} />
                  </div>
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
  const { projects } = useProjects();
  const { currentUser, logout, teams, notifications } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const isSolo = teams.length === 0 || (teams.length === 1 && (teams[0].team_members || []).length <= 1);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeProjects = projects.filter(p => p.status !== 'done');
  const finishedThisMonth = projects.filter(p => {
    if (p.status !== 'done') return false;
    const projectDate = new Date(p.createdAt); 
    const now = new Date();
    return projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear();
  });

  const uniqueClients = new Set(activeProjects.map(p => p.client)).size;
  const delayedDeadlines = projects.filter(p => p.status === 'delayed').length;

  const deadlinesThisWeek = projects.filter(p => {
    if (p.status === 'done') return false;
    const deadline = new Date(p.deadline);
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return deadline >= now && deadline <= nextWeek;
  });

  const inValidation = projects.filter(p => {
    return p.milestones.some(m => 
      (m.name.toLowerCase().includes('validation')) && 
      (m.status === 'in_progress' || m.status === 'done') &&
      p.status !== 'done'
    );
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    return (a.healthScore || 100) - (b.healthScore || 100);
  });

  const personalProjects = filteredProjects.filter(p => !p.teamId);
  const teamProjects = filteredProjects.filter(p => p.teamId);

  return (
    <div className="container mx-auto px-4 py-8 animate-in text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            ProjBoard <Badge variant="secondary" className="text-[10px] h-5">PRO</Badge>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Bonjour, {currentUser.name}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/contacts">
            <Button variant="outline" size="sm" className="gap-2 font-bold h-10">
              <Contact size={16} /> Contacts
            </Button>
          </Link>
          <Link to="/teams">
            <Button variant="outline" size="sm" className="gap-2 font-bold h-10">
              <Users size={16} /> {isSolo ? "Créer un Groupe" : "Mes Groupes"}
            </Button>
          </Link>
          <Link to="/team-workload">
            <Button variant="outline" size="sm" className="gap-2 font-bold border-primary/20 text-primary hover:bg-primary/5 h-10">
              <Activity size={16} /> {isSolo ? "Mon Planning" : "Charge Équipe"}
            </Button>
          </Link>
          <Link to="/notifications" className="relative">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary transition-colors bg-white shadow-sm ring-1 ring-black/5">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/project/new">
            <Button size="sm" className="gap-2 font-bold shadow-lg shadow-primary/20 h-10">
              <Plus size={16} /> Nouveau
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-10 w-10 text-muted-foreground hover:text-red-600">
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 bg-indigo-50/50 border-indigo-100 shadow-none ring-1 ring-indigo-200/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1 relative z-10">Projets Actifs</p>
          <p className="text-4xl font-black text-indigo-900 relative z-10">{activeProjects.length}</p>
          <p className="text-[10px] text-indigo-500/60 font-black mt-2 italic uppercase tracking-tighter relative z-10">{uniqueClients} client(s) différents</p>
        </Card>
        
        <Card className="p-6 bg-orange-50/50 border-orange-100 shadow-none ring-1 ring-orange-200/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-500" />
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1 relative z-10">Deadlines Semaine</p>
          <p className="text-4xl font-black text-orange-900 relative z-10">{deadlinesThisWeek.length}</p>
          {delayedDeadlines > 0 && (
            <p className="text-[10px] text-orange-500 font-black mt-2 italic uppercase tracking-tighter relative z-10">dont {delayedDeadlines} en retard</p>
          )}
        </Card>

        <Card className="p-6 bg-sky-50/50 border-sky-100 shadow-none ring-1 ring-sky-200/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all duration-500" />
          <p className="text-xs font-black text-sky-600 uppercase tracking-widest mb-1 relative z-10">En validation</p>
          <p className="text-4xl font-black text-sky-900 relative z-10">{inValidation.length}</p>
          <p className="text-[10px] text-sky-500/60 font-black mt-2 italic uppercase tracking-tighter relative z-10">Attente retour client</p>
        </Card>

        <Card className="p-6 bg-emerald-50/50 border-emerald-100 shadow-none ring-1 ring-emerald-200/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1 relative z-10">Terminés / Mois</p>
          <p className="text-4xl font-black text-emerald-900 relative z-10">{finishedThisMonth.length}</p>
          <p className="text-[10px] text-emerald-500/60 font-black mt-2 italic uppercase tracking-tighter relative z-10">Performance stable</p>
        </Card>
      </div>

      <VisualCalendar projects={projects} />

      <AIAttackPlan projects={projects} />

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Rechercher un projet ou un client..." 
            className="pl-10 h-12 text-lg shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="flex h-12 rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-bold uppercase tracking-wider shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="on_track">En bonne voie</option>
            <option value="at_risk">À risque</option>
            <option value="delayed">En retard</option>
            <option value="done">Terminé</option>
          </select>
        </div>
      </div>

      <div className="space-y-16">
        <ProjectList 
          projects={personalProjects} 
          title="Mes Projets Organisés Particulier" 
          icon={User} 
        />

        <ProjectList 
          projects={teamProjects} 
          title="Projets d'Équipe & Agence" 
          icon={Briefcase} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
