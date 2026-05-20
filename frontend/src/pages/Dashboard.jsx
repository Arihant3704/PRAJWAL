import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  MailWarning, 
  Clock, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import { safeFetch } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Dashboard = ({ token, apiUrl, onNavigateToScan }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    spamScans: 0,
    cleanScans: 0,
    averageSpeed: 0,
    recentStats: []
  });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      const response = await safeFetch(`${apiUrl}/api/scans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to sync telemetry stats');
      }
      setStats(data.stats);
      setHistory(data.history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Chart 1: Spam vs Clean Ratio
  const doughnutData = {
    labels: ['Spam Detected', 'Clean / Verified'],
    datasets: [{
      data: [stats.spamScans, stats.cleanScans],
      backgroundColor: ['rgba(244, 63, 94, 0.65)', 'rgba(16, 185, 129, 0.65)'],
      borderColor: ['#f43f5e', '#10b981'],
      borderWidth: 1.5,
      hoverOffset: 4
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 11 } }
      }
    }
  };

  // Chart 2: Scan Speed History
  const lineData = {
    labels: stats.recentStats.map(s => s.date),
    datasets: [
      {
        label: 'Horspool Speed (ms)',
        data: stats.recentStats.map(s => s.speed),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 11 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 9 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 9 } } }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyan-400 font-mono text-sm animate-pulse">
        &gt; SYNCING SYSTEM METRICS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Threat Assessment Dashboard</h2>
          <p className="text-xs text-gray-500 font-mono">Live telemetry scan analysis and filter performance metrics.</p>
        </div>
        <button
          onClick={onNavigateToScan}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all duration-300 shadow-md shadow-cyan-500/10 active:scale-95"
        >
          <span>Open Scanner Console</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-mono">
          &gt; MONITOR ERROR: {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass p-5 rounded-2xl border border-gray-800/80 flex items-center justify-between relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Scans Completed</span>
            <h3 className="text-2xl font-bold text-white font-mono">{stats.totalScans}</h3>
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300">
            <Activity size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass p-5 rounded-2xl border border-gray-800/80 flex items-center justify-between relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Spam Intercepts</span>
            <h3 className="text-2xl font-bold text-rose-500 font-mono">{stats.spamScans}</h3>
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 group-hover:text-rose-500 group-hover:border-red-500/30 transition-all duration-300">
            <ShieldAlert size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass p-5 rounded-2xl border border-gray-800/80 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Clean Emails</span>
            <h3 className="text-2xl font-bold text-emerald-500 font-mono">{stats.cleanScans}</h3>
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all duration-300">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass p-5 rounded-2xl border border-gray-800/80 flex items-center justify-between relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Average Speed</span>
            <h3 className="text-2xl font-bold text-purple-400 font-mono">
              {stats.averageSpeed} <span className="text-xs font-normal text-gray-500">ms</span>
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all duration-300">
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {stats.totalScans > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl border border-gray-800 flex flex-col h-72">
            <h4 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-1.5">
              <MailWarning size={14} className="text-rose-500" />
              Spam-to-Clean Distribution
            </h4>
            <div className="flex-1 relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-gray-800 flex flex-col h-72">
            <h4 className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-cyan-400" />
              Scan Speed Timeline
            </h4>
            <div className="flex-1 relative">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>
      )}

      {/* History Log Section */}
      <div className="glass rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono">Recent Scans</h3>
            <p className="text-xs text-gray-500 font-mono">Historical logging of processed files.</p>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">
            No scans detected in records. Feed emails to the Spam Scanner to generate telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-900/30 text-gray-400 uppercase tracking-wider border-b border-gray-800/40">
                <tr>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Spam Score</th>
                  <th className="px-6 py-4">Matches</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30 text-gray-300">
                {history.map((scan) => (
                  <tr key={scan._id} className="hover:bg-gray-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-200">{scan.subject}</td>
                    <td className="px-6 py-4">
                      {scan.isSpam ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">
                          <ShieldAlert size={10} />
                          Spam
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                          <ShieldCheck size={10} />
                          Safe
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${scan.isSpam ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${scan.spamScore}%` }}
                          />
                        </div>
                        <span className="font-bold">{scan.spamScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {scan.matchedKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(scan.matchedKeywords)).slice(0, 3).map((kw, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-cyan-300 border border-gray-700/50">
                              {kw}
                            </span>
                          ))}
                          {new Set(scan.matchedKeywords).size > 3 && (
                            <span className="text-[10px] text-gray-500 font-sans">
                              +{new Set(scan.matchedKeywords).size - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-purple-400 font-bold flex items-center gap-1">
                      <Clock size={11} />
                      {scan.executionTime} ms
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(scan.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
