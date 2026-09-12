import React, { useEffect, useRef } from 'react';
import { Search, Mic, Command, X, Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function HeroSearch({ 
  queryText, 
  setQueryText, 
  onSearch, 
  onSelectPrompt,
  loading 
}) {
  const inputRef = useRef(null);

  const PROMPT_CHIPS = [
    { label: "When did we decide to go to Manali?", tag: "Zero Overlap" },
    { label: "What was our Goa trip budget?", tag: "Budget" },
    { label: "Who suggested the hackathon?", tag: "Person" },
    { label: "What project ideas did we discuss?", tag: "Projects" },
    { label: "When did we finalize the trip dates?", tag: "Time Filter" }
  ];

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (queryText.trim()) {
      onSearch(queryText);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 text-center max-w-4xl mx-auto animate-fade-in">
      
      {/* Top AI Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
        <span>Meaning-Based Group Chat Intelligence</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight dark:text-white light:text-slate-900 leading-tight mb-4 font-sans">
        Search conversations by <span className="gradient-text">meaning</span>, not keywords.
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg dark:text-slate-400 light:text-slate-600 max-w-2xl font-normal leading-relaxed mb-10">
        Find the moment your group decided, discussed, planned, or agreed on something — even when you don't remember the exact words.
      </p>

      {/* Large Premium Search Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group">
        
        {/* Glow backdrop on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition duration-500 group-focus-within:opacity-75"></div>

        <div className="relative flex items-center bg-[#0d1322] dark:bg-[#0d1322] light:bg-white rounded-2xl border dark:border-slate-700/80 light:border-slate-300 shadow-2xl p-2 transition-all">
          
          <Search className="w-6 h-6 text-slate-400 absolute left-5 pointer-events-none" />

          <input
            ref={inputRef}
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Ask anything, e.g. 'When did we decide to go to Manali?'..."
            className="w-full pl-14 pr-32 py-4 bg-transparent dark:text-white light:text-slate-900 placeholder-slate-500 text-base focus:outline-none font-medium"
          />

          {/* Right Action Controls inside input */}
          <div className="absolute right-3 flex items-center gap-2">
            
            {/* Clear Button */}
            {queryText && (
              <button
                type="button"
                onClick={() => setQueryText('')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                title="Clear text"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Shortcut indicator */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 light:bg-slate-100 text-[10px] font-mono font-bold text-slate-400 border border-slate-700/50 light:border-slate-200">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>

            {/* Mic Icon */}
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-blue-400 rounded-xl transition-all"
              title="Voice Input (Demo)"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Clickable Example Prompt Chips */}
      <div className="mt-8 w-full max-w-2xl">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Try searching these natural language questions:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(chip.label)}
              className="text-xs px-3.5 py-2 rounded-xl border dark:border-slate-800 light:border-slate-200 dark:bg-slate-900/60 light:bg-white dark:hover:bg-slate-800 light:hover:bg-slate-50 dark:text-slate-300 light:text-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm flex items-center gap-2 group"
            >
              <span>"{chip.label}"</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">
                {chip.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
