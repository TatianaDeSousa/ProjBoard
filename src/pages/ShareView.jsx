import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Card, Badge, Button, cn } from '../components/ui';
import { CheckCircle2, AlertCircle, Clock, Calendar, Activity, ChevronRight, Briefcase, User, Star, ArrowUpRight, Zap } from 'lucide-react';
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
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="animate-pulse space-y-4 text-center">
        <div className="w-16 h-16 gradient-primary rounded-2xl mx-auto mb-4 shadow-2xl" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Accès sécurisé ProjBoard…</p>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
      <Card className="max-w-md p-12 rounded-[3rem] border-none shadow-2xl bg-white scale-in">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce"><AlertCircle size={40} /></div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Désolé !</h1>
        <p className="text-slate-500 font-bold mb-8 leading-relaxed">{error}</p>
        <Button onClick={() => window.location.reload()} className="w-full h-14 gradient-primary border-none font-black rounded-2xl text-white shadow-xl shadow-primary/20">Réessayer</Button>
      </Card>
    </div>
  );

  const milestones = project.milestones || [];
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : (project.progress || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 animate-in">
      <div className="bg-white border-b border-slate-100/80 sticky top-0 z-50 backdrop-blur-xl bg-white/70">
        <div className="container mx-auto px-6 h-28 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl rotate-3"><Zap size={32} /></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{project.name}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Espace Client Privé — ProjBoard</p>
            </div>
          </div>
          <Badge className={cn("h-10 px-6 font-black uppercase text-[10px] tracking-widest border-none shadow-premium rounded-full", project.status === 'on_track' ? "bg-emerald-500 text-white" : "bg-orange-500 text-white")}>{project.status === 'on_track' ? 'Dossier Conforme' : 'Mise à jour planifiée'}</Badge>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
             <Card className="p-12 border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40 transition-colors group-hover:bg-primary/10" />
                <div className="flex items-end justify-between mb-16 relative z-10">
                   <div className="space-y-3">
                     <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em]">Avancement Global</p>
                     <h2 className="text-8xl font-black text-slate-900 tracking-tighter">{progress}<span className="text-3xl text-slate-200 ml-2">%</span></h2>
                   </div>
                   <div className="flex gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><Briefcase size={28} /></div>
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner"><Activity size={28} /></div>
                   </div>
                </div>
                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 ring-1 ring-slate-100 shadow-inner relative z-10">
                   <div className="h-full rounded-full gradient-primary shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-[2500ms]" style={{ width: `${progress}%` }} />
                </div>
             </Card>

             <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 ml-4 italic underline underline-offset-8 decoration-primary/20">Planning des Livrables</h3>
                <div className="grid gap-6">
                   {milestones.map((m, idx) => (
                     <Card key={idx} className="p-8 border-none shadow-xl bg-white rounded-[2.5rem] flex items-center justify-between group hover:shadow-2xl hover:scale-[1.02] transition-all scale-in" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="flex items-center gap-8">
                           <div className={cn(
                             "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6",
                             m.status === 'done' ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
                             m.status === 'doing' ? "bg-amber-500 text-white shadow-amber-500/20 animate-pulse" :
                             "bg-slate-50 text-slate-200"
                           )}>
                              {m.status === 'done' ? <CheckCircle2 size={32} /> : 
                               m.status === 'doing' ? <Clock size={32} /> : 
                               <Calendar size={32} />}
                           </div>
                           <div>
                              <p className={cn("font-black tracking-tight text-2xl mb-1", m.status === 'done' ? "text-slate-300 line-through" : "text-slate-900")}>{m.name}</p>
                              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Clock size={14} /> {m.dueDate ? format(new Date(m.dueDate), 'dd MMMM yyyy', { locale: fr }) : 'Date prévisionnelle'}
                                {m.status === 'doing' && <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] px-2 h-5 ml-2">PRODUCTION EN COURS</Badge>}
                              </p>
                           </div>
                        </div>
                        {m.status === 'done' && <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase h-8 px-6 rounded-full shadow-sm">Livrable Validé</Badge>}
                     </Card>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-10">
             <Card className="p-10 border-none shadow-2xl bg-slate-900 text-white rounded-[3rem] overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] mb-8 italic">Votre Consultant</h3>
                <p className="text-3xl font-black mb-6 leading-tight tracking-tighter">Le dossier avance selon les objectifs fixés.</p>
                <div className="flex items-center gap-4 text-slate-400 text-sm font-black">
                   <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary"><Calendar size={18} /></div>
                   Dernier audit : {project.updatedAt ? format(new Date(project.updatedAt), 'dd/MM HH:mm') : '—'}
                </div>
             </Card>

             <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] flex flex-col items-center text-center ring-1 ring-black/5">
                <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-8 shadow-inner"><Star size={40} className="fill-primary/10" /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Satisfaction Client</h3>
                <p className="text-sm text-slate-500 font-bold mb-10 leading-relaxed px-4">Comment évaluez-vous l'avancement de la phase actuelle ?</p>
                <div className="flex gap-4 w-full">
                   {['good', 'medium', 'difficult'].map((v) => (
                     <button key={v} onClick={() => submitMood(v)} className={cn("flex-1 h-16 rounded-2xl flex items-center justify-center transition-all shadow-premium border-2", mood === v ? "bg-primary border-primary text-white scale-110 shadow-xl" : "bg-white border-slate-50 text-slate-300 hover:border-primary/30 hover:text-primary")}>
                        {v === 'good' && <CheckCircle2 size={28} />}
                        {v === 'medium' && <Clock size={28} />}
                        {v === 'difficult' && <AlertCircle size={28} />}
                     </button>
                   ))}
                </div>
                {mood && <p className="mt-6 text-xs font-black text-primary uppercase tracking-widest animate-in slide-in-from-bottom">Merci ! Votre avis a été pris en compte.</p>}
             </Card>

             <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] ring-1 ring-black/5 h-full">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400 flex items-center gap-2"><Activity size={16} /> Flux de Production</h3>
                <div className="space-y-8">
                   {(project.logs || []).slice(-4).reverse().map((log, i) => (
                      <div key={i} className="flex gap-5 items-start">
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-100 mt-1.5 shrink-0 shadow-sm" />
                         <div>
                            <p className="text-xs font-black text-slate-900 mb-1">{log.action}</p>
                            <p className="text-[10px] text-slate-400 font-bold italic tracking-tight uppercase">{log.details}</p>
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
