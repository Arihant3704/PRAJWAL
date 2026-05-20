import React, { useState, useEffect } from 'react';
import { MatrixBackground } from './components/MatrixBackground';
import { Sidebar } from './components/Sidebar';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Detector } from './pages/Detector';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import { Performance } from './pages/Performance';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

import { safeFetch } from './utils/api';

// Dynamic API detection (supports both local dev and production Render hosts)
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

export const App = () => {
  const [token, setToken] = useState(localStorage.getItem('spamshield_token'));
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  // Sync user profile on mount or token update
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setInitializing(false);
        return;
      }
      try {
        const response = await safeFetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setUser({ id: data._id, name: data.name, email: data.email });
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to sync authentication profile:', err);
      } finally {
        setInitializing(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLoginSuccess = (newToken, loggedUser) => {
    localStorage.setItem('spamshield_token', newToken);
    setToken(newToken);
    setUser(loggedUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('spamshield_token');
    setToken(null);
    setUser(null);
  };

  // Page Routing Selector
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            token={token || ''} 
            apiUrl={API_URL} 
            onNavigateToScan={() => setCurrentPage('detector')} 
          />
        );
      case 'detector':
        return <Detector token={token || ''} apiUrl={API_URL} />;
      case 'algorithm':
        return <AlgorithmVisualizer />;
      case 'performance':
        return <Performance token={token || ''} apiUrl={API_URL} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact apiUrl={API_URL} />;
      default:
        return <Dashboard token={token || ''} apiUrl={API_URL} onNavigateToScan={() => setCurrentPage('detector')} />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-cyan-400 font-mono text-xs tracking-widest animate-pulse">
        &gt; CONNECTING SECURE GATEWAY INSTANCE...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-gray-100 overflow-x-hidden font-sans">
      {/* Dynamic Background */}
      <MatrixBackground />

      {!token ? (
        // Unauthenticated View
        <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
          <Auth onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />
        </div>
      ) : (
        // Authenticated View
        <div className="relative z-10 flex min-h-screen">
          {/* Navigation Sidebar */}
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            user={user} 
            onLogout={handleLogout} 
          />

          {/* Main Content Viewport */}
          <main className="flex-1 min-w-0 lg:ml-64 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            {/* Dynamic Content Renderer */}
            <div className="max-w-6xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
