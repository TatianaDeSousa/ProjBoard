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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-none">
        {status === 'processing' && (
          <>
            <div className="inline-flex p-4 bg-primary/10 text-primary rounded-full animate-pulse">
              <Users size={48} />
            </div>
            <h2 className="text-2xl font-bold">Traitement de l'invitation...</h2>
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
            <p className="text-muted-foreground">Nous vous ajoutons au groupe ProjBoard.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full scale-in">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-green-700">Bienvenue !</h2>
            <p className="text-muted-foreground">Vous avez rejoint l'équipe avec succès. Redirection vers le dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex p-4 bg-red-100 text-red-600 rounded-full">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-red-700">Erreur</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">Retour au dashboard</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default JoinTeam;
