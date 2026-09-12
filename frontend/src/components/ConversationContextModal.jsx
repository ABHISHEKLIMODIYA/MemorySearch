import React from 'react';
import { X, MessageSquare, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

export default function ConversationContextModal({ item, onClose }) {
  if (!item) return null;

  const targetMsg = item.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 border border-blue-500/40 shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 light:border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold dark:text-white light:text-slate-900">
                Conversation Thread Context
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Thread: {targetMsg.thread_id} • ID: {targetMsg.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full dark:bg-slate-800 light:bg-slate-100 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Thread Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-[#0b0f1a] dark:bg-[#0b0f1a] light:bg-slate-100 rounded-2xl border dark:border-slate-800 light:border-slate-300 font-sans">
          
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center mb-3">
            Surrounding Messages (+3 / -3 Context Window)
          </p>

          {/* Messages Before */}
          {item.context_before && item.context_before.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 pl-2 opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {msg.sender[0]}
              </div>
              <div className="text-xs bg-slate-900/60 light:bg-white p-3 rounded-2xl border dark:border-slate-800 light:border-slate-200 max-w-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold dark:text-slate-300 light:text-slate-800">{msg.sender}</span>
                  <span className="text-[10px] text-slate-500">{msg.timestamp.replace('T', ' ')}</span>
                </div>
                <p className="dark:text-slate-200 light:text-slate-700">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* TARGET MATCHED MESSAGE (HIGHLIGHED) */}
          <div className="relative my-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-purple-900/50 border-2 border-blue-500/80 shadow-xl animate-pulse-glow">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
              <Sparkles className="w-3 h-3" /> Target Semantic Match
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                {targetMsg.sender[0]}
              </div>
              <div className="text-xs flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-white text-sm">{targetMsg.sender}</span>
                  <span className="text-[11px] text-blue-300 font-mono">{targetMsg.timestamp.replace('T', ' ')}</span>
                </div>
                <p className="text-white font-semibold text-base leading-relaxed">
                  "{targetMsg.text}"
                </p>
              </div>
            </div>
          </div>

          {/* Messages After */}
          {item.context_after && item.context_after.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 pl-2 opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {msg.sender[0]}
              </div>
              <div className="text-xs bg-slate-900/60 light:bg-white p-3 rounded-2xl border dark:border-slate-800 light:border-slate-200 max-w-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold dark:text-slate-300 light:text-slate-800">{msg.sender}</span>
                  <span className="text-[10px] text-slate-500">{msg.timestamp.replace('T', ' ')}</span>
                </div>
                <p className="dark:text-slate-200 light:text-slate-700">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between border-t dark:border-slate-800 light:border-slate-200 pt-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl dark:bg-slate-800 light:bg-slate-200 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close Context
          </button>
          
          <button
            onClick={() => {
              alert(`Jumping to message ID ${targetMsg.id} in full chat stream.`);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
          >
            <span>Jump to Conversation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
