import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Play, Zap, Info, BarChart } from 'lucide-react';
import { safeFetch } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Performance = ({ token, apiUrl }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [testSize, setTestSize] = useState('10KB');

  const runBenchmark = async () => {
    setLoading(true);
    setError('');
    
    // Generate mock text payload of selected size for backend testing
    let size = 1000;
    if (testSize === '50KB') size = 50000;
    if (testSize === '100KB') size = 100000;

    const baseText = "urgent congratulations win money click here free offer claims lottery prize limited offers. ";
    const textBuffer = baseText.repeat(Math.ceil(size / baseText.length));

    try {
      const response = await safeFetch(`${apiUrl}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: `Benchmark Test (${testSize})`,
          content: textBuffer
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Benchmark scan failed');
      }

      const { comparison } = data;

      setChartData({
        labels: ['Horspool (Shift Search)', 'Knuth-Morris-Pratt (KMP)', 'Naive Pattern Matcher'],
        datasets: [
          {
            label: 'Execution Speed (ms) - Lower is Better',
            data: [comparison.horspool, comparison.kmp, comparison.naive],
            backgroundColor: [
              'rgba(6, 182, 212, 0.55)',   // Cyan
              'rgba(147, 51, 234, 0.55)',  // Purple
              'rgba(244, 63, 94, 0.55)'    // Rose
            ],
            borderColor: ['#06b6d4', '#9333ea', '#f43f5e'],
            borderWidth: 1.5
          }
        ]
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 11 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 10 } } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Performance Log Analytics</h2>
        <p className="text-xs text-gray-500 font-mono">Benchmark Horspool String Matching against other standard search algorithms.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-mono">
          &gt; BENCHMARK ERROR: {error}
        </div>
      )}

      {/* Live Benchmark Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Run Test Controller */}
        <div className="glass p-6 rounded-2xl border border-gray-800 space-y-4 h-full flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono flex items-center gap-2">
              <Zap size={16} />
              Benchmark Node Control
            </h3>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Synthesizes a large text buffer containing spam patterns to calculate matching speeds.
            </p>

            <div className="space-y-1.5 pt-2">
              <label className="block text-[10px] text-gray-500 font-mono uppercase">Payload Size</label>
              <select
                value={testSize}
                disabled={loading}
                onChange={(e) => setTestSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-300 text-xs font-mono"
              >
                <option value="10KB">10 KB Buffer</option>
                <option value="50KB">50 KB Buffer</option>
                <option value="100KB">100 KB Buffer</option>
              </select>
            </div>
          </div>

          <button
            onClick={runBenchmark}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-cyan-500/10 active:scale-95"
          >
            <Play size={12} />
            <span>{loading ? 'Executing Test Cycle...' : 'Execute Benchmark Cycle'}</span>
          </button>
        </div>

        {/* Dynamic Chart Display */}
        <div className="glass p-6 rounded-2xl border border-gray-800 lg:col-span-2 h-72 flex flex-col">
          <h3 className="text-sm font-bold tracking-wider uppercase text-purple-400 font-mono mb-4 flex items-center gap-2">
            <BarChart size={16} />
            Comparison Diagnostics (Speed in ms)
          </h3>
          <div className="flex-1 relative">
            {chartData ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-xs border border-dashed border-gray-800 rounded-xl">
                Execute a benchmark cycle to compile speed chart.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Complexity Reference Chart */}
      <div className="glass rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800/40">
          <h3 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono flex items-center gap-2">
            <Info size={16} />
            Algorithmic Complexity Lookup
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-900/30 text-gray-400 uppercase tracking-wider border-b border-gray-800/40">
              <tr>
                <th className="px-6 py-4">Algorithm</th>
                <th className="px-6 py-4">Best Case</th>
                <th className="px-6 py-4">Average Case</th>
                <th className="px-6 py-4">Worst Case</th>
                <th className="px-6 py-4">Space Complexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30 text-gray-300">
              <tr className="hover:bg-gray-900/10 transition-colors">
                <td className="px-6 py-4 font-semibold text-cyan-400">Boyer-Moore-Horspool</td>
                <td className="px-6 py-4">$O(n/m)$</td>
                <td className="px-6 py-4">$O(n)$</td>
                <td className="px-6 py-4">$O(n \times m)$</td>
                <td className="px-6 py-4">$O(\Sigma)$ (alphabet size)</td>
              </tr>
              <tr className="hover:bg-gray-900/10 transition-colors">
                <td className="px-6 py-4 font-semibold text-purple-400">Knuth-Morris-Pratt (KMP)</td>
                <td className="px-6 py-4">$O(n)$</td>
                <td className="px-6 py-4">$O(n + m)$</td>
                <td className="px-6 py-4">$O(n + m)$</td>
                <td className="px-6 py-4">$O(m)$ (pattern array)</td>
              </tr>
              <tr className="hover:bg-gray-900/10 transition-colors">
                <td className="px-6 py-4 font-semibold text-rose-400">Naive Search</td>
                <td className="px-6 py-4">$O(n)$</td>
                <td className="px-6 py-4">$O(n \times m)$</td>
                <td className="px-6 py-4">$O(n \times m)$</td>
                <td className="px-6 py-4">$O(1)$</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Performance;
