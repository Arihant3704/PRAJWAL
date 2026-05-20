import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Cpu, 
  BarChart3, 
  MessageSquareCode, 
  UserSquare, 
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';

export const Sidebar = ({ 
  currentPage, 
  setCurrentPage, 
  user, 
  onLogout 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'detector', name: 'Spam Scanner', icon: ShieldAlert },
    { id: 'algorithm', name: 'Horspool Engine', icon: Cpu },
    { id: 'performance', name: 'Performance Logs', icon: BarChart3 },
    { id: 'about', name: 'System Info', icon: UserSquare },
    { id: 'contact', name: 'Support Node', icon: MessageSquareCode },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-45 w-64 glass border-r border-gray-800/60 flex flex-col justify-between
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:block'}
      `}>
        {/* Top Header */}
        <div className="p-6 border-b border-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 cyber-glow-cyan">
              <Shield size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                SpamShield
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                Secure System v1.0
              </p>
            </div>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'border border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-gray-400'} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile Section */}
        {user && (
          <div className="p-4 border-t border-gray-800/40 bg-gray-950/20">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-900/40 border border-gray-800/30 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm font-mono">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-300 truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate font-mono">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs font-semibold transition-all duration-300"
            >
              <LogOut size={14} />
              <span>Disconnect Session</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
