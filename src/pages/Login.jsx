import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/ui';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate(inviteToken ? `/join/${inviteToken}` : '/');
    }
  }, [currentUser, navigate, inviteToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Auth change listener in AuthContext will handle navigation
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#F4F7FF]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      
      <Card className="max-w-md w-full p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none rounded-[3rem] bg-white animate-in scale-in">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 gradient-primary text-white rounded-[1.5rem] mb-6 shadow-xl shadow-primary/30 rotate-3">
            <LogIn size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Bon Retour.</h1>
          <p className="text-slate-400 font-medium">Réintégrez votre centre de commandement.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-[1.5rem] mb-8 flex items-center gap-4 text-sm font-black shadow-xl shadow-red-500/5 animate-in">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm"><AlertCircle size={18} /></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identifiant Email</label>
            <Input 
              type="email" 
              placeholder="votre@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-14 font-black shadow-inner bg-slate-50/50"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mot de Passe</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="h-14 font-black shadow-inner bg-slate-50/50"
            />
          </div>
          <Button type="submit" className="w-full h-16 text-xl font-black gradient-primary border-none shadow-xl shadow-primary/25 rounded-[1.25rem] mt-4">
            Connexion Stratégique
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center space-y-6">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest leading-relaxed">
            Pas encore de compte ?
          </p>
          <Link to={`/signup${inviteToken ? `?invite=${inviteToken}` : ''}`} className="block">
            <Button variant="outline" className="w-full h-14 gap-3 font-black rounded-2xl bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary transition-all">
              <UserPlus size={20} /> Rejoindre l'Écosystème
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
