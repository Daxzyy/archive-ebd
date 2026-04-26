import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getSupabase } from './lib/supabase';
import { isAuthenticated } from './lib/auth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [configError, setConfigError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      getSupabase(); // just validate config
    } catch (e) {
      setConfigError(e instanceof Error ? e.message : 'Unknown configuration error');
    } finally {
      setChecking(false);
    }

    // Listen for storage changes (e.g. logout from another tab)
    const onStorage = () => setAuthed(isAuthenticated());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Re-check auth when navigating (after login/logout)
  const refreshAuth = () => setAuthed(isAuthenticated());

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-card border border-accent/20 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
          <div className="bg-accent-soft p-4 rounded-2xl w-fit mx-auto">
            <AlertTriangle className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white pixel-text tracking-tighter uppercase">Configuration Required</h1>
            <p className="text-muted text-sm mono-text leading-relaxed">
              Connect your Supabase project to use the Archive System.
            </p>
          </div>
          <div className="bg-bg/50 p-4 rounded-xl border border-border text-left">
            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 mono-text">Missing Variables:</p>
            <ul className="text-[10px] text-muted space-y-1 mono-text list-disc ml-4">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
          <p className="text-[11px] text-gray-500 italic">
            Add these to your project Secrets in AI Studio settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard isAuth={authed} onAuthChange={refreshAuth} />} />
        <Route
          path="/login"
          element={authed ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/admin"
          element={authed ? <Admin /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
