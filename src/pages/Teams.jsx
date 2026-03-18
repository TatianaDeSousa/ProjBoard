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
  const { currentUser, teams, createTeam, deleteTeam, inviteUserToTeam } = useAuth();
  const { projects, updateProject } = useProjects();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null);

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    createTeam(newTeamName);
    setNewTeamName('');
    setIsCreating(false);
  };

  const handleAddMember = async (teamId) => {
    if (!memberEmail.trim()) return;
    setInviting(true);
    try {
      const result = await inviteUserToTeam(teamId, memberEmail);
      const inviteUrl = `${window.location.origin}/signup?invite=${result.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopyStatus(teamId);
      setMemberEmail('');
      setTimeout(() => setCopyStatus(null), 3000);
    } catch (err) {
      setError("Erreur cloud lors de l'invitation.");
    }
    setInviting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in text-slate-900">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
           <h1 className="text-5xl font-black tracking-tighter mb-4">Mes Groupes de Travail</h1>
           <p className="text-xl text-slate-400 font-medium italic">Organisation par entités • Partage local stable</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="h-14 px-8 font-black gradient-primary border-none shadow-xl shadow-primary/20 rounded-2xl gap-3"><Users size={24} /> Créer un Groupe</Button>
        )}
      </div>

      {isCreating && (
        <Card className="p-10 mb-12 border-none shadow-2xl bg-white rounded-[3rem] scale-in">
          <form onSubmit={handleCreateTeam} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-3 w-full">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du nouveau groupe</label>
               <Input placeholder="ex: Agence Web, Freelance Pro..." value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required className="h-14 font-black" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <Button type="submit" className="h-14 px-10 font-black gradient-primary border-none shadow-lg rounded-xl flex-1 md:flex-none">Lancer le groupe</Button>
               <Button variant="ghost" onClick={() => setIsCreating(false)} className="h-14 font-bold rounded-xl">Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-8">
        {teams.length === 0 ? (
          <div className="text-center py-20 bg-white shadow-sm border-2 border-dashed rounded-[3rem] text-slate-400 font-medium">Vous n'avez pas encore créé de groupe.</div>
        ) : (
          teams.map(team => (
            <Card key={team.id} className="p-8 border-none shadow-xl bg-white rounded-[2.5rem]">
               <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b pb-8 border-slate-50">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center"><Briefcase size={28} /></div>
                     <div>
                        <h2 className="text-2xl font-black">{team.name}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Géré par vous</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" onClick={() => deleteTeam(team.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={20} /></Button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* MEMBRES SECTION */}
                  <div className="space-y-6">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><UserPlus size={16} /> Inviter des Collaborateurs</h3>
                     <div className="flex gap-2">
                        <Input placeholder="Email du collaborateur…" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} className="h-12" />
                        <Button 
                          onClick={() => handleAddMember(team.id)} 
                          disabled={inviting}
                          className={cn("h-12 px-6 font-black rounded-xl border-none", copyStatus === team.id ? "bg-emerald-500 text-white" : "gradient-primary text-white")}
                        >
                           {copyStatus === team.id ? <Check size={20} /> : "Inviter"}
                        </Button>
                     </div>
                     {copyStatus === team.id && <p className="text-[10px] font-black text-emerald-500 uppercase">Lien d'invitation copié !</p>}
                  </div>

                  {/* PROJETS SECTION */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Activity size={16} /> Projets Liés</h3>
                     <div className="space-y-2">
                        {projects.filter(p => p.teamId === team.id).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                             <span className="font-black text-slate-700">{p.name}</span>
                             <Button variant="ghost" size="sm" onClick={() => updateProject(p.id, { teamId: null })} className="text-slate-300 hover:text-red-500"><X size={14} /></Button>
                          </div>
                        ))}
                        <div className="pt-2">
                           <select 
                             className="w-full h-12 bg-white rounded-xl border-2 border-slate-100 px-4 font-bold text-sm"
                             onChange={(e) => { if(e.target.value) updateProject(e.target.value, { teamId: team.id }); e.target.value = ""; }}
                           >
                              <option value="">Lier un projet existant…</option>
                              {projects.filter(p => !p.teamId).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                           </select>
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Teams;
