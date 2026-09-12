import React, { useState } from 'react';
import { Sparkles, MessageSquare, Info, ShieldCheck, Eye, ChevronRight } from 'lucide-react';

export default function EvidenceTimeline({ results, onOpenContext, query }) {
  const [hoveredResult, setHoveredResult] = useState(null);

  if (!results || results.length === 0) return null;

  const AVATAR_COLORS = {
    Abhishek: "from-blue-600 to-indigo-600",
    Priya: "from-purple-600 to-pink-600",
    Rahul: "from-amber-500 to-orange-600",
    Neha: "from-emerald-500 to-teal-600",
    Arjun: "from-cyan-500 to-blue-600",
    Sneha: "from-rose-500 to-red-600",
    Karan: "from-indigo-600 to-purple-600",
    Riya: "from-fuchsia-600 to-pink-600"
  };

  return (
    <div className="space-y-6 my-8 animate-fade-in">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold dark:text-white light:text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" /> Evidence Message Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Group chat messages retrieved by semantic meaning & decision context
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold">
          {results.length} Evidence Matches
        </span>
      </div>

      {/* Vertical Connected Timeline Container */}
      <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-slate-800/80 light:border-slate-300 ml-3 sm:ml-4">
        
        {results.map((item, index) => {
          const sender = item.message.sender || "User";
          const colorGradient = AVATAR_COLORS[sender] || "from-blue-600 to-purple-600";
          const semanticScorePct = Math.round((item.score_breakdown.semantic_score || 0.85) * 100);
          const isTopMatch = index === 0;

          return (
            <div key={item.message.id} className="relative group animate-scale-in" style={{ animationDelay: `${index * 80}ms` }}>
              
              {/* Timeline Node Icon */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-4 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md ${
                isTopMatch ? 'bg-blue-600 ring-4 ring-blue-500/20' : 'bg-slate-800 border border-slate-700'
              }`}>
                #{index + 1}
              </div>

              {/* Message Card */}
              <div
                className={`glass-panel p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                  isTopMatch
                    ? 'border-blue-500/50 shadow-xl shadow-blue-500/10'
                    : 'dark:border-slate-800/80 light:border-slate-200 hover:border-blue-500/30'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b dark:border-slate-800/60 light:border-slate-200">
                  
                  {/* Sender Info */}
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${colorGradient} text-white font-bold text-xs flex items-center justify-center shadow-md`}>
                      {sender[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm dark:text-white light:text-slate-900">{sender}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.message.timestamp.replace('T', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-400 font-mono">
                        Thread: {item.message.thread_id}
                      </span>
                    </div>
                  </div>

                  {/* Semantic Relevance Badge & Hover Explanation */}
                  <div className="relative">
                    <div
                      onMouseEnter={() => setHoveredResult(item.message.id)}
                      onMouseLeave={() => setHoveredResult(null)}
                      className="cursor-help flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold font-mono"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Semantic relevance · {semanticScorePct}%</span>
                      <Info className="w-3 h-3 text-slate-400 ml-1" />
                    </div>

                    {/* Hover Tooltip "Why this result?" */}
                    {hoveredResult === item.message.id && (
                      <div className="absolute right-0 top-8 z-30 w-64 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-blue-500/40 animate-fade-in">
                        <p className="font-bold text-blue-400 mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Why this result?
                        </p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Strong semantic match: contains agreement + destination decision context even without matching exact keywords.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Body Text */}
                <div className="my-3">
                  <p className="text-base font-medium dark:text-slate-100 light:text-slate-800 leading-relaxed font-sans">
                    "{item.message.text}"
                  </p>
                </div>

                {/* Card Footer: Match Reason Pills & Context Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t dark:border-slate-800/60 light:border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {item.match_reasons.map((r, rIdx) => (
                      <span key={rIdx} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-800/80 light:bg-slate-100 text-slate-300 light:text-slate-700 border dark:border-slate-700 light:border-slate-200">
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* View Conversation Context Action */}
                  <button
                    onClick={() => onOpenContext(item)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-all hover:translate-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View conversation context</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
