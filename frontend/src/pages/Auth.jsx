import React, { useState } from 'react';
import { Shield, Lock, Mail, User, ArrowRight, Activity } from 'lucide-react';

export const Auth = ({ onLoginSuccess, apiUrl }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Network communication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize demo session');
      }
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            SpamShield Core
          </h2>
          <p className="text-xs text-gray-400 text-center font-mono">
            {isRegister ? 'DEPLOY NEW IDENTITY MODULE' : 'ESTABLISH SECURE TERMINAL SESSION'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-mono leading-relaxed">
            &gt; ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
                  placeholder="e.g. Prajwal R"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
                placeholder="developer@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Access Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-cyan-500/10 active:scale-95"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Register Identity' : 'Initiate Login'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0b0f19] px-2 text-gray-500 font-mono">OR</span></div>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-cyan-500/5"
        >
          <Activity size={14} />
          <span>Quick Demo Access</span>
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-gray-400 hover:text-cyan-400 font-mono transition-colors duration-300"
          >
            {isRegister 
              ? 'ALREADY REGISTERED? DECRYPT SESSION LOGIN' 
              : 'NEW INTERFACE DETECTED? DEPLOY USER SCHEMAS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
