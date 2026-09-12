import React, { useState } from 'react';
import { 
  PlusCircle, Clock, Bookmark, MessageSquare, Upload, 
  ChevronLeft, ChevronRight, Settings, Sparkles, Trash2 
} from 'lucide-react';

export default function Sidebar({ 
  onNewSearch, 
  recentSearches, 
  onSelectRecent, 
  onClearRecent,
  onOpenUpload,
  activeTab,
  setActiveTab
}) {
  const [collapsed, setCollapsed] = useState(false);

  const defaultRecent = [
    { title: "Manali trip decision", query: "When did we decide to go to Manali?" },
    { title: "Goa budget", query: "What was our Goa trip budget?" },
    { title: "Hackathon discussion", query: "Who suggested the hackathon?" },
    { title: "Project ideas", query: "What project ideas did we discuss?" }
  ];

  const displaySearches = recentSearches && recentSearches.length > 0 ? recentSearches : defaultRecent;

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-gray-800/40 dark:border-gray-800/40 light:border-gray-200/80 bg-[#0d1322]/80 dark:bg-[#0d1322]/80 light:bg-slate-50 transition-all duration-300 relative z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 p-1 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-500 transition-all"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="p-4 flex flex-col h-full gap-6">
        
        {/* New Search Action */}
        <button
          onClick={onNewSearch}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 ${
            collapsed ? 'px-0' : 'w-full'
          }`}
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Search</span>}
        </button>

        {/* Navigation Sections */}
        {!collapsed ? (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            
            {/* Recent Searches Section */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Recent Searches
                </span>
                {recentSearches && recentSearches.length > 0 && (
                  <button onClick={onClearRecent} className="hover:text-red-400 text-[10px]" title="Clear Recent">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {displaySearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectRecent(item.query)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs dark:text-slate-300 light:text-slate-700 hover:bg-blue-500/10 hover:text-blue-500 truncate transition-all flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 flex-shrink-0"></span>
                    <span className="truncate">{item.title || item.query}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations & Collections Section */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Topic Threads
              </div>
              <div className="space-y-1">
                {[
                  { name: "Mountain Trip Plan", icon: "🏔️" },
                  { name: "Hackathon AI Bot", icon: "🤖" },
                  { name: "Equipment Purchase", icon: "💳" }
                ].map((thread, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectRecent(`What did we decide in ${thread.name}?`)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs dark:text-slate-300 light:text-slate-700 hover:bg-purple-500/10 hover:text-purple-500 truncate transition-all flex items-center gap-2"
                  >
                    <span>{thread.icon}</span>
                    <span className="truncate">{thread.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dataset Upload Section */}
            <div className="pt-2 border-t dark:border-slate-800 light:border-slate-200">
              <button
                onClick={onOpenUpload}
                className="w-full p-3 rounded-xl border border-dashed border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5 hover:bg-blue-500/10 text-xs font-semibold text-blue-400 flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload Custom Chat</span>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed Mode Icons */
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <button onClick={() => onSelectRecent("When did we decide to go to Manali?")} title="Recent Searches" className="p-2 hover:text-blue-400">
              <Clock className="w-5 h-5" />
            </button>
            <button onClick={onOpenUpload} title="Upload Dataset" className="p-2 hover:text-blue-400">
              <Upload className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Footer Brand Info */}
        {!collapsed && (
          <div className="pt-3 border-t dark:border-slate-800 light:border-slate-200 text-[10px] text-slate-500 text-center">
            MemorySearch AI v2.4 • Meaning-Based Group Chat RAG
          </div>
        )}
      </div>
    </aside>
  );
}
