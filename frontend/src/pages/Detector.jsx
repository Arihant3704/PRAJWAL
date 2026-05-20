import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Search, 
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const Detector = ({ token, apiUrl }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, content })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Detection scanner failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setSubject('');
    setContent('');
    setResult(null);
    setError('');
  };

  // Highlights rendering function
  const renderHighlightedContent = (text, matches) => {
    if (!text || matches.length === 0) return <span>{text}</span>;
    
    // Sort matches by index to prevent index shifting problems
    const sortedMatches = [...matches].sort((a, b) => a.position - b.position);
    const elements = [];
    let lastIdx = 0;

    for (let index = 0; index < sortedMatches.length; index++) {
      const match = sortedMatches[index];
      if (match.position < lastIdx) continue; // Skip overlapping keyword matches

      // Text chunk preceding the keyword
      if (match.position > lastIdx) {
        elements.push(
          <span key={`text-${lastIdx}-${match.position}`}>
            {text.substring(lastIdx, match.position)}
          </span>
        );
      }

      // Highlighting the keyword
      const keywordLen = match.keyword.length;
      const matchedString = text.substring(match.position, match.position + keywordLen);
      elements.push(
        <span 
          key={`match-${match.position}-${index}`} 
          className="mx-0.5 px-1 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 font-semibold cyber-glow-rose font-mono"
        >
          {matchedString}
        </span>
      );

      lastIdx = match.position + keywordLen;
    }

    // Remaining text after the last match
    if (lastIdx < text.length) {
      elements.push(<span key={`text-end-${lastIdx}`}>{text.substring(lastIdx)}</span>);
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Secure Email Scanner</h2>
        <p className="text-xs text-gray-500 font-mono">Scan raw text buffers for spam signatures in sub-linear time.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-mono">
          &gt; SCANNER RUNTIME EXCEPTION: {error}
        </div>
      )}

      {/* Grid: Editor Form and Live Analysis Report */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Editor Form */}
        <div className="glass p-6 rounded-2xl border border-gray-800 xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800/40 pb-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono flex items-center gap-2">
              <FileText size={16} />
              Email Body Buffer
            </h3>
            {result && (
              <button 
                onClick={clearForm}
                className="text-xs text-gray-500 hover:text-cyan-400 font-mono transition-colors"
              >
                Clear Buffer
              </button>
            )}
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Email Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Congratulations! You won a cash prize!"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Raw Email Content</label>
              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the email content here. Try including words like 'win money', 'congratulations', 'urgent', or 'limited offer' to trigger search hits..."
                className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono resize-y leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-md shadow-cyan-500/10 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Running Horspool Search...' : 'Execute Spam Scan'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Live Analysis Report Panel */}
        <div className="xl:col-span-5 space-y-6">
          {!result && !loading ? (
            <div className="glass p-8 rounded-2xl border border-gray-800 text-center h-[345px] flex flex-col items-center justify-center space-y-3">
              <Search className="text-gray-600" size={40} />
              <p className="text-xs text-gray-500 font-mono leading-relaxed max-w-xs">
                Scan engine is idle. Submit a raw email content payload to populate diagnostic graphs.
              </p>
            </div>
          ) : loading ? (
            <div className="glass p-8 rounded-2xl border border-gray-800 text-center h-[345px] flex flex-col items-center justify-center space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              </div>
              <p className="text-xs text-cyan-400 font-mono animate-pulse">
                Analyzing buffer arrays...
              </p>
            </div>
          ) : (
            result && (
              <div className="glass p-6 rounded-2xl border border-gray-800 space-y-5">
                <h3 className="text-sm font-bold tracking-wider uppercase text-purple-400 font-mono border-b border-gray-800/40 pb-3">
                  Diagnostic Scan Report
                </h3>

                {/* Spam Result Banner */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                  result.isSpam 
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' 
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                }`}>
                  {result.isSpam ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                  <div>
                    <h4 className="font-bold text-sm">
                      {result.isSpam ? 'SPAM SIGNATURE DETECTED' : 'CLEAN / VERIFIED EMAIL'}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">Spam score calculated at {result.spamScore}%</p>
                  </div>
                </div>

                {/* Explanatory summary text */}
                <p className="text-xs text-gray-400 font-mono leading-relaxed bg-gray-950/45 p-3 rounded-xl border border-gray-900">
                  {result.explanation}
                </p>

                {/* Scan speed comparisons */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-500">Matches</span>
                    <span className="text-rose-400 font-bold">{result.keywordCount} hits</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-500">Speed</span>
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      <Zap size={11} />
                      {result.executionTime} ms
                    </span>
                  </div>
                </div>

                {/* Algorithmic benchmarking list */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold tracking-wider uppercase text-gray-500 font-mono">
                    Algorithm Run Time Metrics
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-950/30 border border-gray-900">
                      <span className="text-cyan-400 font-semibold">Horspool (Shift Matching)</span>
                      <span className="text-cyan-300 font-bold">{result.comparison.horspool} ms</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-950/10 border border-gray-900/60">
                      <span className="text-gray-400">Knuth-Morris-Pratt (KMP)</span>
                      <span className="text-gray-300 font-bold">{result.comparison.kmp} ms</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-950/10 border border-gray-900/60">
                      <span className="text-gray-400">Naive String Matching</span>
                      <span className="text-gray-300 font-bold">{result.comparison.naive} ms</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Render highlighted viewport at the bottom */}
      {result && (
        <div className="glass p-6 rounded-2xl border border-gray-800 space-y-3">
          <h3 className="text-sm font-bold tracking-wider uppercase text-cyan-400 font-mono flex items-center gap-2 border-b border-gray-800/40 pb-3">
            <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
            Engine Pattern Match Highlighter
          </h3>
          <div className="p-5 rounded-xl bg-gray-950/45 border border-gray-900 text-sm leading-relaxed text-gray-300 font-sans whitespace-pre-wrap">
            {renderHighlightedContent(content, result.matches)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Detector;
