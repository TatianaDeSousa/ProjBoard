import React, { useState } from 'react';
import { Card, Button, Badge } from './ui';
import { Sparkles, ArrowRight, Zap, Target, AlertTriangle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AIAttackPlan = ({ projects }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!projects || projects.length === 0) return null;

  // Logic to identify critical projects
  const criticalProjects = projects
    .filter(p => p.status !== 'done' && p.healthScore < 60)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 3);

  const zombieProjects = projects.filter(p => {
    if (p.status === 'done') return false;
    const lastUpdate = new Date(p.updatedAt || p.createdAt);
    const now = new Date();
    const inactiveDays = Math.ceil((now - lastUpdate) / (1000 * 60 * 60 * 24));
    return inactiveDays >= 5;
  }).slice(0, 2);

  const handleRelance = (project) => {
    const message = `Bonjour ${project.client}, je reviens vers vous concernant le projet ${project.name}. Pouvons-nous faire un point sur les derniers éléments ?`;
    window.open(`mailto:?subject=Suivi Projet: ${project.name}&body=${encodeURIComponent(message)}`);
  };

  return (
    <Card className="mb-10 overflow-hidden border-none shadow-2xl ring-1 ring-white/10 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="p-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Sparkles className="text-primary animate-pulse" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Plan d'Attaque Hebdomadaire</h2>
              <p className="text-slate-400 text-sm font-medium">Analyse IA — Lundi {format(new Date(), 'dd MMMM', { locale: fr })}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white hover:bg-white/10 px-4"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Masquer" : "Voir l'analyse"}
          </Button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                <Target size={14} /> Priorités Critiques
              </div>
              <div className="space-y-4">
                {criticalProjects.map(project => (
                  <div key={project.id} className="group bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-100">{project.name}</h3>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Score {project.healthScore}</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-1">Client: {project.client} • Deadline: {format(new Date(project.deadline), 'dd MMM')}</p>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-orange-400" />
                      <span className="text-xs text-slate-300 font-medium italic">Action suggérée : Finaliser le jalon "En attente" pour remonter le score.</span>
                    </div>
                  </div>
                ))}
                {criticalProjects.length === 0 && (
                  <p className="text-slate-500 text-sm italic py-4">Tous vos projets sont en excellente santé !</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-widest text-xs">
                <AlertTriangle size={14} /> Projets "Zombies" détectés
              </div>
              <div className="space-y-4">
                {zombieProjects.map(project => (
                  <div key={project.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-100">{project.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 italic">Dernière activité il y a 5+ jours</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2 bg-orange-500 hover:bg-orange-600 border-none shadow-lg shadow-orange-500/20"
                      onClick={() => handleRelance(project)}
                    >
                      <Send size={14} /> Relancer
                    </Button>
                  </div>
                ))}
                {zombieProjects.length === 0 && (
                  <p className="text-slate-500 text-sm italic py-4 font-medium">Aucun projet n'est actuellement à l'arrêt.</p>
                )}
              </div>
              
              <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl">
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "Conseil de l'IA : Votre taux de complétion est de {Math.round(projects.filter(p => p.status === 'done').length / projects.length * 100) || 0}%. Concentrez-vous sur <strong>{criticalProjects[0]?.name || 'vos projets prioritaires'}</strong> aujourd'hui pour maximiser votre Score de Santé global."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIAttackPlan;
