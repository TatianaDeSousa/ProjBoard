import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/ui';
import { UserPlus, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const teamToken = searchParams.get('invite');
  const inviteToken = searchParams.get('inviteToken');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (inviteToken) fetchInvite();
  }, [inviteToken]);

  const fetchInvite = async () => {
    console.log('[Signup] Fetching invite for token:', inviteToken);
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', inviteToken)
      .eq('status', 'pending')
      .single();

    if (data) {
      console.log('[Signup] Invite found, pre-filling email:', data.invited_email);
      setEmail(data.invited_email);
    } else {
      console.warn('[Signup] Invite not found or error:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      console.log('[Signup] currentUser detected, redirecting…', currentUser);
      if (inviteToken) handleAcceptedInvite();
      navigate(teamToken ? `/join/${teamToken}` : '/');
    }
  }, [currentUser]);

  const handleAcceptedInvite = async () => {
    console.log('[Signup] Handling accepted invite for token:', inviteToken);
    const { data: invite } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', inviteToken)
      .single();

    if (invite) {
      await supabase.from('team_members').insert([{ team_id: invite.team_id, user_id: currentUser.id }]);
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invite.id);
      console.log('[Signup] Team join complete.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[Signup] handleSubmit called');
    console.log('[Signup] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ present' : '❌ MISSING');
    console.log('[Signup] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ present' : '❌ MISSING');
    console.log('[Signup] Attempting signup with email:', email, 'name:', name);

    if (!email || !password || !name) {
      setError('Tous les champs sont obligatoires.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      const user = await signup(email, password, name);
      console.log('[Signup] signup() returned:', user);

      // Supabase may require email confirmation — handle that case gracefully
      if (user && !user.confirmed_at && !user.email_confirmed_at) {
        console.log('[Signup] Email confirmation may be required');
        setSuccess(true);
        setLoading(false);
        return;
      }

      // If no confirmation needed, the auth listener will handle navigation
      setLoading(false);
    } catch (err) {
      console.error('[Signup] signup() threw:', err);
      // Provide French-friendly error messages
      if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
        setError('Cette adresse email est déjà utilisée. Essayez de vous connecter.');
      } else if (err.message?.includes('Password should be')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (err.message?.includes('Unable to validate email')) {
        setError('Adresse email invalide.');
      } else {
        setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#F4F7FF]" />
        <Card className="max-w-md w-full p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none rounded-[3rem] bg-white animate-in scale-in text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <UserPlus size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Compte créé !</h2>
          <p className="text-slate-500 font-medium mb-8">
            Vérifiez votre boîte mail et cliquez sur le lien de confirmation, puis connectez-vous.
          </p>
          <Link to="/login">
            <Button className="w-full h-14 gradient-primary border-none shadow-xl font-black rounded-2xl">
              <LogIn size={20} className="mr-2" /> Se connecter
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#F4F7FF]" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
      
      <Card className="max-w-md w-full p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-none rounded-[3rem] bg-white animate-in scale-in">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 gradient-primary text-white rounded-[1.5rem] mb-6 shadow-xl shadow-primary/30 -rotate-3">
            <UserPlus size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Rejoindre.</h1>
          <p className="text-slate-400 font-medium">Créez votre identité au sein du réseau.</p>
        </div>

        {inviteToken && (
          <div className="bg-indigo-50 text-indigo-600 p-5 rounded-[1.5rem] mb-8 text-xs font-black uppercase tracking-widest border-none shadow-xl shadow-indigo-500/5 animate-in flex items-center gap-4">
             <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><AlertCircle size={18} /></div>
             Invitation active détectée — votre accès est prêt.
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
              disabled={!!inviteToken}
              className="h-14 font-black shadow-inner bg-slate-50/50 disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Clef d'accès (min. 6 caractères)</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-14 font-black shadow-inner bg-slate-50/50"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 text-xl font-black gradient-primary border-none shadow-xl shadow-primary/25 rounded-[1.25rem] mt-4 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? (
              <><Loader2 size={24} className="animate-spin" /> Création en cours…</>
            ) : (
              'Valider l\'Inscription'
            )}
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center space-y-6">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest leading-relaxed">
            Déjà membre du réseau ?
          </p>
          <Link to={`/login${teamToken ? `?invite=${teamToken}` : ''}`} className="block">
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
