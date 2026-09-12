import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const endpoint = mode === 'login' ? 'login' : 'register';
    const payload = mode === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const userObj = data.user || {
        id: "usr_101",
        name: name || email.split('@')[0],
        email: email
      };

      localStorage.setItem('memorysearch_user', JSON.stringify(userObj));
      onLoginSuccess(userObj);
      onClose();
    } catch (err) {
      // Fallback local auth if API call fails
      const fallbackUser = {
        id: "usr_demo",
        name: name || email.split('@')[0] || "Demo User",
        email: email
      };
      localStorage.setItem('memorysearch_user', JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 border border-blue-500/40 shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 light:border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold dark:text-white light:text-slate-900">
              MemorySearch Account
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full dark:bg-slate-800 light:bg-slate-100 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/60 light:bg-slate-100 p-1 rounded-xl border dark:border-slate-800 light:border-slate-200 mb-6 text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Create Account
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 light:bg-white border dark:border-slate-800 light:border-slate-300 rounded-xl text-xs dark:text-white light:text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 light:bg-white border dark:border-slate-800 light:border-slate-300 rounded-xl text-xs dark:text-white light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 light:bg-white border dark:border-slate-800 light:border-slate-300 rounded-xl text-xs dark:text-white light:text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-40"
          >
            {loading ? "Processing..." : mode === 'login' ? "Sign In to MemorySearch" : "Register Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
