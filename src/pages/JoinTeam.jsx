import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui';
import { Users, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const JoinTeam = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { currentUser, joinTeam, teams } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate(`/signup?invite=${token}`);
      return;
    }

    const processJoin = () => {
      try {
        joinTeam(token, currentUser.id);
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        setStatus('error');
        setError(err.message);
      }
    };

    const timer = setTimeout(processJoin, 1500);
    return () => clearTimeout(timer);
  }, [token, currentUser, joinTeam, navigate]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />

      <Card className="max-w-md w-full p-12 text-center space-y-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border-none rounded-[3rem] bg-white/80 backdrop-blur-xl ring-1 ring-white scale-in">
        {status === 'processing' && (
          <div className="animate-in space-y-8">
            <div className="relative inline-flex mb-4">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25" />
              <div className="relative p-6 bg-primary/5 text-primary rounded-[2rem] ring-1 ring-primary/20">
                <Users size={40} />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">Traitement de l'invitation</h2>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Synchronisation sécurisée</p>
            </div>
            <div className="flex justify-center py-4">
               <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
               </div>
            </div>
            <p className="text-slate-400 text-sm font-medium">Nous configurons votre accès privilégié au groupe ProjBoard...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in space-y-8">
            <div className="inline-flex p-6 bg-emerald-50 text-emerald-500 rounded-[2rem] ring-1 ring-emerald-500/20 scale-in">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">C'est validé !</h2>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">Accès Autorisé</p>
            </div>
            <p className="text-slate-400 text-sm font-medium">Vous avez rejoint l'équipe avec succès.<br/>Préparation de votre espace de travail...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in space-y-8">
            <div className="inline-flex p-6 bg-red-50 text-red-500 rounded-[2rem] ring-1 ring-red-500/20">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">Oups !</h2>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">Lien expiré ou erroné</p>
            </div>
            <p className="text-slate-400 text-sm font-medium">{error}</p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gradient-primary text-white shadow-xl shadow-indigo-500/20"
            >
              Retour à l'accueil
            </Button>
          </div>
        )}
      </Card>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default JoinTeam;
