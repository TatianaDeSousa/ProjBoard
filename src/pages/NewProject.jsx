import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useContacts } from '../context/ContactContext';
import { Button, Card, Input, cn } from '../components/ui';
import { ChevronLeft, PlusCircle, Layout, User, Users } from 'lucide-react';

const NewProject = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const { contacts } = useContacts();
  const { currentUser, teams: userTeams } = useAuth();
  
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleClientChange = (val) => {
    setClient(val);
    if (val.includes('@')) {
      const parts = val.split('@');
      const query = parts[parts.length - 1].toLowerCase();
      
      // If there is anything after @, filter. Otherwise show all.
      const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.company.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectContact = (contact) => {
    const parts = client.split('@');
    parts[parts.length - 1] = contact.name;
    setClient(parts.join(''));
    setShowSuggestions(false);
  };
  const [isTeamProject, setIsTeamProject] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(userTeams.length > 0 ? userTeams[0].id : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !client || !deadline) return;
    
    const newProject = await createProject({
      name,
      client: client.replace('@', ''),
      deadline: new Date(deadline).toISOString(),
      description,
      teamId: isTeamProject ? selectedTeamId : null
    });
    
    if (newProject) navigate(`/project/${newProject.id}`);
    else navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl animate-in pb-32">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
            <ChevronLeft size={14} />
          </div>
          Annuler
        </Link>
      </div>

      <div className="flex flex-col items-center text-center gap-6 mb-16">
        <div className="w-20 h-20 gradient-primary text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20 scale-in">
          <PlusCircle size={40} />
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Initialiser une Mission</h1>
          <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
            "Chaque grand succès commence par une structure solide et une vision claire."
          </p>
        </div>
      </div>

      <Card className="p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none bg-white rounded-[3rem] ring-1 ring-black/5 scale-in">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Type de structure du projet</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                className={cn(
                  "py-8 px-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                  !isTeamProject ? "border-primary bg-primary/5 text-primary shadow-[0_10px_30px_rgba(99,102,241,0.15)] ring-1 ring-primary/20" : "border-slate-50 bg-slate-50/30 text-slate-300 grayscale hover:grayscale-0 hover:border-slate-200"
                )}
                onClick={() => setIsTeamProject(false)}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", !isTeamProject ? "bg-white shadow-md text-primary" : "bg-white text-slate-200")}>
                   <User size={24} />
                </div>
                <div className="text-center">
                  <span className="font-black text-lg block tracking-tight">Personnel</span>
                  <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Indépendant</span>
                </div>
              </button>
              <button
                type="button"
                className={cn(
                  "py-8 px-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                  isTeamProject ? "border-primary bg-primary/5 text-primary shadow-[0_10px_30px_rgba(99,102,241,0.15)] ring-1 ring-primary/20" : "border-slate-50 bg-slate-50/30 text-slate-300 grayscale hover:grayscale-0 hover:border-slate-200"
                )}
                onClick={() => {
                  setIsTeamProject(true);
                  if (!selectedTeamId && userTeams.length > 0) setSelectedTeamId(userTeams[0].id);
                }}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", isTeamProject ? "bg-white shadow-md text-primary" : "bg-white text-slate-200")}>
                   <Users size={24} />
                </div>
                <div className="text-center">
                  <span className="font-black text-lg block tracking-tight">Collectif</span>
                  <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Agence / Groupe</span>
                </div>
              </button>
            </div>
          </div>

          {isTeamProject && userTeams.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigner à une entité existante</label>
              <div className="grid grid-cols-1 gap-3">
                {userTeams.map(team => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    className={cn(
                      "text-left px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-between font-black tracking-tight",
                      selectedTeamId === team.id ? "bg-white border-primary text-primary shadow-lg shadow-primary/5" : "bg-slate-50/50 border-transparent text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <span>{team.name}</span>
                    <div className={cn("w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center", selectedTeamId === team.id ? "border-primary bg-primary" : "border-slate-200")}>
                       {selectedTeamId === team.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Intitulé de la mission *</label>
              <Input 
                placeholder="Ex: Identité Visuelle 2024" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="h-16 text-xl font-black shadow-inner bg-slate-50/50"
              />
            </div>

            <div className="space-y-3 relative">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Partenaire / Client * <span className="text-primary opacity-40 lowercase">(tapez @)</span></label>
              <div className="relative">
                <Input 
                  placeholder="Tapez @ pour suggérer..." 
                  value={client}
                  onChange={e => handleClientChange(e.target.value)}
                  onFocus={() => client.includes('@') && setShowSuggestions(true)}
                  required
                  className="h-16 text-xl font-black shadow-inner bg-slate-50/50"
                  autoComplete="off"
                />
                
                {showSuggestions && (
                  <Card className="absolute top-full mt-4 left-0 w-full z-50 shadow-[0_30px_60px_rgba(0,0,0,0.2)] border-none ring-1 ring-black/5 p-2 max-h-72 overflow-y-auto animate-in slide-in-from-top-4 duration-300">
                    <div className="p-2 space-y-1">
                      {suggestions.length > 0 ? (
                        suggestions.map(contact => (
                          <button
                            key={contact.id}
                            type="button"
                            className="w-full text-left px-5 py-4 hover:bg-primary/10 rounded-2xl transition-all flex items-center justify-between group"
                            onClick={() => selectContact(contact)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                 {contact.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 group-hover:text-primary transition-colors">{contact.name}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{contact.company}</span>
                              </div>
                            </div>
                            <User size={16} className="text-slate-200 group-hover:text-primary transition-colors" />
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 italic text-center">
                          Aucune entité correspondante...
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Échéance de livraison *</label>
              <Input 
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                required
                className="h-16 text-xl font-black shadow-inner bg-slate-50/50"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Objectifs et périmètre (Optionnel)</label>
              <textarea 
                className="flex min-h-[160px] w-full rounded-2xl border-none bg-slate-50/50 px-6 py-4 text-lg font-black tracking-tight ring-offset-background placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                placeholder="Quels sont les enjeux majeurs de cette collaboration ?"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-6 pt-8">
            <Button type="submit" className="flex-1 h-20 text-xl font-black gradient-primary border-none shadow-[0_20px_40px_rgba(99,102,241,0.25)] hover:scale-[1.02] rounded-[1.5rem] transition-all">
              Valider et Lancer le Projet
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-12 flex flex-col items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest px-8 text-center leading-relaxed">
        <Layout size={18} className="opacity-40" />
        <span>Le dossier sera généré instantanément dans votre écosystème.</span>
      </div>
    </div>
  );
};

export default NewProject;
