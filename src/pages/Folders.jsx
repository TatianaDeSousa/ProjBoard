import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Badge, cn } from '../components/ui';
import { 
  Folder, ChevronLeft, Plus, 
  Briefcase, Activity, Trash2, X, LayoutGrid, ChevronRight, User
} from 'lucide-react';

const Folders = () => {
  const { folders, createFolder, deleteFolder } = useAuth();
  const { projects, updateProject } = useProjects();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName);
    setNewFolderName('');
    setIsCreating(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in text-slate-900 pb-40">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 px-4">
        <div>
           <h1 className="text-5xl font-black tracking-tighter mb-4">Mes Dossiers Clients</h1>
           <p className="text-xl text-slate-400 font-black italic tracking-tight">Regroupez vos missions par entité ou par client</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="h-14 px-8 font-black bg-slate-900 text-white border-none shadow-xl rounded-2xl gap-3 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"><Plus size={24} /> Créer un Dossier</Button>
        )}
      </div>

      {isCreating && (
        <Card className="p-10 mb-12 border-none shadow-2xl bg-white rounded-[3rem] animate-in ring-1 ring-black/5">
          <form onSubmit={handleCreateFolder} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-3 w-full">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du dossier client (ex: DUPOND)</label>
               <Input placeholder="Client DUPOND, PROJET LOGO, etc..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} required className="h-16 font-black text-xl shadow-inner border-none bg-slate-50" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <Button type="submit" className="h-16 px-12 font-black gradient-primary border-none shadow-lg rounded-2xl flex-1 md:flex-none">Initialiser</Button>
               <Button variant="ghost" onClick={() => setIsCreating(false)} className="h-16 font-bold rounded-2xl border-none">Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-10 px-4">
        {folders.length === 0 ? (
          <div className="text-center py-24 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black text-xl italic tracking-widest">Aucun dossier créé pour le moment.</div>
        ) : (
          folders.map(folder => (
            <Card key={folder.id} className="p-10 border-none shadow-xl bg-white rounded-[3rem] ring-1 ring-black/5 hover:shadow-2xl transition-all scale-in">
               <div className="flex justify-between items-center mb-10 pb-10 border-b border-slate-50">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black shadow-lg shadow-primary/10"><Folder size={32} /></div>
                     <div>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900">{folder.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] px-3 uppercase tracking-widest">{ projects.filter(p => p.folderId === folder.id).length } projet(s)</Badge>
                        </div>
                     </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { if(confirm('Supprimer ce dossier ?')) deleteFolder(folder.id); }} className="text-slate-200 hover:text-red-500 rounded-xl"><Trash2 size={24} /></Button>
               </div>

               <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2 ml-2 italic underline underline-offset-4 decoration-primary/20"><LayoutGrid size={14} /> Missions contenues dans le dossier</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {projects.filter(p => p.folderId === folder.id).map(p => (
                       <div key={p.id} className="group relative">
                          <Link to={`/project/${p.id}`} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] transition-all hover:bg-white hover:ring-2 hover:ring-primary/20 hover:shadow-xl hover:shadow-primary/5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform"><Briefcase size={20} /></div>
                                <div>
                                   <span className="font-black text-lg text-slate-700 block group-hover:text-primary transition-colors">{p.name}</span>
                                   <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-primary/50">{p.client}</span>
                                </div>
                             </div>
                             <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateProject(p.id, { folderId: null }); }} 
                            className="absolute -top-2 -right-2 h-8 w-8 bg-white shadow-md border-none text-slate-300 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                          >
                            <X size={14} />
                          </Button>
                       </div>
                     ))}
                     
                     <div className="pt-2">
                        <div className="h-full flex flex-col justify-center">
                           <select 
                             className="w-full h-16 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[1.5rem] px-6 font-black text-sm text-slate-400 cursor-pointer focus:ring-1 focus:ring-primary/20 hover:bg-white hover:border-primary/20 transition-all appearance-none"
                             onChange={(e) => { if(e.target.value) updateProject(e.target.value, { folderId: folder.id }); e.target.value = ""; }}
                           >
                              <option value="">+ Déplacer un autre projet ici...</option>
                              {projects.filter(p => !p.folderId).map(p => (
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

export default Folders;
