import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';

export default function SearchLoading({ query }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Understanding query & intent...",
    "Finding related conversations in vector space...",
    "Ranking zero-word-overlap semantic matches...",
    "Building synthesized AI answer & evidence context..."
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 200);
    const timer2 = setTimeout(() => setCurrentStep(2), 450);
    const timer3 = setTimeout(() => setCurrentStep(3), 750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 glass-panel rounded-3xl border dark:border-slate-800 light:border-slate-200 shadow-2xl text-center animate-scale-in my-8">
      
      {/* Top Animated Pulse Spinner */}
      <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-spin blur-md opacity-50"></div>
        <div className="relative w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
          <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold dark:text-white light:text-slate-900 mb-2">
        Searching your conversations
      </h3>
      <p className="text-xs text-slate-400 mb-6 italic">
        "{query}"
      </p>

      {/* 4-Stage Progress List */}
      <div className="space-y-3 max-w-md mx-auto text-left">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all duration-300 ${
                isDone
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : isCurrent
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-semibold shadow-md'
                  : 'bg-slate-900/30 border-slate-800 text-slate-500'
              }`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                  </div>
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                )}
              </div>
              <span className="flex-1">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
