import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Archive as ArchiveIcon, Plus, User } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

interface NavbarProps {
  isAuth: boolean;
}

export default function Navbar({ isAuth }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed:', e);
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-sans font-black tracking-widest text-lg uppercase text-accent">
              Eberardos <span className="text-white">Archive</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            {isAuth ? (
              <>
                <div className="flex items-center gap-2 text-xs font-mono text-muted">
                  <span className="hidden sm:inline">Admin:</span>
                  <span className="text-white">{import.meta.env.VITE_ADMIN_NAME || 'eber_01'}</span>
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-hover text-muted hover:text-accent hover:border-accent/40 transition-all"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-hover text-muted hover:text-accent hover:border-accent/40 transition-all"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
