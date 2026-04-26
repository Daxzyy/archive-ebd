import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getSupabase } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { Session } from '@supabase/supabase-js';
import { AlertTriangle, Settings } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = getSupabase();
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } catch (e) {
      setConfigError(e instanceof Error ? e.message : 'Unknown configuration error');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
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
              To use the Archive System, you need to connect your Supabase project.
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
            Add these to your project "Secrets" in the AI Studio settings sidepanel.
          </p>
          <div className="pt-4 border-t border-border">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mono-text">
              System Core • Configuration Hub
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard isAuth={!!session} />} />
        <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
        <Route 
          path="/admin" 
          element={session ? <Admin /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
