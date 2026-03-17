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
    <div className="min-h-screen bg-slate-50">
      <div className="bg-primary text-primary-foreground py-2 px-4 shadow-sm flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest">
        <ShieldCheck size={14} /> Vue partagée sécurisée — Actualisée en temps réel
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl animate-in">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            Espace Client
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{project.name}</h1>
          <p className="text-xl text-muted-foreground font-medium">Suivi d'avancement pour {project.client}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 md:col-span-2 space-y-6 shadow-xl border-none ring-1 ring-black/5">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">État actuel</p>
                <Badge variant={project.status} className="text-sm px-4 py-1">
                  {project.status === 'on_track' ? 'En bonne voie' : 
                   project.status === 'at_risk' ? 'À risque' : 
                   project.status === 'delayed' ? 'En retard' : 'Terminé'}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Progression</p>
                <p className="text-3xl font-black text-primary">{project.progress}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden shadow-inner ring-4 ring-muted">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center text-center space-y-4 bg-white shadow-lg border-none">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Date de livraison</p>
              <p className="text-2xl font-black text-slate-800">
                {format(new Date(project.deadline), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Comment ça se passe ?</p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => addFeedback(project.id, 'good')}
                  className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm text-xl"
                  title="Bien"
                >
                  😊
                </button>
                <button 
                  onClick={() => addFeedback(project.id, 'medium')}
                  className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center hover:bg-orange-50 hover:text-white transition-all shadow-sm text-xl"
                  title="Moyen"
                >
                  😐
                </button>
                <button 
                  onClick={() => addFeedback(project.id, 'difficult')}
                  className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm text-xl"
                  title="Difficile"
                >
                  😟
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold px-2 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            Chronologie du projet
          </h3>
          
          <div className="space-y-4">
            {project.milestones.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground italic">Aucune étape renseignée pour le moment.</p>
            ) : (
              project.milestones.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map(milestone => (
                <div key={milestone.id} className="flex gap-4 items-start relative pl-2 group">
                  <div className="shrink-0 mt-1">
                    {milestone.status === 'done' ? (
                      <CheckCircle2 size={24} className="text-primary" />
                    ) : milestone.status === 'in_progress' ? (
                      <Clock size={24} className="text-primary animate-pulse" />
                    ) : (
                      <Circle size={24} className="text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 pb-4 border-b border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <p className={cn(
                        "font-bold text-lg",
                        milestone.status === 'done' ? "text-slate-400 line-through" : "text-slate-800"
                      )}>
                        {milestone.name}
                      </p>
                      <Badge variant="outline" className="w-fit text-[10px] font-bold uppercase tracking-tighter">
                        {milestone.status === 'done' ? 'Livré' : milestone.status === 'in_progress' ? 'En cours' : 'À venir'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="mt-20 pt-8 border-t text-center text-muted-foreground text-sm">
          Propulsé par <strong>ProjBoard</strong> — Tous droits réservés.
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
