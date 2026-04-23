import React from 'react';
import { User, LogOut, FileText, LayoutDashboard } from 'lucide-react';
import { auth, logout, signInWithGoogle } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface NavbarProps {
  onNavigate: (view: 'dashboard' | 'editor') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const [user] = useAuthState(auth);

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => onNavigate('dashboard')}
      >
        <div className="bg-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          <FileText className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white italic font-serif">JobX</span>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <button 
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                currentView === 'dashboard' ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
              {user.photoURL && (
                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-zinc-800" />
              )}
              <span className="text-sm font-medium text-zinc-300 hidden sm:inline">{user.displayName}</span>
              <button 
                onClick={logout}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            <User className="w-4 h-4" />
            Sign In with Google
          </button>
        )}
      </div>
    </nav>
  );
};
