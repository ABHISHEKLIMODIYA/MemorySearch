import React from 'react';
import { GitBranch, Sliders, ShieldCheck, Cpu, Database, Layers } from 'lucide-react';

export default function ArchitectureTab() {
  const GRAPH_NODES = [
    { step: "01", title: "parse_query", desc: "Tokenizes input text & normalizes stop words" },
    { step: "02", title: "classify_intent", desc: "Classifies intent: semantic, decision, person, time" },
    { step: "03", title: "extract_entities", desc: "Parses speaker names & relative date ranges" },
    { step: "04", title: "semantic_retrieve", desc: "Dense vector search via LlamaIndex + ChromaDB" },
    { step: "05", title: "keyword_retrieve", desc: "Sparse BM25 Okapi lexical candidate retrieval" },
    { step: "06", title: "metadata_filter", desc: "Computes sender & timestamp match scores" },
    { step: "07", title: "merge_candidates", desc: "Fuses candidate pools into unified record map" },
    { step: "08", title: "rerank", desc: "Applies decision-aware score boosting formula" },
    { step: "09", title: "expand_context", desc: "Attaches +3 / -3 surrounding chat messages" },
    { step: "10", title: "format_results", desc: "Formats match reasons & outputs SearchResponse" }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20">
        <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 mb-2 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-cyan-400" /> LangGraph 10-Node RAG Architecture
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl">
          State-machine workflow engineered to decouple parsing, entity extraction, parallel dense/sparse retrieval, candidate fusion, decision boosting, and context expansion.
        </p>

        {/* Node Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          {GRAPH_NODES.map((node) => (
            <div
              key={node.step}
              className="bg-[#0d1322] dark:bg-[#0d1322] light:bg-white p-4 rounded-2xl border dark:border-slate-800 light:border-slate-200 hover:border-cyan-500/50 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs text-cyan-400 font-mono font-bold mb-1">
                <span>Node {node.step}</span>
                <GitBranch className="w-3.5 h-3.5" />
              </div>
              <p className="font-bold text-sm dark:text-white light:text-slate-900 font-mono">{node.title}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{node.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Formula & Zero Overlap Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Formula Details */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold dark:text-white light:text-slate-900 mb-3 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" /> Weighted Hybrid Scoring Formula
          </h3>
          <div className="p-4 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-100 rounded-2xl font-mono text-xs text-blue-400 border border-slate-800 mb-4">
            Final Score = (0.55 × Semantic) + (0.20 × BM25) + (0.15 × Metadata) + (0.10 × Decision Boost)
          </div>
          <ul className="text-xs text-slate-300 light:text-slate-700 space-y-2">
            <li>• <strong className="text-blue-400">Semantic Weight (0.55):</strong> Sentence-Transformers embedding cosine similarity handling zero-word-overlap & Hinglish concepts.</li>
            <li>• <strong className="text-purple-400">Keyword Weight (0.20):</strong> BM25 score for exact term overlap.</li>
            <li>• <strong className="text-amber-400">Metadata Weight (0.15):</strong> Rewards matching sender and relative date ranges.</li>
            <li>• <strong className="text-emerald-400">Decision Boost (0.10):</strong> Boosts final decision messages ("confirm", "lock", "swiping", "done") over discussion chatter.</li>
          </ul>
        </div>

        {/* Zero Overlap Details */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold dark:text-white light:text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Zero-Word-Overlap Principle
          </h3>
          <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed mb-3">
            Keyword search fails when queries use abstract English while chat responses use casual Hinglish or short confirmations.
          </p>
          <div className="p-3 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-100 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
            <div>
              <span className="text-slate-500">Query:</span> <span className="text-white light:text-slate-900">"When did everyone settle on the mountain plan?"</span>
            </div>
            <div>
              <span className="text-slate-500">Target Message:</span> <span className="text-emerald-400 font-bold">"Done, Saturday morning wali Volvo confirm kar di."</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Word Overlap: <span className="text-emerald-400 font-bold">0 words</span> (Passed automated verification)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
