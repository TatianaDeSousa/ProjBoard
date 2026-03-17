import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, cn } from '../components/ui';
import { ChevronLeft, Users, Briefcase, AlertTriangle, TrendingUp, User, Target, Zap } from 'lucide-react';

const TeamWorkload = () => {
  const { projects } = useProjects();
  const { currentUser, teams } = useAuth();
  
  // Real project stats
  const activeProjects = projects.filter(p => p.status !== 'done');
  const personalProjects = activeProjects.filter(p => !p.team_id);
  const teamProjects = activeProjects.filter(p => p.team_id);

  // Consider solo if no teams
  const isSolo = teams.length === 0 || (teams.length === 1 && (teams[0].team_members || []).length <= 1);

  return (
    <div className="container mx-auto px-4 py-8 animate-in text-slate-900">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors">
        <Link to="/" className="flex items-center gap-1">
          <ChevronLeft size={16} /> Retour au tableau de bord
        </Link>
      </div>

      <div className="flex justify-between items-end mb-16 px-2">
        <div>
          <h1 className="text-5xl font-black tracking-tight flex flex-col md:flex-row md:items-center gap-4 text-slate-900">
            {isSolo ? "Mon Planning Stratégique" : "Charge de Travail & Équipe"} 
            <Badge variant="secondary" className="bg-primary/10 text-primary uppercase font-black px-4 py-1 glass border-primary/20 w-fit">
              {isSolo ? "Individuel" : "Collaboratif"}
            </Badge>
          </h1>
          <p className="text-xl text-muted-foreground mt-4 font-medium max-w-2xl leading-relaxed">
            {isSolo 
              ? "Optimisez votre temps et visualisez vos capacités réelles en un coup d'œil." 
              : "Équilibrez les efforts entre vos collaborateurs pour maintenir une performance optimale."}
          </p>
        </div>
        <div className="p-6 bg-white shadow-xl shadow-primary/5 ring-1 ring-black/5 rounded-3xl hidden lg:flex items-center justify-center animate-in slide-in-from-right-4 duration-700">
           {isSolo ? <User className="text-primary" size={32} /> : <Users className="text-primary" size={32} />}
        </div>
      </div>

      {isSolo ? (
        /* SOLO VIEW: Capacity and focus for individuals / students */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-10 border-none shadow-2xl shadow-indigo-500/5 bg-white scale-in">
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <Target size={28} />
                   </div>
                   <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black">CAPACITÉ</Badge>
                </div>
                <h3 className="text-2xl font-black mb-2 text-slate-900">Saturation Personnelle</h3>
                <p className="text-sm text-muted-foreground mb-8 font-medium">Analyse temps réel de vos {activeProjects.length} projets actifs.</p>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-5xl font-black tabular-nums tracking-tighter text-slate-900">{Math.min(100, activeProjects.length * 20)}%</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Charge Mentale</span>
                  </div>
                  <div className="h-5 w-full bg-slate-50 rounded-full overflow-hidden p-1 ring-1 ring-slate-100">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-sm",
                        activeProjects.length > 4 ? "bg-red-500" : activeProjects.length > 2 ? "bg-orange-500" : "gradient-primary"
                      )}
                      style={{ width: `${Math.min(100, activeProjects.length * 20)}%` }}
                    />
                  </div>
                  <p className="text-xs italic text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    {activeProjects.length > 4 ? "⚠️ Attention, vous risquez la surcharge. Pensez à déléguer ou dire non." : "Votre emploi du temps est équilibré. Prêt pour de nouveaux défis."}
                  </p>
                </div>
              </Card>

              <Card className="p-10 border-none shadow-2xl shadow-slate-900/10 bg-slate-900 text-white relative overflow-hidden group scale-in [animation-delay:100ms]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:opacity-100 transition-opacity opacity-50" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-[60px]" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-white/10 text-primary-foreground rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 ring-1 ring-white/5">
                        <Zap size={28} className="fill-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-2">Focus Stratégique</h3>
                  <p className="text-sm text-slate-400 mb-8 font-medium">Priorités immédiates pour maximiser votre impact aujourd'hui.</p>
                  
                  <div className="space-y-3 mt-auto">
                    {activeProjects.length > 0 ? activeProjects.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        <span className="text-xs font-bold truncate tracking-tight">{p.name}</span>
                      </div>
                    )) : (
                      <p className="text-sm italic text-slate-500">Aucun projet urgent. Profitez-en pour planifier !</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-10 border-none shadow-xl shadow-slate-900/5 bg-white/80 glass scale-in [animation-delay:200ms]">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
                <Briefcase size={24} className="text-primary" /> Architecture de vos Activités
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <span className="text-sm font-black uppercase tracking-widest text-slate-500">Projets Équipe</span>
                     <span className="text-lg font-black text-slate-900">{teamProjects.length} dossier(s)</span>
                   </div>
                   <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 ring-1 ring-slate-100">
                     <div className="h-full bg-indigo-500 rounded-full shadow-sm shadow-indigo-200" style={{ width: `${(teamProjects.length / activeProjects.length) * 100 || 0}%` }} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Temps de collaboration et synchro</p>
                 </div>
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <span className="text-sm font-black uppercase tracking-widest text-slate-500">Projets Solo</span>
                     <span className="text-lg font-black text-slate-900">{personalProjects.length} dossier(s)</span>
                   </div>
                   <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 ring-1 ring-slate-100">
                     <div className="h-full gradient-primary rounded-full shadow-sm shadow-indigo-200" style={{ width: `${(personalProjects.length / activeProjects.length) * 100 || 0}%` }} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Temps de production profonde</p>
                 </div>
              </div>
            </Card>
          </div>

          <Card className="p-10 bg-indigo-600/5 border-none shadow-none ring-1 ring-indigo-500/10 rounded-[2.5rem] space-y-8 h-fit animate-in slide-in-from-right-4 duration-1000">
             <div className="p-4 bg-white rounded-2xl w-fit shadow-xl shadow-indigo-500/10">
                <Users size={24} className="text-indigo-600" />
             </div>
             <div className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Conseils Antigravité Pro</h3>
               <p className="text-base leading-relaxed text-slate-700 italic font-medium">
                 "Pour un leadership efficace, séparez vos matins de 'Deep Work' (production) de vos après-midis de 'Collaboration' (groupes). Votre cerveau vous remerciera."
               </p>
             </div>
             <div className="pt-8 border-t border-indigo-500/10 space-y-6">
                <div className="flex items-start gap-5 group">
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-xs font-black text-indigo-600">01</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-tight pt-2">Vérifiez les deadlines critiques dans le Dashboard.</p>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-xs font-black text-indigo-600">02</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-tight pt-2">Maintenez le Journal de bord pour une traçabilité totale.</p>
                </div>
             </div>
          </Card>
        </div>
      ) : (
        /* TEAM VIEW: Collaboration and multi-user workload */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Collect all team members across all teams */}
          {Array.from(new Set(teams.flatMap(t => t.members))).map((memberId, idx) => {
            const isMe = memberId === currentUser?.id;
            const memberObj = users.find(u => u.id === memberId);
            const memberName = isMe ? "Moi (Vous)" : (memberObj?.name || `Utilisateur ${memberId.slice(0,4)}`);
            
            // Filter projects assigned to this member's teams
            const memberTeams = teams.filter(t => t.members.includes(memberId));
            const memberTeamIds = memberTeams.map(t => t.id);
            const projectsInMemberScope = activeProjects.filter(p => memberTeamIds.includes(p.teamId));
            
            // Count milestones specifically assigned to this member in those projects
            let assignedMilestonesCount = 0;
            projectsInMemberScope.forEach(p => {
              assignedMilestonesCount += p.milestones.filter(m => m.assigneeId === memberId && m.status !== 'done').length;
            });

            const projCount = projectsInMemberScope.length;
            const isOverloaded = assignedMilestonesCount >= 8 || projCount >= 5;

            return (
              <Card key={memberId} className={cn(
                "p-10 border-none shadow-2xl transition-all hover:-translate-y-2 group scale-in",
                isOverloaded ? "bg-red-50/50 shadow-red-500/10 ring-1 ring-red-100" : "bg-white shadow-slate-900/5"
              )} style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex justify-between items-start mb-10">
                  <div className={cn(
                    "w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-xl font-black uppercase shadow-2xl transition-transform group-hover:rotate-6",
                    isMe ? "bg-primary text-white shadow-primary/20" : "bg-slate-100 text-slate-700 shadow-slate-200"
                  )}>
                    {memberName.charAt(0)}
                  </div>
                  {isOverloaded && (
                    <Badge className="bg-red-500 text-white border-none py-1 px-3 shadow-lg shadow-red-500/20 animate-pulse">Surcharge</Badge>
                  )}
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="font-black text-2xl truncate text-slate-900" title={memberName}>{memberName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                      {isMe ? "Directeur Associé" : "Collaborateur Senior"}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-5xl font-black tabular-nums tracking-tighter text-slate-900">{projCount}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Dossiers</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-black tabular-nums tracking-tighter text-slate-600">{assignedMilestonesCount}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tâches</span>
                      </div>
                    </div>
                    
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden p-1 ring-1 ring-slate-100/50">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          isOverloaded ? "bg-red-500" : isMe ? "gradient-primary" : "bg-blue-500"
                        )}
                        style={{ width: `${Math.min(100, (assignedMilestonesCount / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Global Action Card */}
      {!isSolo && (
        <Card className="mt-24 p-12 bg-slate-900 text-white border-none rounded-[3rem] overflow-hidden relative shadow-[0_20px_50px_rgba(30,41,59,0.3)] animate-in slide-in-from-bottom-8 duration-1000">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-4xl font-black mb-6 tracking-tight">Recrutez un talent sur-mesure ?</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Connectez-vous à vos contacts experts pour renforcer vos équipes projets en un clic, sans lourdeur administrative.
              </p>
            </div>
            <Link to="/contacts">
               <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-black px-12 h-16 shadow-2xl">
                 Annuaire Collaborateurs
               </Button>
            </Link>
          </div>
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] -mr-64 -mt-64" />
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] -ml-40 -mb-40" />
        </Card>
      )}
    </div>
  );
};

export default TeamWorkload;
