import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { checkPassword, setAuthenticated } from '../lib/auth';
import { motion } from 'motion/react';

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
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#131313] flex items-center justify-center px-4"
      style={{ fontFamily: "'Manrope', 'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
      `}</style>

      {/* Subtle red glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xs relative"
      >
        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 border border-white/10 bg-white/[0.04] rounded-xl mb-5">
            <Lock className="w-4.5 h-4.5 text-red-400" style={{ width: 18, height: 18 }} />
          </div>
          <h1 className="text-base font-bold text-white/90 tracking-tight mb-1">
            Eberardos <span className="text-white/25 font-normal">/</span> <span className="text-white/45 font-medium">archive</span>
          </h1>
          <p className="text-[12px] text-white/30">Enter password to access</p>
        </div>

        {/* Form */}
        <div style={{ animation: shake ? 'shake 0.5s ease' : undefined }}>
          <input
            type="password"
            autoFocus
            required
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null); }}
            placeholder="Password"
            className={`w-full bg-white/[0.04] border rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none transition-all mb-3 ${
              error ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-white/25'
            }`}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-3 text-[12px] text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !password}
          className="w-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98] text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Enter
              <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-0.5 group-hover:text-red-400 transition-all" />
            </>
          )}
        </button>

        <p className="mt-8 text-center text-[10px] text-white/15" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          © 2026 Eberardos Community
        </p>
      </motion.div>
    </div>
  );
}
