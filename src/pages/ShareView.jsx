import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Card, Badge, Button, cn } from '../components/ui';
import { CheckCircle2, AlertCircle, Clock, Calendar, Activity, ChevronRight, Briefcase, User, Star, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ShareView = () => {
  const { shareToken: urlToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = urlToken || searchParams.get('token');
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState(null);

  useEffect(() => {
    if (token) fetchSharedProject();
    else { setLoading(false); setError("Lien non valide"); }
  }, [token]);

  const fetchSharedProject = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('client_links')
      .select('project_data')
      .eq('token', token)
      .single();

    if (error || !data) {
      console.error('[ShareView] Fetch error:', error);
      setError("Dossier introuvable ou lien expiré.");
    } else {
      setProject(data.project_data);
    }
    setLoading(false);
  };

  const submitMood = async (value) => {
    setMood(value);
    // On pourrait logger l'humeur client ici dans une table feedback_clicks si besoin
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="animate-pulse space-y-4 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl mx-auto mb-4" />
        <p className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">Accès sécurisé…</p>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
      <Card className="max-w-md p-12 rounded-[3rem] border-none shadow-2xl bg-white scale-in">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Désolé !</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
        <Button onClick={() => window.location.reload()} className="w-full h-14 gradient-primary border-none font-black rounded-2xl">Réessayer</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* HEADER CLIENT (Haut standing) */}
      <div className="bg-white border-b border-slate-100/80 sticky top-0 z-50 backdrop-blur-xl bg-white/70">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-all">
              {project.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{project.name}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Consultation Client — Privé</p>
            </div>
          </div>
          <Badge className={cn(
             "h-8 px-4 font-black uppercase text-[10px] tracking-widest border-none shadow-lg shadow-primary/20",
             project.status === 'on_track' ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
          )}>
            {project.status === 'on_track' ? 'Dossier Conforme' : 'Mise à jour requise'}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLONNE GAUCHE — ÉTAT DU DOSSIER */}
          <div className="lg:col-span-2 space-y-10">
             <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="flex items-end justify-between mb-12 relative z-10">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Avancement global</p>
                     <h2 className="text-6xl font-black text-slate-900 tracking-tighter">{project.progress || 0}<span className="text-2xl text-slate-300 ml-1">%</span></h2>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Briefcase size={20} /></div>
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Activity size={20} /></div>
                   </div>
                </div>

                <div className="h-6 w-full bg-slate-50 rounded-full overflow-hidden p-1.5 ring-1 ring-slate-100 shadow-inner relative z-10">
                   <div 
                     className="h-full rounded-full gradient-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-[2000ms] animate-in slide-in-from-left"
                     style={{ width: `${project.progress || 0}%` }}
                   />
                </div>
             </Card>

             {/* MILESTONES */}
             <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400 ml-4">Chronologie Validée</h3>
                <div className="space-y-4">
                   {(project.milestones || []).map((m, idx) => (
                     <Card key={m.id} className="p-6 border-none shadow-xl bg-white rounded-[2rem] flex items-center justify-between group hover:shadow-2xl transition-all scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex items-center gap-6">
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6",
                             m.status === 'done' ? "bg-emerald-100 text-emerald-600 shadow-emerald-500/10" : "bg-slate-50 text-slate-400 shadow-black/5"
                           )}>
                              {m.status === 'done' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                           </div>
                           <div>
                              <p className={cn("font-black tracking-tight text-lg", m.status === 'done' ? "text-slate-400 line-through" : "text-slate-900")}>{m.name}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Calendar size={12} /> {m.dueDate ? format(new Date(m.dueDate), 'dd MMMM yyyy', { locale: fr }) : 'Date à confirmer'}
                              </p>
                           </div>
                        </div>
                        {m.status === 'done' && <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase h-6 px-3">Validé</Badge>}
                     </Card>
                   ))}
                </div>
             </div>
          </div>

          {/* COLONNE DROITE — ACTIONS ET FEEDBACK */}
          <div className="space-y-8">
             <Card className="p-8 border-none shadow-2xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-primary">Dernière Mise à Jour</h3>
                <p className="text-3xl font-black mb-4 leading-tight tracking-tighter">Votre dossier est prêt pour la prochaine étape.</p>
                <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                   <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Calendar size={14} /></div>
                   {project.updatedAt ? format(new Date(project.updatedAt), 'dd/MM/yyyy HH:mm') : '—'}
                </div>
             </Card>

             <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem] flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-6">
                   <Star size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Votre avis compte</h3>
                <p className="text-sm text-slate-500 font-medium mb-8">Comment évaluez-vous l'avancement actuel de la prestation ?</p>
                
                <div className="flex gap-4 w-full">
                   {['good', 'medium', 'difficult'].map((v) => (
                     <button 
                       key={v}
                       onClick={() => submitMood(v)}
                       className={cn(
                         "flex-1 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md group border-2",
                         mood === v ? "bg-primary border-primary text-white scale-110 shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-primary/40 hover:text-primary"
                       )}
                     >
                        {v === 'good' && <CheckCircle2 size={24} />}
                        {v === 'medium' && <Clock size={24} />}
                        {v === 'difficult' && <AlertCircle size={24} />}
                     </button>
                   ))}
                </div>
                {mood && <p className="mt-4 text-xs font-black text-primary uppercase tracking-widest animate-in slide-in-from-bottom">Merci pour votre retour !</p>}
             </Card>

             <Card className="p-8 border-none shadow-2xl bg-white rounded-[2.5rem]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-slate-400 flex items-center gap-2">
                   <Activity size={14} /> Historique récent
                </h3>
                <div className="space-y-6">
                   {(project.logs || []).slice(0,3).map((log, i) => (
                      <div key={i} className="flex gap-4 items-start group">
                         <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0 group-hover:bg-primary transition-colors" />
                         <div>
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">{log.action}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{log.details}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareView;
