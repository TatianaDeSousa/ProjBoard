import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AuthCallback] URL hash:', window.location.hash);
      console.log('[AuthCallback] URL search:', window.location.search);

      // Supabase puts tokens in the URL hash or search params
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthCallback] getSession error:', error);
        setErrorMsg(error.message);
        setStatus('error');
        return;
      }

      if (data.session) {
        console.log('[AuthCallback] Session confirmed, redirecting to dashboard');
        setStatus('success');
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      // If no session yet, try to exchange the code/token from URL
      // Supabase JS v2 handles this automatically via onAuthStateChange
      // But we listen explicitly here as a fallback
      const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (authError) {
        console.error('[AuthCallback] exchangeCodeForSession error:', authError);
        // This is expected when the URL doesn't have a code — fall through
      }

      if (authData?.session) {
        console.log('[AuthCallback] Code exchanged, session established');
        setStatus('success');
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      // Last resort: wait for onAuthStateChange
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[AuthCallback] auth event:', event);
        if (session) {
          subscription.unsubscribe();
          setStatus('success');
          setTimeout(() => navigate('/'), 1500);
        } else if (event === 'SIGNED_OUT') {
          setErrorMsg('La confirmation a échoué. Le lien est peut-être expiré.');
          setStatus('error');
          subscription.unsubscribe();
        }
      });

      // Timeout safety
      setTimeout(() => {
        if (status === 'loading') {
          subscription.unsubscribe();
          setErrorMsg('Délai de confirmation dépassé. Réessayez ou contactez le support.');
          setStatus('error');
        }
      }, 10000);
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FF] p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-12 text-center animate-in scale-in">
        
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Loader2 size={40} className="animate-spin" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-4">
              Confirmation en cours…
            </h1>
            <p className="text-slate-400 font-medium">
              Nous vérifions votre compte, patientez un instant.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-4">
              Email confirmé ! ✅
            </h1>
            <p className="text-slate-400 font-medium">
              Redirection vers votre dashboard…
            </p>
            <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full animate-[grow_1.5s_ease-in-out_forwards]" style={{ width: '100%', animation: 'none', transition: 'width 1.5s' }} />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-4">
              Lien invalide
            </h1>
            <p className="text-slate-500 font-medium mb-8">
              {errorMsg || 'Ce lien de confirmation est expiré ou invalide.'}
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="w-full h-14 rounded-[1.5rem] font-black text-white text-sm uppercase tracking-widest"
              style={{ background: 'var(--primary, #6366f1)' }}
            >
              Réessayer l'inscription
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
