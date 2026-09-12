import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroSearch from './components/HeroSearch';
import SearchLoading from './components/SearchLoading';
import AIAnswerPanel from './components/AIAnswerPanel';
import EvidenceTimeline from './components/EvidenceTimeline';
import ConversationContextModal from './components/ConversationContextModal';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import EvaluationTab from './components/EvaluationTab';
import DemoTab from './components/DemoTab';
import ArchitectureTab from './components/ArchitectureTab';

import { Search, Sliders, Calendar, User, MessageSquare, AlertCircle, RefreshCw, X, Filter } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000/api";

export default function App() {
  // Theme System ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('memorysearch_theme') || 'dark';
  });

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'evaluation' | 'demo' | 'architecture'
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Search Engine State
  const [queryText, setQueryText] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [senderFilter, setSenderFilter] = useState('');

  // Modals & User State
  const [contextModalItem, setContextModalItem] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('memorysearch_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Recent Searches State
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('memorysearch_recents');
    return saved ? JSON.parse(saved) : [
      { title: "Manali trip decision", query: "When did we decide to go to Manali?" },
      { title: "Goa budget", query: "What was our Goa trip budget?" },
      { title: "Hackathon discussion", query: "Who suggested the hackathon?" },
      { title: "Project ideas", query: "What project ideas did we discuss?" }
    ];
  });

  // Evaluation Data State
  const [evalData, setEvalData] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);

  // Datasets State
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState('default');
  const [datasetLoading, setDatasetLoading] = useState(false);

  // Apply root theme class
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    localStorage.setItem('memorysearch_theme', theme);
  }, [theme]);

  // Load datasets on mount
  useEffect(() => {
    fetchDatasets();
  }, []);

  // Load evaluation metrics when tab changes
  useEffect(() => {
    if (activeTab === 'evaluation' && !evalData) {
      fetchEvaluationMetrics();
    }
  }, [activeTab]);

  const fetchDatasets = async () => {
    try {
      const res = await fetch(`${API_BASE}/datasets`);
      if (res.ok) {
        const data = await res.json();
        setDatasets(data.datasets || []);
        if (data.active_id) {
          setActiveDatasetId(data.active_id);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch datasets:", err);
    }
  };

  const handleSelectDataset = async (datasetId) => {
    setDatasetLoading(true);
    try {
      const res = await fetch(`${API_BASE}/datasets/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: datasetId })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDatasetId(datasetId);
        setDatasets(data.datasets || []);
        setSearchResults(null);
        setSearchSubmitted(false);
      }
    } catch (err) {
      console.error("Failed to select dataset:", err);
    } finally {
      setDatasetLoading(false);
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    try {
      const res = await fetch(`${API_BASE}/datasets/${datasetId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setDatasets(data.datasets || []);
        if (data.active_id) {
          setActiveDatasetId(data.active_id);
        }
        setSearchResults(null);
        setSearchSubmitted(false);
      }
    } catch (err) {
      console.error("Failed to delete dataset:", err);
    }
  };

  const handleDatasetUploaded = (data) => {
    if (data?.datasets) {
      setDatasets(data.datasets);
    }
    if (data?.active_dataset?.id) {
      setActiveDatasetId(data.active_dataset.id);
    }
    setSearchResults(null);
    setSearchSubmitted(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleExecuteSearch = async (overrideQuery = null) => {
    const queryToRun = overrideQuery !== null ? overrideQuery : queryText;
    if (!queryToRun || !queryToRun.trim()) return;

    setLoading(true);
    setError(null);
    setSearchSubmitted(true);
    setActiveQuery(queryToRun);
    setActiveTab('search');

    // Add to recent searches
    const newRecent = [
      { title: queryToRun.length > 25 ? `${queryToRun.substring(0, 25)}...` : queryToRun, query: queryToRun },
      ...recentSearches.filter(r => r.query !== queryToRun)
    ].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem('memorysearch_recents', JSON.stringify(newRecent));

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToRun,
          top_k: 5,
          sender_filter: senderFilter || null
        })
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err.message || "Could not reach FastAPI search engine. Ensure backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationMetrics = async () => {
    setEvalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/evaluation`);
      if (res.ok) {
        const data = await res.json();
        setEvalData(data);
      }
    } catch (err) {
      console.warn("Could not load live evaluation metrics:", err);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleNewSearch = () => {
    setQueryText('');
    setActiveQuery('');
    setSearchResults(null);
    setSearchSubmitted(false);
    setActiveTab('search');
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('memorysearch_recents');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('memorysearch_user');
  };

  // Filter results by selected category
  const filteredResults = searchResults?.results ? searchResults.results.filter(item => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Decisions') return item.score_breakdown.decision_boost > 0;
    if (categoryFilter === 'Trips') return item.message.thread_id.includes('trip');
    if (categoryFilter === 'Projects') return item.message.thread_id.includes('project') || item.message.text.toLowerCase().includes('project');
    if (categoryFilter === 'Budgets') return item.message.text.toLowerCase().includes('budget') || item.message.text.toLowerCase().includes('expense') || item.message.text.toLowerCase().includes('cost');
    if (categoryFilter === 'Hackathons') return item.message.thread_id.includes('hackathon');
    return true;
  }) : [];

  return (
    <div className={`min-h-screen ${theme} flex flex-col font-sans transition-colors duration-400`}>
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        onNewSearch={handleNewSearch}
        datasets={datasets}
        activeDatasetId={activeDatasetId}
        onSelectDataset={handleSelectDataset}
        onDeleteDataset={handleDeleteDataset}
      />

      {/* Main Body Layout with Collapsible Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar
          onNewSearch={handleNewSearch}
          recentSearches={recentSearches}
          onSelectRecent={(q) => {
            setQueryText(q);
            handleExecuteSearch(q);
          }}
          onClearRecent={handleClearRecent}
          onOpenUpload={() => setUploadModalOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Workspace Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          
          {/* TAB 1: SEARCH ENGINE */}
          {activeTab === 'search' && (
            <div>
              {!searchSubmitted ? (
                /* Landing Hero View */
                <HeroSearch
                  queryText={queryText}
                  setQueryText={setQueryText}
                  onSearch={(q) => handleExecuteSearch(q)}
                  onSelectPrompt={(p) => {
                    setQueryText(p);
                    handleExecuteSearch(p);
                  }}
                  loading={loading}
                />
              ) : (
                /* Search Results View */
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Top Search Input Bar (Sticky Mode) */}
                  <div className="glass-panel p-4 rounded-2xl border dark:border-slate-800 light:border-slate-200 shadow-lg flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteSearch(); }}
                        placeholder="Search conversations by meaning..."
                        className="w-full pl-12 pr-10 py-2.5 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 dark:text-white light:text-slate-900 placeholder-slate-500 rounded-xl border dark:border-slate-800 light:border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                      />
                      {queryText && (
                        <button onClick={() => setQueryText('')} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleExecuteSearch()}
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <span>Search</span>
                    </button>
                  </div>

                  {/* Loading Stage indicator */}
                  {loading && <SearchLoading query={activeQuery} />}

                  {/* Error Alert */}
                  {error && !loading && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">Search Execution Failed</p>
                        <p className="text-[11px] opacity-80 mt-0.5">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Results Display Area */}
                  {!loading && searchResults && (
                    <div className="space-y-6">
                      
                      {/* Query Header & Category Filter Chips */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b dark:border-slate-800 light:border-slate-200">
                        <div>
                          <h2 className="text-xl font-bold dark:text-white light:text-slate-900">
                            "{searchResults.query}"
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Semantic search results • <span className="text-blue-400 font-bold">{searchResults.results.length} relevant messages</span>
                          </p>
                        </div>

                        {/* Category Filter Chips */}
                        <div className="flex flex-wrap gap-1.5 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 p-1 rounded-xl border dark:border-slate-800 light:border-slate-200 text-xs font-medium">
                          {['All', 'Decisions', 'Trips', 'Projects', 'Budgets', 'Hackathons'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setCategoryFilter(cat)}
                              className={`px-3 py-1 rounded-lg transition-all ${
                                categoryFilter === cat
                                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Answer Synthesis Panel */}
                      <AIAnswerPanel
                        query={searchResults.query}
                        topResult={searchResults.results[0]}
                        totalSources={searchResults.results.length}
                      />

                      {/* Evidence Message Timeline */}
                      <EvidenceTimeline
                        results={filteredResults}
                        onOpenContext={(item) => setContextModalItem(item)}
                        query={searchResults.query}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVALUATION BENCHMARK */}
          {activeTab === 'evaluation' && (
            <EvaluationTab
              evalData={evalData}
              evalLoading={evalLoading}
              onRefresh={fetchEvaluationMetrics}
            />
          )}

          {/* TAB 3: 1-CLICK DEMO */}
          {activeTab === 'demo' && (
            <DemoTab />
          )}

          {/* TAB 4: ARCHITECTURE & LANGGRAPH */}
          {activeTab === 'architecture' && (
            <ArchitectureTab />
          )}
        </main>
      </div>

      {/* MODALS */}
      {contextModalItem && (
        <ConversationContextModal
          item={contextModalItem}
          onClose={() => setContextModalItem(null)}
        />
      )}

      {uploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          onDatasetUploaded={(data) => {
            handleDatasetUploaded(data);
          }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(u) => setUser(u)}
        />
      )}
    </div>
  );
}
