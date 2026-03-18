import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useContacts } from '../context/ContactContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, cn } from '../components/ui';
import { Plus, Target, Calendar, User, ChevronLeft, Briefcase, Sparkles, AlertCircle, Folder, Search } from 'lucide-react';

const NewProject = () => {
  const { createProject } = useProjects();
  const { folders } = useAuth();
  const { contacts } = useContacts();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [error, setError] = useState('');

  // Filtern suggestions based on search
  const suggestions = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(clientSearch.replace('@', '').toLowerCase()) || 
    (c.company || '').toLowerCase().includes(clientSearch.replace('@', '').toLowerCase())
  ).slice(0, 5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return setError('Le nom du projet est obligatoire.');
    
    try {
      const project = createProject({
        name,
        client: clientSearch.replace('@', ''),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        description,
        folderId: folderId || null
      });
      navigate(`/project/${project.id}`);
    } catch (err) {
      setError("Erreur lors de la création.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in pb-32">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-12 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="mb-16 px-4">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Initialiser une Mission</h1>
        <p className="text-xl text-slate-400 font-black italic tracking-tight">Utilisez @ pour appeler un contact existant</p>
      </div>

      <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] scale-in shadow-indigo-500/5 ring-1 ring-black/5">
        <form onSubmit={handleSubmit} className="space-y-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-sm font-black flex items-center gap-3 animate-in shake"><AlertCircle size={24} /> {error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Titre de la mission</label>
               <Input placeholder="ex: Refonte flyers tarifaires" value={name} onChange={e => setName(e.target.value)} required className="h-16 font-black text-lg shadow-inner ring-0 border-none bg-slate-50/50" />
            </div>
            
            <div className="space-y-3 relative">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Client (tapez @ pour suggérer)</label>
               <Input 
                 placeholder="@Dupont..." 
                 value={clientSearch} 
                 onFocus={() => setShowSuggestions(true)}
                 onBlur={() => setTimeout(() => setShowSuggestions(false), 200) }
                 onChange={e => { setClientSearch(e.target.value); setShowSuggestions(true); }} 
                 className="h-16 font-black text-lg shadow-inner ring-0 border-none bg-slate-50/50" 
               />
               
               {/* SUGGESTIONS INTELLIGENTES */}
               {showSuggestions && clientSearch.length > 0 && suggestions.length > 0 && (
                 <Card className="absolute z-50 w-full top-full mt-2 p-2 border-none shadow-2xl rounded-[1.5rem] bg-white ring-1 ring-primary/10 overflow-hidden animate-in">
                    {suggestions.map((c, i) => (
                      <div 
                        key={i} 
                        onClick={() => { setClientSearch(c.name); setShowSuggestions(false); }}
                        className="p-4 hover:bg-primary/5 cursor-pointer rounded-xl transition-all flex items-center justify-between group"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">{c.name.charAt(0)}</div>
                            <span className="font-black text-slate-700">{c.name}</span>
                         </div>
                         <span className="text-[10px] font-black uppercase text-slate-300 group-hover:text-primary">{c.company}</span>
                      </div>
                    ))}
                 </Card>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Échéance finale</label>
               <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="h-16 font-black text-lg shadow-inner border-none bg-slate-50/50" />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dossier de classement</label>
               <select 
                 className="w-full h-16 bg-slate-50/50 rounded-2xl border-none px-6 font-black text-lg shadow-inner ring-0 appearance-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                 value={folderId}
                 onChange={e => setFolderId(e.target.value)}
               >
                  <option value="">Mission isolée</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
               </select>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-4 block italic flex items-center gap-2"><Sparkles size={14} /> Brief / Notes initiales</label>
             <textarea 
               value={description} onChange={e => setDescription(e.target.value)}
               placeholder="Précisez ici les livrables attendus, les notes créatives ou contractuelles..."
               className="w-full h-40 bg-slate-50 border-none rounded-[2rem] p-8 font-bold text-slate-600 shadow-inner focus:ring-1 focus:ring-primary/20 transition-all resize-none"
             />
          </div>

          <div className="flex justify-end pt-10">
             <Button type="submit" className="h-20 px-16 font-black gradient-primary border-none shadow-2xl shadow-primary/30 rounded-[1.5rem] text-xl gap-4 flex items-center hover:scale-105 transition-all active:scale-95"><Plus size={32} /> Enregistrer ce Projet</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewProject;
