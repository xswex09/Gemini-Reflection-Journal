import React from 'react';
import { UserProfile } from '../types';
import { Sparkles, LogOut, ShieldCheck, Database } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  onSignOut: () => void;
  entryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onSignOut, entryCount }) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stone-900 tracking-tight">
                Gemini Reflection Journal
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Isolated Storage
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              AI-Augmented Introspection & Cloud Firestore History
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
              <Database className="w-3.5 h-3.5 text-stone-500" />
              <span>
                <strong>{entryCount}</strong> {entryCount === 1 ? 'entry' : 'entries'} saved
              </span>
            </div>

            <div className="flex items-center space-x-3 pl-3 border-l border-stone-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User profile'}
                  className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-stone-900 leading-tight">
                  {user.displayName || 'Authenticated User'}
                </p>
                <p className="text-[11px] text-stone-500 truncate max-w-[150px]">
                  {user.email || 'Google Account'}
                </p>
              </div>

              <button
                id="navbar-signout-btn"
                onClick={onSignOut}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors whitespace-nowrap"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
