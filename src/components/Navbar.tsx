import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Lock } from 'lucide-react';
import { clearAuthenticated } from '../lib/auth';

interface NavbarProps {
  isAuth: boolean;
  onAuthChange?: () => void;
}

export default function Navbar({ isAuth, onAuthChange }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthenticated();
    onAuthChange?.();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="font-sans font-black tracking-widest text-lg uppercase text-accent">
              Eberardos <span className="text-white">Archive</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuth ? (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-hover text-muted hover:text-accent hover:border-accent/40 transition-all text-xs mono-text uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border-hover text-muted hover:text-accent hover:border-accent/40 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-border-hover transition-colors text-sm font-medium text-muted hover:text-white"
              >
                <Lock className="w-4 h-4" />
                <span>Access</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
