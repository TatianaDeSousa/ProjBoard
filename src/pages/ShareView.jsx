import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Card, Badge, cn } from '../components/ui';
import { CheckCircle2, Circle, Clock, Info, ShieldCheck, Activity, History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../supabaseClient';

const ShareView = () => {
  const { shareToken: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const token = pathToken || queryToken;

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (token) fetchProject();
  }, [token]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('share_token', token)
      .single();

    if (data) {
      setProject(data);
      
      const { data: ms } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', data.id)
        .order('due_date');
      setMilestones(ms || []);

      const { data: lg } = await supabase
        .from('project_logs')
        .select('*')
        .eq('project_id', data.id)
        .order('timestamp', { ascending: false })
        .limit(10);
      setLogs(lg || []);
    } else {
      setNotFound(true);
    }
  };

  const addFeedback = async (value) => {
    if (!project) return;
    await supabase.from('project_feedback').insert([{ project_id: project.id, value }]);
    await supabase.from('project_logs').insert([{ project_id: project.id, action: 'Humeur Client', details: `Feedback: ${value}` }]);
    alert('Merci pour votre retour !');
  };

  if (notFound) {
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

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="gradient-primary text-white py-3 px-4 shadow-sm flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
        <ShieldCheck size={16} className="text-white/80" />
        <span>Espace de Collaboration Sécurisé — Synchronisation en Temps Réel</span>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-5xl animate-in pb-32">
        <div className="text-center mb-16 scale-in">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 ring-1 ring-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Accès Client Privilégié
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.9]">{project.name}</h1>
          <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            Suivi stratégique — <span className="text-slate-900 font-black">{project.client}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-10 md:col-span-2 space-y-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none bg-white rounded-[2.5rem] ring-1 ring-black/5 scale-in">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Statut Opérationnel</p>
                <Badge className="px-6 py-2 rounded-full font-black text-[10px]">
                  {project.status === 'on_track' ? '🚀 EN BONNE VOIE' :
                   project.status === 'at_risk' ? '⚠️ À RISQUE' :
                   project.status === 'delayed' ? '🔴 EN RETARD' : '✅ TERMINÉ'}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Complétion</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{project.progress}<span className="text-xl text-primary ml-1">%</span></p>
              </div>
            </div>
            <div className="h-6 w-full bg-slate-50 rounded-full overflow-hidden p-1 ring-1 ring-slate-100">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-[2000ms]"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </Card>

          <Card className="p-10 flex flex-col justify-between space-y-8 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none rounded-[2.5rem] ring-1 ring-black/5 scale-in">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Date Prévue</p>
              <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 text-primary shadow-inner">
                <Clock size={32} />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">
                {project.deadline ? format(new Date(project.deadline), 'dd.MM.yy', { locale: fr }) : 'N/A'}
              </p>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Partagez votre ressenti</p>
              <div className="flex justify-center gap-4">
                {[{ emoji: '🔥', label: 'good' }, { emoji: '👌', label: 'medium' }, { emoji: '🆘', label: 'difficult' }].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => addFeedback(item.label)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 text-xl flex items-center justify-center transition-all hover:scale-110 hover:bg-white hover:shadow-lg"
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-24">
          <div className="space-y-8">
            <h3 className="text-2xl font-black tracking-tighter text-slate-900 px-4">Livrables & Jalons</h3>
            <div className="space-y-4">
              {milestones.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest">En attente de planification...</p>
                </div>
              ) : (
                milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={cn(
                      "p-6 rounded-[2rem] bg-white ring-1 ring-black/5 flex items-center justify-between gap-6",
                      milestone.status === 'done' ? "opacity-60" : "shadow-xl shadow-indigo-500/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        milestone.status === 'done' ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-300"
                      )}>
                        {milestone.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                      <p className={cn(
                        "font-black text-base tracking-tight",
                        milestone.status === 'done' ? "text-slate-400 line-through" : "text-slate-900"
                      )}>
                        {milestone.name}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100">
                      {milestone.due_date ? format(new Date(milestone.due_date), 'dd MMM', { locale: fr }) : '—'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-2xl font-black tracking-tighter text-slate-900">Fil d'actualité</h3>
              <History size={20} className="text-slate-300" />
            </div>
            <div className="relative space-y-6 before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {logs.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Aucune activité récente</p>
                </div>
              ) : logs.map((log) => (
                <div key={log.id} className="relative flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white ring-1 ring-black/5 flex items-center justify-center shrink-0 z-10 shadow-sm">
                    {log.action.includes('Jalon') ? <CheckCircle2 size={20} className="text-emerald-400" /> :
                     log.action.includes('Humeur') ? <Activity size={20} className="text-orange-400" /> :
                     <Info size={20} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">{log.action}</span>
                      <span className="text-[9px] font-bold text-slate-300">• {format(new Date(log.timestamp), 'HH:mm', { locale: fr })}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-snug">{log.details}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {format(new Date(log.timestamp), 'eeee dd MMMM', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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

export default ShareView;
