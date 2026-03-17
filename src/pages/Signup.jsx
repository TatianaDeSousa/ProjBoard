import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/ui';
import { UserPlus, LogIn, AlertCircle } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate(inviteToken ? `/join/${inviteToken}` : '/');
    }
  }, [currentUser, navigate, inviteToken]);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      signup(email, password, name);
      const redirect = inviteToken ? `/join/${inviteToken}` : '/';
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#F4F7FF]" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
      
      <Card className="max-w-md w-full p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none rounded-[3rem] bg-white animate-in scale-in">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 gradient-primary text-white rounded-[1.5rem] mb-6 shadow-xl shadow-primary/30 -rotate-3 transition-transform hover:rotate-0">
            <UserPlus size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Rejoindre.</h1>
          <p className="text-slate-400 font-medium">Créez votre identité au sein du réseau.</p>
        </div>

        {inviteToken && (
          <div className="bg-indigo-50 text-indigo-600 p-5 rounded-[1.5rem] mb-8 text-xs font-black uppercase tracking-widest border-none shadow-xl shadow-indigo-500/5 animate-in flex items-center gap-4">
             <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><AlertCircle size={18} /></div>
             Invitation active détectée.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-[1.5rem] mb-8 flex items-center gap-4 text-sm font-black shadow-xl shadow-red-500/5 animate-in">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm"><AlertCircle size={18} /></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom Public</label>
            <Input 
              placeholder="Jean Dupont" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="h-14 font-black shadow-inner bg-slate-50/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Adresse Email</label>
            <Input 
              type="email" 
              placeholder="votre@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-14 font-black shadow-inner bg-slate-50/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Clef d'accès</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="h-14 font-black shadow-inner bg-slate-50/50"
            />
          </div>
          <Button type="submit" className="w-full h-16 text-xl font-black gradient-primary border-none shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all rounded-[1.25rem] mt-4">
            Valider l'Inscription
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center space-y-6">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest leading-relaxed">
            Déjà membre du réseau ?
          </p>
          <Link to={`/login${inviteToken ? `?invite=${inviteToken}` : ''}`} className="block">
            <Button variant="outline" className="w-full h-14 gap-3 font-black rounded-2xl bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary transition-all">
              <LogIn size={20} /> Se connecter
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
