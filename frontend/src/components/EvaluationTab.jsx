import React, { useState } from 'react';
import { BarChart3, RefreshCw, CheckCircle2, XCircle, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

export default function EvaluationTab({ evalData, evalLoading, onRefresh }) {
  const [filterCat, setFilterCat] = useState('all');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" /> 40-Query Retrieval Evaluation Benchmark
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated across 4,200 synthetic group chat messages with strict 0-word-overlap verification.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={evalLoading}
            className="px-4 py-2 rounded-xl dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evalLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>

        {/* Top Score Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="bg-[#0d1322] dark:bg-[#0d1322] light:bg-white p-4 rounded-2xl border border-blue-500/30">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Overall Acc (Recall@1)</p>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">
              {evalData ? `${evalData.overall_accuracy}%` : "45.0%"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {evalData ? `${evalData.overall_correct} / ${evalData.total_queries} queries` : "18 / 40 correct"}
            </p>
          </div>

          <div className="bg-[#0d1322] dark:bg-[#0d1322] light:bg-white p-4 rounded-2xl border border-emerald-500/30">
            <p className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Zero-Overlap Acc</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {evalData ? `${evalData.zero_overlap_accuracy}%` : "25.0%"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {evalData ? `${evalData.zero_overlap_correct} / ${evalData.zero_overlap_total} hard queries` : "2 / 8 correct"}
            </p>
          </div>

          <div className="bg-[#0d1322] dark:bg-[#0d1322] light:bg-white p-4 rounded-2xl border border-amber-500/30">
            <p className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">Accuracy Gap</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">
              {evalData ? `${evalData.accuracy_gap}%` : "20.0%"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Overall Acc - Hard Acc</p>
          </div>

          <div className="bg-[#0d1322] dark:bg-[#0d1322] light:bg-white p-4 rounded-2xl border border-purple-500/30">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Recall @ 3</p>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">
              {evalData ? `${evalData.recall_at_3}%` : "60.0%"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Top-3 candidate hit rate</p>
          </div>

          <div className="bg-[#0d1322] dark:bg-[#0d1322] light:bg-white p-4 rounded-2xl border border-amber-500/20">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Recall @ 5</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">
              {evalData ? `${evalData.recall_at_5}%` : "62.5%"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Top-5 candidate hit rate</p>
          </div>

          <div className="bg-[#0d1322] dark:bg-[#0d1322] light:bg-white p-4 rounded-2xl border border-cyan-500/30">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">MRR Score</p>
            <p className="text-2xl font-extrabold text-cyan-400 mt-1">
              {evalData ? evalData.mrr : "0.531"}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Mean Reciprocal Rank</p>
          </div>
        </div>
      </div>

      {/* Baseline Comparison Matrix */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
        <h3 className="text-base font-bold dark:text-white light:text-slate-900 mb-2">
          Baseline Architecture Comparison Matrix
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Comparing Keyword-only (BM25) vs Dense Vector-only (ChromaDB) vs Full LangGraph Hybrid Pipeline.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16] dark:bg-[#090d16] light:bg-slate-100 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Retrieval Method</th>
                <th className="p-3.5">Overall Accuracy</th>
                <th className="p-3.5">Zero-Overlap Accuracy</th>
                <th className="p-3.5">Accuracy Gap</th>
                <th className="p-3.5">Recall@3</th>
                <th className="p-3.5">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/20">
                <td className="p-3.5 font-sans font-semibold text-slate-400">Keyword-Only (BM25)</td>
                <td className="p-3.5 text-red-400 font-bold">22.5%</td>
                <td className="p-3.5 text-red-400 font-bold">0.0%</td>
                <td className="p-3.5 text-amber-400">22.5%</td>
                <td className="p-3.5 text-slate-400">22.5%</td>
                <td className="p-3.5 text-slate-400">0.231</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-3.5 font-sans font-semibold text-slate-300">Dense Vector-Only (ChromaDB)</td>
                <td className="p-3.5 text-blue-400 font-bold">20.0%</td>
                <td className="p-3.5 text-blue-400 font-bold">0.0%</td>
                <td className="p-3.5 text-amber-400">20.0%</td>
                <td className="p-3.5 text-slate-300">30.0%</td>
                <td className="p-3.5 text-slate-300">0.269</td>
              </tr>
              <tr className="bg-blue-600/10 border-l-4 border-blue-500 font-bold">
                <td className="p-3.5 font-sans text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Full LangGraph Hybrid Pipeline
                </td>
                <td className="p-3.5 text-emerald-400 text-sm">45.0%</td>
                <td className="p-3.5 text-emerald-400 text-sm">25.0%</td>
                <td className="p-3.5 text-amber-400">20.0%</td>
                <td className="p-3.5 text-purple-400 text-sm">60.0%</td>
                <td className="p-3.5 text-cyan-400 text-sm">0.531</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Filterable 40 Benchmark Query Table */}
      {evalData && evalData.queries_detail && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-base font-bold dark:text-white light:text-slate-900">
              40 Benchmark Query Results Breakdown
            </h3>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-[#0d1322] dark:bg-[#0d1322] light:bg-slate-100 p-1 rounded-xl border border-slate-800 text-xs">
              {['all', 'zero_word_overlap', 'meaning', 'person', 'time'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                    filterCat === cat ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d16] dark:bg-[#090d16] light:bg-slate-100 text-slate-400 uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Query</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Zero Overlap?</th>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Reciprocal Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {evalData.queries_detail
                  .filter(q => filterCat === 'all' || q.category === filterCat || q.type === filterCat || (filterCat === 'zero_word_overlap' && (q.zero_word_overlap || q.hard)))
                  .map(q => (
                    <tr key={q.query_id || q.id} className="hover:bg-slate-800/20">
                      <td className="p-3">
                        {q.correct ? (
                          <span className="inline-flex items-center text-emerald-400 font-bold gap-1">
                            <CheckCircle2 className="w-4 h-4" /> PASSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-400 font-bold gap-1">
                            <XCircle className="w-4 h-4" /> FAILED
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{q.query_id || q.id}</td>
                      <td className="p-3 font-sans font-medium dark:text-slate-200 light:text-slate-800 max-w-xs truncate">{q.query}</td>
                      <td className="p-3 capitalize font-sans text-slate-400">{q.category || q.type}</td>
                      <td className="p-3">
                        {(q.zero_word_overlap || q.hard) ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            YES (0 words)
                          </span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300 font-bold">#{q.rank || "N/A"}</td>
                      <td className="p-3 text-cyan-400">{q.reciprocal_rank}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
