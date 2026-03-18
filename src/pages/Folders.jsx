import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Badge, cn } from '../components/ui';
import { 
  Folder, ChevronLeft, Plus, 
  Briefcase, Activity, Trash2, X, LayoutGrid 
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
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in text-slate-900 pb-32">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 px-2">
        <div>
           <h1 className="text-5xl font-black tracking-tighter mb-4">Mes Dossiers Clients</h1>
           <p className="text-xl text-slate-400 font-medium italic">Classez vos projets par catégorie ou par client</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="h-14 px-8 font-black bg-slate-900 text-white border-none shadow-xl rounded-2xl gap-3 hover:bg-slate-800 transition-all"><Plus size={24} /> Créer un Dossier</Button>
        )}
      </div>

      {isCreating && (
        <Card className="p-10 mb-12 border-none shadow-2xl bg-white rounded-[3rem] scale-in ring-1 ring-black/5">
          <form onSubmit={handleCreateFolder} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-3 w-full">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du dossier client (ex: DUPOND)</label>
               <Input placeholder="DUPOND, LOGO DESIGN, ACME..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} required className="h-14 font-black" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <Button type="submit" className="h-14 px-10 font-black gradient-primary border-none shadow-lg rounded-xl flex-1 md:flex-none">Créer</Button>
               <Button variant="ghost" onClick={() => setIsCreating(false)} className="h-14 font-bold rounded-xl border-none">Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {folders.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-bold">Aucun dossier créé pour le moment.</div>
        ) : (
          folders.map(folder => (
            <Card key={folder.id} className="p-8 border-none shadow-xl bg-white rounded-[2.5rem] ring-1 ring-black/5 hover:shadow-2xl transition-all scale-in">
               <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-50">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center font-black"><Folder size={28} /></div>
                     <div>
                        <h2 className="text-2xl font-black tracking-tight">{folder.name}</h2>
                        <p className="text-[10px] font-black uppercase text-slate-400">{ projects.filter(p => p.folderId === folder.id).length } projet(s)</p>
                     </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteFolder(folder.id)} className="text-slate-200 hover:text-red-500"><Trash2 size={20} /></Button>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><LayoutGrid size={14} /> Contenu du dossier</h3>
                  <div className="space-y-2">
                     {projects.filter(p => p.folderId === folder.id).map(p => (
                       <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-white hover:ring-1 hover:ring-black/5">
                          <Link to={`/project/${p.id}`} className="font-black text-slate-700 hover:text-primary transition-colors">{p.name}</Link>
                          <Button variant="ghost" size="icon" onClick={() => updateProject(p.id, { folderId: null })} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={14} /></Button>
                       </div>
                     ))}
                     
                     <div className="pt-4">
                        <select 
                          className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-black text-xs text-slate-400 cursor-pointer focus:ring-1 focus:ring-primary"
                          onChange={(e) => { if(e.target.value) updateProject(e.target.value, { folderId: folder.id }); e.target.value = ""; }}
                        >
                           <option value="">+ Ajouter un projet au dossier...</option>
                           {projects.filter(p => !p.folderId).map(p => (
                             <option key={p.id} value={p.id}>{p.name}</option>
                           ))}
                        </select>
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
