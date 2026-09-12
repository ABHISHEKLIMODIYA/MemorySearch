import React, { useState, useRef, useEffect } from 'react';
import { Database, ChevronDown, Check, Plus, Trash2, Layers, Sparkles, MessageCircle } from 'lucide-react';

export default function DatasetSelector({
  datasets = [],
  activeDatasetId = 'default',
  onSelectDataset,
  onOpenUpload,
  onDeleteDataset,
  loading = false
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeDataset = datasets.find(d => d.id === activeDatasetId) || datasets[0] || {
    id: 'default',
    name: 'Synthetic Group Chat (Default)',
    message_count: 4200
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border dark:border-slate-800 light:border-slate-300 dark:bg-slate-900/80 light:bg-white hover:border-blue-500/50 transition-all text-left shadow-sm group"
        title="Select Chat Dataset"
      >
        <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-500 group-hover:scale-105 transition-transform">
          <Database className="w-4 h-4" />
        </div>
        
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[140px] truncate">
              {activeDataset.name}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
              {activeDataset.message_count || 0} msgs
            </span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 glass-panel rounded-2xl p-2.5 border border-slate-700/60 shadow-2xl z-50 animate-fade-in backdrop-blur-xl bg-slate-950/95 dark:bg-slate-950/95 text-white">
          
          <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>AVAILABLE CHAT DATASETS</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {datasets.length} Total
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-1 custom-scrollbar">
            {datasets.map((d) => {
              const isActive = d.id === activeDatasetId;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    if (!isActive && onSelectDataset) {
                      onSelectDataset(d.id);
                      setOpen(false);
                    }
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-blue-600/15 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 pr-2 overflow-hidden">
                    <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                    }`}>
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate">
                          {d.name}
                        </p>
                        {d.is_default && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{d.message_count} messages</span>
                        {d.participants && d.participants.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{d.participants.length} members</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isActive ? (
                      <div className="p-1 rounded-full bg-blue-500 text-white shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      !d.is_default && onDeleteDataset && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDataset(d.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                          title="Delete Dataset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-slate-800/80 mt-1">
            <button
              onClick={() => {
                setOpen(false);
                if (onOpenUpload) onOpenUpload();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Chat Dataset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
