import React from 'react';
import { Cpu, Server, ShieldCheck, Database, Award } from 'lucide-react';

export const About = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">System Info & Mechanics</h2>
        <p className="text-xs text-gray-500 font-mono">Detailed analysis of the Boyer-Moore-Horspool string matching protocol.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Algorithm Block */}
        <div className="glass p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-white text-sm">Boyer-Moore-Horspool Mechanics</h3>
          </div>
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            The Horspool algorithm is a simplification of the Boyer-Moore string-matching algorithm. It precomputes a "Bad Character Shift Table" before initiating searches.
          </p>
          <div className="space-y-2 text-xs font-mono text-gray-400 bg-black/40 p-4 rounded-xl border border-gray-900 leading-relaxed">
            <h4 className="font-semibold text-cyan-300">How it skips text:</h4>
            <ul className="list-disc pl-4 space-y-1 text-gray-400">
              <li>Aligns pattern at the beginning of the text.</li>
              <li>Compares characters from right to left (ending index of pattern).</li>
              <li>On mismatch at the last index, checks the value in the shift table for that specific text character.</li>
              <li>Shifts the search window right by the table value, completely skipping unmatching indices!</li>
            </ul>
          </div>
        </div>

        {/* Database & Architecture Block */}
        <div className="glass p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Server size={20} />
            </div>
            <h3 className="font-bold text-white text-sm">Decoupled Tech Stack</h3>
          </div>
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            SpamShield operates as a split application for performance and scalability:
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 space-y-1">
              <ShieldCheck className="text-cyan-400 mb-1" size={16} />
              <p className="font-bold text-gray-200">Vite & React</p>
              <p className="text-[10px] text-gray-500">Serves UI assets over CDN nodes globally.</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 space-y-1">
              <Database className="text-purple-400 mb-1" size={16} />
              <p className="font-bold text-gray-200">MongoDB Atlas</p>
              <p className="text-[10px] text-gray-500">Manages persistent user, scans, and message logs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Info Block */}
      <div className="glass p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Award size={20} />
          </div>
          <h3 className="font-bold text-white text-sm">Project & Team Profile</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
          <div className="space-y-1.5 p-4 rounded-xl bg-gray-950/40 border border-gray-900">
            <span className="text-gray-500">Project Lead</span>
            <p className="font-bold text-cyan-300 text-sm">Prajwal R</p>
            <p className="text-gray-400">Full-Stack Engineer & Algorithm Architect</p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-gray-950/40 border border-gray-900">
            <span className="text-gray-500">Development Context</span>
            <p className="font-bold text-purple-300 text-sm">Spam Email Mitigation Project</p>
            <p className="text-gray-400">Comparing pattern search performance constraints in cyber-defense.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
