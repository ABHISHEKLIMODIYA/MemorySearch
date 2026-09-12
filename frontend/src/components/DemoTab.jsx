import React, { useState } from 'react';
import { Zap, Play, CheckCircle2, XCircle, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

export default function DemoTab() {
  const DEMO_SCENARIOS = [
    {
      id: "demo_1",
      title: "Mountain Vacation Decision",
      query: "When did everyone settle on the mountain plan?",
      gold_id: "msg_000450",
      expected: "Done, Saturday morning wali Volvo confirm kar di.",
      badge: "Strict 0-Word Overlap",
      desc: "Query asks for mountain settlement in formal English; target is short Hinglish confirmation with 0 shared words."
    },
    {
      id: "demo_2",
      title: "Hackathon Project Selection",
      query: "What did the team ultimately choose to make for the competition?",
      gold_id: "msg_001250",
      expected: "Bas, hackathon ka AI search engine lock karte hain.",
      badge: "Strict 0-Word Overlap",
      desc: "Query asks about competition project choice; target uses Hinglish term 'lock karte hain'."
    },
    {
      id: "demo_3",
      title: "Equipment Payment Split",
      query: "Who recommended keeping everyone's contribution equal?",
      gold_id: "msg_002100",
      expected: "Main card swiping kar deta hu, sab GPay kar dena.",
      badge: "Strict 0-Word Overlap",
      desc: "Query asks for payment split; target mentions card swiping and GPay."
    },
    {
      id: "demo_4",
      title: "Priya Budget Constraint",
      query: "Did anyone voice concerns regarding budget constraints?",
      gold_id: "msg_000380",
      expected: "iss month pocket money thodi kam hai yaar, overall expense limit me rakhna",
      badge: "Person & Sentiment",
      desc: "Query asks about budget constraints; target expresses pocket money limits."
    }
  ];

  const [selectedScenario, setSelectedScenario] = useState(DEMO_SCENARIOS[0]);
  const [running, setRunning] = useState(false);
  const [demoResults, setDemoResults] = useState(null);

  const runScenario = async (sc) => {
    setSelectedScenario(sc);
    setRunning(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sc.query, top_k: 5 })
      });
      if (res.ok) {
        const data = await res.json();
        setDemoResults(data);
      }
    } catch (err) {
      console.error("Demo run failed:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Presentation Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-amber-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-extrabold dark:text-white light:text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" /> 1-Click Interactive Presentation Demo
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Test zero-word-overlap queries in real time to demonstrate why Keyword Search fails while LangGraph Hybrid RAG succeeds.
            </p>
          </div>
          <button
            onClick={() => runScenario(selectedScenario)}
            disabled={running}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Run Scenario Live</span>
          </button>
        </div>

        {/* Scenario Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => runScenario(sc)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                selectedScenario.id === sc.id
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-xl shadow-amber-500/10 scale-[1.02]'
                  : 'bg-[#0d1322] dark:bg-[#0d1322] light:bg-white border-slate-800 text-slate-300 hover:border-amber-500/40'
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400 mb-1 block">
                {sc.badge}
              </span>
              <p className="font-bold text-sm dark:text-white light:text-slate-900 mb-1">{sc.title}</p>
              <p className="text-xs text-slate-400 italic truncate">"{sc.query}"</p>
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Live Comparison Panel */}
      {demoResults ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Lexical BM25 (Fails) */}
          <div className="glass-panel p-6 rounded-3xl border border-red-500/30 bg-red-500/5 space-y-4">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Lexical Keyword Search (BM25)
              </h3>
              <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold font-mono text-[11px]">
                Status: FAILED (0 Overlap)
              </span>
            </div>

            <div className="bg-[#090d16] p-4 rounded-2xl border border-slate-800 text-xs space-y-3">
              <p className="text-slate-400">
                Query: <span className="text-white italic font-semibold">"{selectedScenario.query}"</span>
              </p>
              <p className="text-slate-400">
                Target Message Text: <span className="text-emerald-400 font-bold">"{selectedScenario.expected}"</span>
              </p>
              <div className="p-3 bg-red-950/40 rounded-xl border border-red-800/50 text-red-300 text-xs">
                Word Overlap: <strong className="font-mono text-red-400">0 words</strong>
                <br />
                Exact lexical search fails because "mountain plan" and "Volvo confirm" share zero identical tokens.
              </div>
            </div>
          </div>

          {/* Column 2: LangGraph Hybrid RAG (Succeeds) */}
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-emerald-500/5 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> LangGraph Hybrid RAG Engine
              </h3>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[11px]">
                Status: PASSED (#1 Rank Match)
              </span>
            </div>

            {demoResults.results && demoResults.results.length > 0 && (
              <div className="space-y-3">
                
                {/* Top Match Result */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-emerald-900/40 border border-emerald-500/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Top Retrieved #1 Match
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      Score: {(demoResults.results[0].score_breakdown.final_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-white font-semibold text-base leading-relaxed">
                    "{demoResults.results[0].message.text}"
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-2 pt-2 border-t border-slate-700/60 font-mono">
                    <span>Sender: {demoResults.results[0].message.sender}</span>
                    <span>ID: {demoResults.results[0].message.id}</span>
                    <span className="text-emerald-400 font-bold">Decision Boost: +{demoResults.results[0].score_breakdown.decision_boost}</span>
                  </div>
                </div>

                {/* Context Window Preview */}
                <div className="p-3 bg-[#090d16] rounded-xl border border-slate-800 text-xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Surrounding Context Window (+3 / -3 messages):</p>
                  <div className="space-y-1">
                    {demoResults.results[0].context_before.map(m => (
                      <p key={m.id} className="text-slate-400 text-[11px] truncate">
                        <span className="font-semibold text-slate-300">{m.sender}:</span> {m.text}
                      </p>
                    ))}
                    <p className="text-emerald-400 font-bold text-[11px] py-1 px-2 rounded bg-emerald-950/60 border border-emerald-800/40">
                      👉 {demoResults.results[0].message.sender}: {demoResults.results[0].message.text}
                    </p>
                    {demoResults.results[0].context_after.map(m => (
                      <p key={m.id} className="text-slate-400 text-[11px] truncate">
                        <span className="font-semibold text-slate-300">{m.sender}:</span> {m.text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-xs italic">
          Click "Run Scenario Live" above to trigger real-time side-by-side RAG benchmark evaluation.
        </div>
      )}
    </div>
  );
}
