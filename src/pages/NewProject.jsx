import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Badge, cn } from '../components/ui';
import { Plus, Target, Calendar, User, ChevronLeft, Send, Sparkles, AlertCircle } from 'lucide-react';

const NewProject = () => {
  const { createProject } = useProjects();
  const { teams } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return setError('Le nom du projet est obligatoire.');
    
    try {
      const project = createProject({
        name,
        client,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        description,
        teamId: teamId || null
      });
      navigate(`/project/${project.id}`);
    } catch (err) {
      setError("Erreur lors de la création.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="mb-16">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Lancer un Projet</h1>
        <p className="text-xl text-slate-400 font-medium italic">Enregistrement local automatique • Sécurisé par défaut</p>
      </div>

      <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] scale-in">
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3"><AlertCircle size={20} /> {error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du projet</label>
               <Input placeholder="ex: Refonte Site Web 2024" value={name} onChange={e => setName(e.target.value)} required className="h-14 font-black" />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du Client</label>
               <Input placeholder="ex: Agence Dupont" value={client} onChange={e => setClient(e.target.value)} className="h-14 font-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date Limite (Deadline)</label>
               <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="h-14 font-black" />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigner à un Groupe (Optionnel)</label>
               <select 
                 className="w-full h-14 bg-slate-50 rounded-xl border-none px-4 font-black shadow-inner"
                 value={teamId}
                 onChange={e => setTeamId(e.target.value)}
               >
                  <option value="">Projet Personnel</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
               </select>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes Stratégiques / Brief court</label>
             <textarea 
               value={description} onChange={e => setDescription(e.target.value)}
               placeholder="Points clés du projet, objectifs principaux…"
               className="w-full h-32 bg-slate-50 rounded-2xl border-none p-6 font-medium shadow-inner"
             />
          </div>

          <div className="flex justify-end pt-10">
             <Button type="submit" className="h-16 px-16 font-black gradient-primary border-none shadow-xl shadow-primary/20 rounded-[1.25rem] text-xl gap-4"><Plus size={24} /> Créer le Dossier</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewProject;
