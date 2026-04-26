import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        navigate('/');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Database connection failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 opacity-20"></div>
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center space-y-4">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mono-text"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          <div className="inline-block p-4 bg-card border border-gray-800 rounded-3xl shadow-xl relative group">
            <ShieldAlert className="w-10 h-10 text-accent group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white pixel-text tracking-tighter">ACCESS ARCHIVE</h1>
            <p className="text-muted text-sm mono-text uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border p-8 rounded-[2rem] shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center gap-3 text-accent text-sm mono-text">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block ml-1 mono-text">Admin Username</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded-2xl py-4 px-5 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono"
              placeholder="eber_admin@archive.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block ml-1 mono-text">Security Key</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg/50 border border-border rounded-2xl py-4 px-5 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:opacity-90 disabled:bg-border text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span className="font-sans tracking-widest uppercase text-sm">Initialize Session</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold mono-text">
          Security Protocol 0xAe49 • Eberardos Community Archive
        </p>
      </div>
    </div>
  );
}
