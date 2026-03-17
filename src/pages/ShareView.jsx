import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Card, Badge } from '../components/ui';
import { CheckCircle2, Circle, Clock, Info, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ShareView = () => {
  const { shareToken } = useParams();
  const { projects, addFeedback } = useProjects();
  
  const project = projects.find(p => p.shareToken === shareToken);

  if (!project) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Info size={32} />
          </div>
          <h2 className="text-2xl font-bold">Lien invalide ou expiré</h2>
          <p className="text-muted-foreground">Veuillez contacter votre chef de projet pour obtenir un nouveau lien de partage.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="gradient-primary text-white py-3 px-4 shadow-sm flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
        <ShieldCheck size={16} className="text-white/80" /> 
        <span>Espace de Collaboration Sécurisé — Synchronisation en Temps Réel</span>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-4xl animate-in pb-32">
        <div className="text-center mb-16 scale-in">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 ring-1 ring-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Accès Client Privilégié
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.9]">{project.name}</h1>
          <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            Suivi stratégique de l'avancement de la mission pour <span className="text-slate-900 font-black tracking-tight underline decoration-primary/30 underline-offset-4">{project.client}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-10 md:col-span-2 space-y-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none bg-white rounded-[2.5rem] ring-1 ring-black/5 scale-in" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Statut Opérationnel</p>
                <div className="scale-110 origin-left">
                  <Badge variant={project.status} className="px-6 py-2 rounded-full font-black text-[10px]">
                    {project.status === 'on_track' ? '🚀 EN BONNE VOIE' : 
                     project.status === 'at_risk' ? '⚠️ À RISQUE' : 
                     project.status === 'delayed' ? '🔴 EN RETARD' : '✅ TERMINÉ'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Complétion</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{project.progress}<span className="text-xl text-primary ml-1">%</span></p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="h-6 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner p-1 ring-1 ring-slate-100">
                <div 
                  className="h-full gradient-primary rounded-full transition-all duration-[2000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative shadow-lg"
                  style={{ width: `${project.progress}%` }}
                >
                  <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">
                <span>Phase Initiale</span>
                <span>Lancement</span>
                <span>Développement</span>
                <span>Livraison</span>
              </div>
            </div>
          </Card>

          <Card className="p-10 flex flex-col justify-between space-y-8 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none rounded-[2.5rem] ring-1 ring-black/5 scale-in" style={{ animationDelay: '200ms' }}>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Date Prévue</p>
              <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 text-primary shadow-inner">
                <Clock size={32} />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">
                {format(new Date(project.deadline), 'dd.MM.yy', { locale: fr })}
              </p>
            </div>
            
            <div className="pt-8 border-t border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Partagez votre ressenti</p>
              <div className="flex justify-center gap-4">
                {[
                  { emoji: '🔥', label: 'good', color: 'hover:bg-orange-50 hover:text-orange-500' },
                  { emoji: '👌', label: 'medium', color: 'hover:bg-indigo-50 hover:text-primary' },
                  { emoji: '🆘', label: 'difficult', color: 'hover:bg-red-50 hover:text-red-500' }
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => addFeedback(project.id, item.label)}
                    className={cn(
                      "w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all shadow-inner text-xl hover:scale-110",
                      item.color
                    )}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8 mt-24">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-2xl font-black tracking-tighter text-slate-900">Itapes Clefs & Chronologie</h3>
            <div className="h-0.5 flex-1 mx-8 bg-slate-100 rounded-full hidden md:block" />
            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest text-slate-400">{project.milestones.length} ÉTAPES</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {project.milestones.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">En attente de planification...</p>
              </div>
            ) : (
              project.milestones.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map((milestone, idx) => (
                <div 
                  key={milestone.id} 
                  className={cn(
                    "p-8 rounded-[2rem] bg-white border-none ring-1 ring-black/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group scale-in",
                    milestone.status === 'done' ? "opacity-60 bg-slate-50/50" : "shadow-xl shadow-indigo-500/5 hover:ring-primary/40"
                  )}
                  style={{ animationDelay: `${400 + (idx * 50)}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                      milestone.status === 'done' ? "bg-primary text-white" : "bg-slate-50 text-slate-300 group-hover:bg-white group-hover:shadow-lg"
                    )}>
                      {milestone.status === 'done' ? (
                        <CheckCircle2 size={24} />
                      ) : milestone.status === 'in_progress' ? (
                        <div className="relative">
                           <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                           <Clock size={24} className="text-primary relative" />
                        </div>
                      ) : (
                        <Circle size={24} />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "font-black text-xl tracking-tight transition-all",
                        milestone.status === 'done' ? "text-slate-400 line-through decoration-primary/20" : "text-slate-900"
                      )}>
                        {milestone.name}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        Échéance : {format(new Date(milestone.dueDate), 'dd MMMM', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      milestone.status === 'done' ? "bg-slate-100 text-slate-400" : 
                      milestone.status === 'in_progress' ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-400"
                    )}>
                      {milestone.status === 'done' ? 'Livré' : milestone.status === 'in_progress' ? 'Intégration' : 'File d\'attente'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">P</div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Propulsé par ProjBoard PRO</span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">© 2024 — Excellence Opérationnelle</p>
        </footer>
      </div>
    </div>
  );
};

// Helper for class names
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export default ShareView;
