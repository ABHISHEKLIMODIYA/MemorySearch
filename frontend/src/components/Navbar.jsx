import React, { useState } from 'react';
import { 
  Sparkles, Search, MessageSquare, Bookmark, BarChart3, 
  GitBranch, Zap, Sun, Moon, Upload, User, LogOut, LogIn, ChevronDown, Menu, X 
} from 'lucide-react';
import DatasetSelector from './DatasetSelector';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  onOpenUpload, 
  onOpenAuth, 
  user, 
  onLogout,
  onNewSearch,
  datasets = [],
  activeDatasetId = 'default',
  onSelectDataset,
  onDeleteDataset
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800/40 dark:border-gray-800/40 light:border-gray-200/80 bg-[#0b0f19]/90 dark:bg-[#0b0f19]/90 light:bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewSearch}>
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight dark:text-white light:text-slate-900 font-sans">
                Memory<span className="text-blue-500">Search</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AI RAG Engine
              </span>
            </div>
            <p className="hidden md:block text-[11px] dark:text-slate-400 light:text-slate-500">
              Semantic Search for Group Chats
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 p-1 rounded-xl border dark:border-slate-800 light:border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'dark:text-slate-400 light:text-slate-600 hover:text-blue-500'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'evaluation'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'dark:text-slate-400 light:text-slate-600 hover:text-purple-500'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Evaluation
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'demo'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'dark:text-slate-400 light:text-slate-600 hover:text-amber-500'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            1-Click Demo
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'architecture'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'dark:text-slate-400 light:text-slate-600 hover:text-cyan-500'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Architecture
          </button>
        </nav>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2.5">
          
          {/* Dataset Selector Dropdown */}
          <DatasetSelector
            datasets={datasets}
            activeDatasetId={activeDatasetId}
            onSelectDataset={onSelectDataset}
            onOpenUpload={onOpenUpload}
            onDeleteDataset={onDeleteDataset}
          />
          
          {/* Upload Dataset Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold dark:bg-slate-800/80 light:bg-slate-100 dark:hover:bg-slate-700 light:hover:bg-slate-200 dark:text-slate-200 light:text-slate-700 border dark:border-slate-700 light:border-slate-300 transition-all active:scale-95 shadow-sm"
            title="Upload Custom Chat Dataset"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Upload Chat</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl dark:bg-slate-800/80 light:bg-slate-100 dark:hover:bg-slate-700 light:hover:bg-slate-200 dark:text-amber-400 light:text-slate-700 border dark:border-slate-700 light:border-slate-300 transition-all active:scale-90"
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* User Profile / Auth State */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl border dark:border-slate-700 light:border-slate-300 dark:bg-slate-800 light:bg-slate-100 text-xs font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline dark:text-slate-200 light:text-slate-800 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {userDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel p-2 shadow-2xl z-50 border dark:border-slate-700 light:border-slate-200 animate-scale-in">
                <div className="px-3 py-2 border-b dark:border-slate-800 light:border-slate-100">
                  <p className="text-xs font-bold dark:text-white light:text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl dark:bg-slate-800 light:bg-slate-100 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t dark:border-slate-800 light:border-slate-200 flex flex-col gap-1 text-xs font-semibold animate-fade-in">
          <button
            onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl dark:text-slate-200 light:text-slate-800 hover:bg-blue-600/10 text-left"
          >
            <Search className="w-4 h-4 text-blue-500" /> Search Engine
          </button>
          <button
            onClick={() => { setActiveTab('evaluation'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl dark:text-slate-200 light:text-slate-800 hover:bg-purple-600/10 text-left"
          >
            <BarChart3 className="w-4 h-4 text-purple-500" /> Evaluation Benchmark
          </button>
          <button
            onClick={() => { setActiveTab('demo'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl dark:text-slate-200 light:text-slate-800 hover:bg-amber-600/10 text-left"
          >
            <Zap className="w-4 h-4 text-amber-500" /> 1-Click Presentation Demo
          </button>
          <button
            onClick={() => { setActiveTab('architecture'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl dark:text-slate-200 light:text-slate-800 hover:bg-cyan-600/10 text-left"
          >
            <GitBranch className="w-4 h-4 text-cyan-500" /> LangGraph Architecture
          </button>
        </div>
      )}
    </header>
  );
}
