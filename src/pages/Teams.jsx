import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Badge, cn } from '../components/ui';
import { 
  Users, UserPlus, ChevronLeft, Check, Plus, 
  Briefcase, Activity, CheckCircle2, User, 
  Settings2, Mail, Trash2, X, Link as LinkIcon 
} from 'lucide-react';

const Teams = () => {
  const { currentUser, teams, createTeam, deleteTeam, inviteUserToTeam, acceptTeamInvitation } = useAuth();
  const { projects, updateProject } = useProjects();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [showProjectLinker, setShowProjectLinker] = useState(null);
  const [error, setError] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setSaving(true);
    try {
      console.log('[Teams] createTeam:', newTeamName);
      await createTeam(newTeamName);
      setNewTeamName('');
      setIsCreating(false);
      console.log('[Teams] team created');
    } catch (err) {
      console.error('[Teams] createTeam error:', err);
      setError(err.message || 'Erreur lors de la création du groupe.');
      setTimeout(() => setError(null), 4000);
    }
    setSaving(false);
  };

  const handleAddMember = async (teamId) => {
    if (!memberEmail.trim()) return;
    setInviting(true);
    try {
      console.log('[Teams] inviteUserToTeam:', teamId, memberEmail);
      const result = await inviteUserToTeam(teamId, memberEmail);
      console.log('[Teams] invite result:', result);
      if (result.type === 'internal') {
        alert('Invitation envoyée au collaborateur !');
        setMemberEmail('');
      } else {
        setInviteResult({ ...result, email: memberEmail });
        setMemberEmail('');
      }
      setError(null);
    } catch (err) {
      console.error('[Teams] inviteUserToTeam error:', err);
      setError(err.message || 'Erreur lors de l\'invitation.');
      setTimeout(() => setError(null), 4000);
    }
    setInviting(false);
  };

  const toggleProjectToTeam = async (projectId, teamId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const newTeamId = project.team_id === teamId ? null : teamId;
    await updateProject(projectId, { team_id: newTeamId });
  };

  const getTeamProjects = (teamId) => {
    return projects.filter(p => p.team_id === teamId);
  };

  const getUserName = (userId) => {
    const member = teams.flatMap(t => t.team_members || []).find(m => m.user_id === userId);
    if (member?.profiles) return member.profiles.name;
    if (userId === currentUser?.id) return currentUser.name || currentUser.email;
    return userId?.slice(0, 8) || 'Inconnu';
  };

  const getMemberProgress = (team) => {
    const teamProjects = getTeamProjects(team.id);
    const memberIds = (team.team_members || []).map(m => m.user_id);
    const memberStats = {};
    memberIds.forEach(id => { memberStats[id] = { total: 0, done: 0 }; });
    teamProjects.forEach(project => {
      (project.milestones || []).forEach(m => {
        const key = m.assignee_id;
        if (key && memberStats[key]) {
          memberStats[key].total++;
          if (m.status === 'done') memberStats[key].done++;
        }
      });
    });
    return memberStats;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl animate-in pb-24">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
            <ChevronLeft size={14} />
          </div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 px-2">
        <div className="flex-1">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Mes Groupes Stratégiques</h1>
          <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
            "Fédérez vos forces et orchestrez vos collaborations en totale transparence."
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className={cn(
          "gap-3 h-14 px-8 font-black rounded-2xl transition-all",
          isCreating ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "gradient-primary border-none shadow-xl shadow-primary/20"
        )}>
          {isCreating ? "Annuler l'édition" : <><Plus size={24} /> Créer un Groupe</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-12 mb-16 border-none shadow-2xl bg-white scale-in">
          <form onSubmit={handleCreateTeam} className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-1 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom de l'entité / de l'agence</label>
              <Input 
                placeholder="Ex: Agence Architecture & Co" 
                value={newTeamName} 
                onChange={e => setNewTeamName(e.target.value)} 
                required 
                className="h-14 font-black text-xl shadow-inner bg-slate-50/50"
              />
            </div>
            <Button type="submit" disabled={saving} className="h-14 px-12 font-black gradient-primary border-none shadow-lg disabled:opacity-70">
              {saving ? 'Création…' : 'Lancer le groupe'}
            </Button>
          </form>
        </Card>
      )}

      {error && (
        <div className="mb-10 p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4 text-sm font-black animate-in shadow-xl shadow-red-500/5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm"><X size={18} /></div>
          {error}
        </div>
      )}

      <div className="grid gap-16">
        {teams.length === 0 ? (
          <div className="py-32 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200 scale-in">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-8 text-slate-200">
               <Users size={48} />
            </div>
            <p className="text-2xl font-black text-slate-400 tracking-tight">Aucun groupe actif pour le moment.</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">Démarrez votre première collaboration en un clic.</p>
          </div>
        ) : (
          teams.map((team, idx) => {
            const teamProjects = getTeamProjects(team.id);
            const memberStats = getMemberProgress(team);
            const isOwner = team.owner_id === currentUser.id;
            const members = team.team_members || [];

            return (
              <Card key={team.id} className="p-0 shadow-2xl shadow-indigo-500/5 border-none bg-white rounded-[3rem] overflow-hidden scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="p-10 bg-slate-50/30 border-b border-slate-50">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                         <h3 className="text-4xl font-black tracking-tighter text-slate-900">{team.name}</h3>
                         <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-4 py-1 glass border-primary/10">
                           {members.length} OPS
                         </Badge>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-3">
                         <div className="flex -space-x-2">
                            {members.slice(0, 3).map(m => (
                               <div key={m.user_id} className="w-8 h-8 rounded-full bg-white ring-2 ring-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                 {getUserName(m.user_id).charAt(0)}
                               </div>
                            ))}
                         </div>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                           Lead: <span className="text-slate-900">{isOwner ? "Vous" : getUserName(team.owner_id)}</span>
                         </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <Button 
                        variant="outline"
                        onClick={() => setShowProjectLinker(showProjectLinker === team.id ? null : team.id)}
                        className="gap-3 h-12 px-6 font-black rounded-2xl bg-white border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary shadow-sm"
                      >
                        <LinkIcon size={18} /> Rattacher un Dossier
                      </Button>
                      {isOwner && (
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => {
                            if(confirm(`Supprimer le groupe "${team.name}" ?`)) deleteTeam(team.id);
                          }}
                          className="h-12 w-12 rounded-2xl shadow-lg shadow-red-500/10"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left Column: Members & Task Progress */}
                  <div className="p-10 border-b lg:border-b-0 lg:border-r border-slate-50">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Activity size={16} className="text-primary" /> Tracking Équipe
                      </h4>
                      <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl ring-1 ring-slate-200/50 w-full md:w-auto">
                        <Input 
                          placeholder="Email invité..." 
                          className="h-10 text-xs border-none bg-transparent shadow-none w-full md:w-48 font-bold"
                          value={memberEmail}
                          onChange={e => setMemberEmail(e.target.value)}
                        />
                        <Button size="icon" onClick={() => handleAddMember(team.id)} className="h-10 w-10 shrink-0 font-black gradient-primary border-none shadow-md shadow-primary/20">
                          <Plus size={18} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {members.map(member => {
                        const memberId = member.user_id;
                        const stats = memberStats[memberId] || { total: 0, done: 0 };
                        const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                        const isSelf = memberId === currentUser.id;

                        return (
                          <div key={memberId} className="group relative flex items-center gap-5 p-5 bg-white rounded-3xl ring-1 ring-black/5 hover:ring-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-lg shadow-inner ring-4 ring-white">
                              {getUserName(memberId).charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-black text-slate-900 tracking-tight">
                                  {getUserName(memberId)} {isSelf && "(Vous)"}
                                </span>
                                <Badge className="bg-slate-50 text-slate-900 border-none text-[10px] font-black">{progress}%</Badge>
                              </div>
                              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5">
                                <div 
                                  className="h-full gradient-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.3)]" 
                                  style={{ width: `${progress}%` }} 
                                />
                              </div>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">
                                Performance : {stats.done} / {stats.total} tasks
                              </p>
                            </div>
                            {isOwner && !isSelf && (
                              <button 
                                onClick={() => removeMemberFromTeam(team.id, memberId)}
                                className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Projects Linked */}
                  <div className="p-10 bg-slate-50/20">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-10">
                      <Briefcase size={16} className="text-primary" /> Missions Groupées
                    </h4>

                    {showProjectLinker === team.id && (
                      <Card className="mb-10 p-8 bg-white rounded-[2rem] shadow-2xl border-none ring-1 ring-primary/20 scale-in">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Sélectionnez les dossiers à synchroniser :</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {projects.map(p => (
                            <button
                              key={p.id}
                              onClick={() => toggleProjectToTeam(p.id, team.id)}
                              className={cn(
                                "w-full text-left p-4 rounded-2xl text-sm transition-all flex items-center justify-between border-2",
                                p.team_id === team.id ? "bg-primary/5 border-primary text-primary font-black" : "bg-slate-50/50 border-transparent hover:bg-slate-50 text-slate-600 font-bold"
                              )}
                            >
                              <span>{p.name}</span>
                              {p.team_id === team.id && <CheckCircle2 size={18} />}
                            </button>
                          ))}
                        </div>
                      </Card>
                    )}

                    <div className="space-y-4">
                      {teamProjects.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-40 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                          <Briefcase size={40} className="text-slate-300 mb-4" />
                          <p className="text-sm font-bold text-slate-400">Aucun dossier rattaché à ce groupe.</p>
                        </div>
                      ) : (
                        teamProjects.map(p => (
                          <Link key={p.id} to={`/project/${p.id}`} className="block group">
                            <div className="flex items-center justify-between p-6 bg-white rounded-[1.5rem] ring-1 ring-black/5 group-hover:ring-primary/40 transition-all group-hover:shadow-2xl group-hover:shadow-primary/5">
                              <div className="flex items-center gap-4">
                                 <div className={cn(
                                   "w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                                   p.status === 'on_track' ? "bg-primary shadow-primary/30" : 
                                   p.status === 'at_risk' ? "bg-orange-500 shadow-orange-500/30" : "bg-red-500 shadow-red-500/30"
                                 )} />
                                 <div className="flex flex-col">
                                   <span className="font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{p.name}</span>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.client}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact</p>
                                   <p className="text-sm font-black text-slate-900">{p.progress}%</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                  <ChevronLeft size={18} className="rotate-180" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {inviteResult && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-10 bg-white shadow-2xl rounded-[3rem] border-none scale-in">
             <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8">
               <Mail size={40} />
             </div>
             <h2 className="text-3xl font-black text-center text-slate-900 mb-4 tracking-tighter">Inviter à nous rejoindre</h2>
             <p className="text-center text-slate-500 font-medium mb-10">
               L'utilisateur <span className="text-slate-900 font-black">{inviteResult.email}</span> n'a pas encore de compte. Partagez-lui ce lien d'accès privilégié :
             </p>
             
             <div className="bg-slate-50 p-6 rounded-3xl mb-8 ring-1 ring-black/5 flex items-center gap-4 group">
               <div className="flex-1 overflow-hidden">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lien d'invitation unique</p>
                 <p className="text-sm font-bold text-slate-900 truncate">
                   {`${window.location.origin}/signup?inviteToken=${inviteResult.token}`}
                 </p>
               </div>
               <Button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/signup?inviteToken=${inviteResult.token}`);
                  alert("Lien copié !");
                }}
                className="shrink-0 h-10 w-10 p-0 rounded-xl gradient-primary border-none shadow-lg shadow-primary/20"
               >
                 <LinkIcon size={18} />
               </Button>
             </div>

             <div className="flex flex-col gap-3">
               <Button onClick={() => setInviteResult(null)} className="h-14 w-full rounded-2xl font-black text-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                 Terminer
               </Button>
               <p className="text-[10px] font-black uppercase text-center text-slate-400 tracking-[0.2em] mt-2">Dès son inscription, il rejoindra automatiquement le groupe.</p>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Teams;
