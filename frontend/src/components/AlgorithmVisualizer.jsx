import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const AlgorithmVisualizer = () => {
  const [text, setText] = useState('welcometo spamshieldsecurefilters');
  const [pattern, setPattern] = useState('spamshield');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(800); // ms per step

  // Animation state variables
  const [iPos, setIPos] = useState(-1); // Current text align pointer (m - 1 + shift)
  const [jPos, setJPos] = useState(-1); // Current match offset in pattern (from m-1 down to 0)
  const [mismatchedIndex, setMismatchedIndex] = useState(null);
  const [matchedPositions, setMatchedPositions] = useState([]);
  const [checkedCells, setCheckedCells] = useState({});
  const [logs, setLogs] = useState([]);
  const [shiftTable, setShiftTable] = useState({});

  const stateRef = useRef({ isPlaying, isPaused, speed, text, pattern, iPos, jPos });

  useEffect(() => {
    stateRef.current = { isPlaying, isPaused, speed, text, pattern, iPos, jPos };
  }, [isPlaying, isPaused, speed, text, pattern, iPos, jPos]);

  // Build shift table when pattern changes
  useEffect(() => {
    const m = pattern.length;
    if (m === 0) return;
    const table = {};
    for (let index = 0; index < m - 1; index++) {
      table[pattern[index]] = m - 1 - index;
    }
    setShiftTable(table);
  }, [pattern]);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev]);
  };

  const sleep = (ms) => {
    return new Promise(resolve => {
      const checkPause = () => {
        if (!stateRef.current.isPlaying) {
          resolve(false);
        } else if (stateRef.current.isPaused) {
          setTimeout(checkPause, 100);
        } else {
          setTimeout(resolve, ms);
        }
      };
      checkPause();
    });
  };

  const resetViz = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setIPos(-1);
    setJPos(-1);
    setMismatchedIndex(null);
    setMatchedPositions([]);
    setCheckedCells({});
    setLogs(['System ready. Command sequence loaded.']);
  };

  const runSearch = async () => {
    if (isPlaying) {
      if (isPaused) {
        setIsPaused(false);
        addLog('Resuming animation flow...');
        return;
      }
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    setMatchedPositions([]);
    setCheckedCells({});
    setLogs(['Initializing Horspool Scan Engine...']);

    const n = text.length;
    const m = pattern.length;

    if (m === 0 || m > n) {
      addLog('Error: Invalid text or pattern bounds.');
      setIsPlaying(false);
      return;
    }

    // Build local shift table
    const table = {};
    for (let k = 0; k < m - 1; k++) {
      table[pattern[k]] = m - 1 - k;
    }

    let i = m - 1;
    setIPos(i);

    while (i < n && stateRef.current.isPlaying) {
      setIPos(i);
      setCheckedCells({});
      setMismatchedIndex(null);
      addLog(`Aligning pattern at text offset ${i - m + 1}`);
      await sleep(speed);

      if (!stateRef.current.isPlaying) break;

      let match = true;
      const currentChecked = {};

      for (let j = m - 1; j >= 0; j--) {
        if (!stateRef.current.isPlaying) break;
        
        const textIdx = i - (m - 1 - j);
        setJPos(j);
        currentChecked[textIdx] = 'checking';
        setCheckedCells({ ...currentChecked });
        
        await sleep(speed / 2);

        if (pattern[j] !== text[textIdx]) {
          currentChecked[textIdx] = 'failed';
          setCheckedCells({ ...currentChecked });
          setMismatchedIndex(textIdx);
          match = false;
          addLog(`Mismatch: Pattern '${pattern[j]}' != Text '${text[textIdx]}' at index ${textIdx}`);
          break;
        } else {
          currentChecked[textIdx] = 'success';
          setCheckedCells({ ...currentChecked });
        }
      }

      if (!stateRef.current.isPlaying) break;

      if (match) {
        setMatchedPositions(prev => [...prev, i - m + 1]);
        addLog(`MATCH CONFIRMED starting at index ${i - m + 1}!`);
        await sleep(speed);
      }

      // Calculate shift
      const charAtI = text[i];
      const shift = table[charAtI] ?? m;
      addLog(`Character at text comparison boundary index ${i} is '${charAtI === ' ' ? 'Space' : charAtI}'. Shift table value → ${shift}`);
      
      await sleep(speed);
      if (!stateRef.current.isPlaying) break;

      i += shift;
      addLog(`Shifting right by ${shift} positions...`);
    }

    if (stateRef.current.isPlaying) {
      addLog('Scan complete. Horspool match protocol finished.');
      setIsPlaying(false);
      setIPos(-1);
      setJPos(-1);
    }
  };

  const pauseViz = () => {
    setIsPaused(!isPaused);
    addLog(isPaused ? 'Resuming...' : 'Animation paused.');
  };

  const charWidth = 48; // px

  return (
    <div className="space-y-6">
      {/* Simulation Editor Settings */}
      <div className="glass p-6 rounded-2xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-cyan-400 font-mono">
          Engine Input Buffer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1.5">Text String</label>
            <input
              type="text"
              value={text}
              disabled={isPlaying}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1.5">Pattern to Find</label>
            <input
              type="text"
              value={pattern}
              disabled={isPlaying}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800 focus:outline-none focus:border-cyan-500/50 text-gray-200 text-sm font-mono"
            />
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={runSearch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              <Play size={15} />
              <span>{isPlaying && isPaused ? 'Resume' : 'Run Scan'}</span>
            </button>
            <button
              onClick={pauseViz}
              disabled={!isPlaying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-all duration-300"
            >
              <Pause size={15} />
              <span>{isPaused ? 'Unpause' : 'Pause'}</span>
            </button>
            <button
              onClick={resetViz}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white transition-all duration-300"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono">Speed: {speed}ms</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="accent-cyan-500 h-1 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Simulator Visual View */}
      <div className="glass p-6 rounded-2xl border border-gray-800 space-y-8 overflow-x-auto">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-purple-400 font-mono">
          Visual Alignment Simulator
        </h3>

        <div className="min-w-max pb-4 space-y-4">
          {/* Text Character Row */}
          <div className="flex items-center gap-1">
            <div className="w-20 text-xs font-mono text-gray-500 font-semibold uppercase">Text:</div>
            <div className="flex gap-1">
              {text.split('').map((char, index) => {
                const isChecked = checkedCells[index];
                const isMatchStart = matchedPositions.includes(index);
                let bgClass = 'bg-gray-900/40 border-gray-800';
                if (isChecked === 'checking') bgClass = 'bg-cyan-500/20 border-cyan-500';
                if (isChecked === 'success') bgClass = 'bg-emerald-500/20 border-emerald-500';
                if (isChecked === 'failed') bgClass = 'bg-red-500/20 border-red-500';
                if (isMatchStart) bgClass = 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border-emerald-400';

                return (
                  <div
                    key={index}
                    className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl border text-sm font-semibold font-mono transition-all duration-300 ${bgClass}`}
                  >
                    <span>{char === ' ' ? '\u00A0' : char}</span>
                    <span className="text-[9px] text-gray-600 font-normal">{index}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pattern Character Row with margin shifts */}
          <div className="flex items-center gap-1">
            <div className="w-20 text-xs font-mono text-gray-500 font-semibold uppercase">Pattern:</div>
            <div 
              className="flex gap-1 transition-all duration-500 ease-out"
              style={{ 
                marginLeft: iPos !== -1 ? `${(iPos - pattern.length + 1) * (charWidth + 4)}px` : '0px' 
              }}
            >
              {pattern.split('').map((char, index) => {
                const isCurrentPointer = jPos === index;
                const isMismatch = mismatchedIndex !== null && (iPos - (pattern.length - 1 - index)) === mismatchedIndex;

                let borderClass = 'border-purple-500/30 bg-purple-500/10 text-purple-300';
                if (isCurrentPointer) borderClass = 'border-cyan-400 bg-cyan-500/20 text-cyan-300 scale-105';
                if (isMismatch) borderClass = 'border-red-500 bg-red-500/30 text-red-300 animate-bounce';

                return (
                  <div
                    key={index}
                    className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl border text-sm font-semibold font-mono transition-all duration-300 ${borderClass}`}
                  >
                    <span>{char === ' ' ? '\u00A0' : char}</span>
                    <span className="text-[9px] opacity-60 font-normal">{index}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Output Console Log and Shift Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bad Character Shift Table */}
        <div className="glass p-6 rounded-2xl border border-gray-800 flex flex-col h-72">
          <h4 className="text-xs font-bold tracking-wider uppercase text-gray-400 font-mono mb-4">
            Bad Character Table (Shift Vector)
          </h4>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm">
            <div className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-gray-950/40 border border-gray-900">
              <span className="text-gray-400">Other ASCII</span>
              <span className="text-purple-400 font-bold">{pattern.length}</span>
            </div>
            {Object.entries(shiftTable).map(([char, shift]) => (
              <div 
                key={char} 
                className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-gray-900/20 border border-gray-900"
              >
                <span className="text-gray-300 font-bold">
                  {char === ' ' ? 'Space ( )' : `'${char}'`}
                </span>
                <span className="text-cyan-400 font-bold">{shift}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Console Logs */}
        <div className="glass p-6 rounded-2xl border border-gray-800 md:col-span-2 flex flex-col h-72">
          <h4 className="text-xs font-bold tracking-wider uppercase text-gray-400 font-mono mb-4">
            Execution Log Output
          </h4>
          <div className="flex-1 overflow-y-auto bg-black/40 border border-gray-900 rounded-xl p-4 font-mono text-xs space-y-2.5 text-gray-400">
            {logs.map((log, idx) => {
              let color = 'text-gray-400';
              if (log.includes('MATCH CONFIRMED')) color = 'text-emerald-400 font-semibold';
              if (log.includes('Mismatch')) color = 'text-red-400';
              if (log.includes('Initializing') || log.includes('complete')) color = 'text-cyan-400';
              
              return (
                <div key={idx} className={`${color} leading-relaxed`}>
                  &gt; {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;
