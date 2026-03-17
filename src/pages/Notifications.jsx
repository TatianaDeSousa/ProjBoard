import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Card, Button, Badge } from '../components/ui';
import { Bell, Check, X, Clock, AlertTriangle, ChevronLeft, Calendar, Info, Users, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications = () => {
  const { getUserNotifications, acceptTeamInvitation, rejectTeamInvitation, markNotificationAsRead } = useAuth();
  const { projects } = useProjects();
  const notifications = getUserNotifications();

  // Generate system notifications for deadlines
  const systemNotifications = projects.filter(p => {
    if (p.status === 'done') return false;
    const deadline = new Date(p.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).map(p => ({
    id: `deadline-${p.id}`,
    type: 'deadline',
    title: 'Échéance proche',
    message: `Le projet "${p.name}" se termine dans moins de 3 jours !`,
    timestamp: new Date().toISOString(), // In a real app, this would be computed or stored
    projectId: p.id,
    severity: 'high'
  }));

  const allNotifications = [...systemNotifications, ...notifications].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in pb-24">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
            <ChevronLeft size={14} />
          </div>
          Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-end mb-16 px-2">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4 flex items-center gap-4">
            Alertes & Invitations
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge className="bg-red-500 text-white border-none h-8 px-3 text-sm rounded-xl shadow-lg shadow-red-500/20">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
            Restez informé des mouvements de votre équipe et des jalons critiques.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {allNotifications.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Bell size={32} />
            </div>
            <p className="text-xl font-black text-slate-400">Aucune notification pour le moment.</p>
          </div>
        ) : (
          allNotifications.map((notif, idx) => (
            <Card 
              key={notif.id} 
              className={cn(
                "p-8 border-none bg-white rounded-[2.5rem] ring-1 ring-black/5 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all scale-in",
                notif.read ? "opacity-75" : "ring-primary/20 bg-primary/5 shadow-indigo-500/10"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                notif.type === 'team_invite' ? "bg-indigo-100 text-indigo-600 shadow-indigo-500/10" : 
                notif.type === 'deadline' ? "bg-orange-100 text-orange-600 shadow-orange-500/10" : 
                "bg-slate-100 text-slate-600 shadow-slate-500/10"
              )}>
                {notif.type === 'team_invite' ? <Users size={28} /> : 
                 notif.type === 'deadline' ? <Clock size={28} /> : 
                 notif.type === 'status_change' ? <Activity size={28} /> : 
                 <Bell size={28} />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {notif.type === 'team_invite' ? 'Invitation Équipe' : 
                     notif.type === 'deadline' ? 'Alerte Échéance' : 
                     notif.type === 'status_change' ? 'Mise à jour' : 'Notification'}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold">• {format(new Date(notif.timestamp), 'HH:mm • dd MMM', { locale: fr })}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-none">{notif.title || notif.message}</h3>
                {notif.title && <p className="text-slate-500 font-medium">{notif.message}</p>}
              </div>

              <div className="flex gap-3 shrink-0 pt-4 md:pt-0 w-full md:w-auto">
                {notif.type === 'team_invite' && !notif.status && (
                  <>
                    <Button 
                      size="sm" 
                      className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl h-12 px-6 flex-1 md:flex-none shadow-lg shadow-emerald-500/10"
                      onClick={() => acceptTeamInvitation(notif.id)}
                    >
                      <Check size={18} /> Accepter
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 bg-red-50 text-red-500 hover:bg-red-100 font-black rounded-xl h-12 px-6 flex-1 md:flex-none"
                      onClick={() => rejectTeamInvitation(notif.id)}
                    >
                      <X size={18} /> Refuser
                    </Button>
                  </>
                )}
                
                {notif.type === 'team_invite' && notif.status && (
                  <Badge className={cn(
                    "h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest",
                    notif.status === 'accepted' ? "bg-emerald-100 text-emerald-600 border-none" : "bg-red-100 text-red-600 border-none"
                  )}>
                    {notif.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                  </Badge>
                )}

                {notif.type === 'deadline' && (
                  <Link to={`/project/${notif.projectId}`}>
                    <Button className="gap-2 gradient-primary border-none shadow-lg shadow-primary/20 h-12 px-6 font-black rounded-xl">
                      Voir le projet <ChevronRight size={18} />
                    </Button>
                  </Link>
                )}

                {!notif.read && notif.type !== 'team_invite' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-12 w-12 rounded-xl text-slate-300 hover:text-primary transition-colors"
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    <Check size={20} />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;

const cn = (...inputs) => inputs.filter(Boolean).join(' ');
