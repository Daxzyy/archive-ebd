import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { checkPassword, setAuthenticated } from '../lib/auth';

export default function Login() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const valid = await checkPassword(password);
      if (valid) {
        setAuthenticated();
        navigate('/');
      } else {
        setError('Wrong password');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch (e) {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Subtle glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-card border border-border rounded-2xl mb-6 shadow-xl">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white pixel-text tracking-tighter uppercase mb-2">
            Eberardos Archive
          </h1>
          <p className="text-xs text-muted mono-text tracking-widest uppercase">
            Enter access password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div
            style={{
              animation: shake ? 'shake 0.5s ease' : undefined,
            }}
          >
            <style>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-8px); }
                40% { transform: translateX(8px); }
                60% { transform: translateX(-5px); }
                80% { transform: translateX(5px); }
              }
            `}</style>
            <div className="relative">
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••••••"
                className={`w-full bg-card border rounded-2xl py-4 px-5 text-gray-200 text-center text-xl tracking-[0.4em] placeholder:tracking-widest placeholder:text-lg focus:outline-none transition-all font-mono ${
                  error
                    ? 'border-accent/60 focus:border-accent'
                    : 'border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/30'
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-accent text-[11px] mono-text uppercase tracking-widest justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-accent hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-sm tracking-widest uppercase font-sans">Enter</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-gray-700 mono-text uppercase tracking-widest">
          Eberardos Community © 2026
        </p>
      </div>
    </div>
  );
}
