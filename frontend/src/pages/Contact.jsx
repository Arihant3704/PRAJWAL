import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquareCode, Mail, User } from 'lucide-react';
import { safeFetch } from '../utils/api';

export const Contact = ({ apiUrl }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await safeFetch(`${apiUrl}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch feedback message');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Support Node Interface</h2>
        <p className="text-xs text-gray-500 font-mono">Submit messages or support tickets directly to the system database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Contact Form */}
        <div className="glass p-6 rounded-2xl border border-gray-800 lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800/40 pb-3">
            <MessageSquareCode size={18} className="text-cyan-400" />
            <h3 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono">
              Compose Support Dispatch
            </h3>
          </div>

          {success && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>&gt; DISPATCH TRANSMITTED SECURELY TO DATABASE LAYER.</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-mono">
              &gt; TRANSMISSION ERROR: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Message / Query Body</label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message details here..."
                className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono resize-y leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-md shadow-cyan-500/10 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Dispatching Message...' : 'Transmit Message'}</span>
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="glass p-6 rounded-2xl border border-gray-800 lg:col-span-4 space-y-4 font-mono text-xs text-gray-400 leading-relaxed">
          <h3 className="text-sm font-bold tracking-wider uppercase text-purple-400 border-b border-gray-800/40 pb-3">
            System Node Stats
          </h3>
          <p>
            Submitting this form executes a database transaction seeding your query logs directly into MongoDB Atlas.
          </p>
          <div className="space-y-1.5 pt-2">
            <p className="text-gray-500 uppercase text-[10px]">Access Endpoint</p>
            <p className="text-cyan-300 font-bold">/api/contacts</p>
            <p className="text-gray-500 uppercase text-[10px] pt-1">Encryption Mode</p>
            <p className="text-purple-300 font-bold">TLS 1.3 Tunneling</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
