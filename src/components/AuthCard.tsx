import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Lock, Database, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AuthCardProps {
  onSignIn: () => Promise<void>;
  loading: boolean;
  authError: string | null;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSignIn, loading, authError }) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleGoogleClick = async () => {
    setInternalLoading(true);
    try {
      await onSignIn();
    } finally {
      setInternalLoading(false);
    }
  };

  const isBusy = loading || internalLoading;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-stone-50">
      <div className="max-w-xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-900 text-white mb-4 shadow-sm">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Welcome to Reflection Journal
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
              Your private sanctuary for introspection and creative brainstorming, powered by the{' '}
              <span className="font-semibold text-stone-900">Gemini 3.6 Flash API</span> and user-isolated{' '}
              <span className="font-semibold text-stone-900">Cloud Firestore</span>.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-medium">Authentication Notice:</strong> {authError}
                <p className="mt-1 text-rose-700">
                  If running inside an iframe preview, popups may need permissions. You can also open the app in a new window tab.
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-4">
            <button
              id="google-signin-btn"
              onClick={handleGoogleClick}
              disabled={isBusy}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold shadow-xs hover:border-stone-400 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isBusy ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                  <span>Connecting to Google Identity...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In with Google</span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </button>
          </div>

          {/* Privacy & Security Guarantee */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <div className="flex items-center space-x-2 text-xs font-semibold text-stone-800 uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Security & Data Isolation Highlights</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center space-x-1.5 font-medium text-stone-900 mb-1">
                  <Lock className="w-3.5 h-3.5 text-stone-700" />
                  <span>Owner-Bound Access</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Firestore rules enforce <code>request.auth.uid == userId</code>. Other users cannot read your entries.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center space-x-1.5 font-medium text-stone-900 mb-1">
                  <Database className="w-3.5 h-3.5 text-stone-700" />
                  <span>Zero Password Storage</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Federated authentication delegates credential safety completely to Google Identity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-stone-500 mt-4">
          All reflections and AI conversations remain strictly private to your authenticated account.
        </p>
      </div>
    </div>
  );
};
