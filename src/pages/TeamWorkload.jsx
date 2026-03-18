import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button, cn } from '../components/ui';
import { Calendar, Users, ChevronLeft, ArrowRight, Activity, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const TeamWorkload = () => {
  const { projects } = useProjects();
  const { teams } = useAuth();
  
  const [selectedTeam, setSelectedTeam] = useState('all');
  
  const filteredProjects = projects.filter(p => {
    if (selectedTeam === 'all') return true;
    if (selectedTeam === 'solo') return !p.teamId;
    return p.teamId === selectedTeam;
  });

  const isSolo = teams.length === 0;

  return (
    <div className="container mx-auto px-4 py-8 animate-in max-w-7xl pb-32">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
           <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">{isSolo ? "Mon Planning Solo" : "Charge Équipe & Projets"}</h1>
           <p className="text-xl text-slate-400 font-medium italic">Vision stratégique à 7 jours • Basé sur le calendrier local</p>
        </div>
        
        <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5">
           <Button 
             variant={selectedTeam === 'all' ? 'default' : 'ghost'} 
             onClick={() => setSelectedTeam('all')}
             className="h-12 font-black rounded-xl capitalize"
           >Vue Globale</Button>
           <Button 
             variant={selectedTeam === 'solo' ? 'default' : 'ghost'} 
             onClick={() => setSelectedTeam('solo')}
             className="h-12 font-black rounded-xl capitalize"
           >Personnel</Button>
           {teams.map(t => (
             <Button 
               key={t.id} 
               variant={selectedTeam === t.id ? 'default' : 'ghost'} 
               onClick={() => setSelectedTeam(t.id)}
               className="h-12 font-black rounded-xl capitalize"
             >{t.name}</Button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {filteredProjects.length === 0 ? (
           <div className="col-span-full py-40 text-center text-slate-400 font-medium text-xl">Aucun projet planifié dans cette vue.</div>
         ) : (
           filteredProjects.map(project => (
             <Card key={project.id} className="p-8 border-none shadow-2xl bg-white rounded-[3rem] hover:shadow-primary/10 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-500" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div>
                      <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest mb-3">{project.client}</Badge>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{project.name}</h3>
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                   {/* ÉTAPES RESTANTES */}
                   <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 italic"><Clock size={12} /> Étape(s) en attente ({ (project.milestones || []).filter(m => m.status !== 'done').length })</p>
                      <div className="space-y-2">
                         {(project.milestones || []).filter(m => m.status !== 'done').slice(0,2).map(m => (
                           <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="text-xs font-black text-slate-600 truncate">{m.name}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deadline</p>
                         <p className="font-extrabold text-slate-900">{project.deadline ? format(new Date(project.deadline), 'dd MMM yyyy') : 'Pas de date'}</p>
                      </div>
                      <Link to={`/project/${project.id}`}>
                        <Button size="icon" variant="ghost" className="h-10 w-10 bg-primary/5 text-primary rounded-xl hover:bg-primary transition-all hover:text-white"><ArrowRight size={18} /></Button>
                      </Link>
                   </div>
                </div>
             </Card>
           ))
         )}
      </div>
    </div>
  );
};

export default TeamWorkload;
