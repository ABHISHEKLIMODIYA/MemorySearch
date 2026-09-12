# MemorySearch
# 🔍 Semantic Group Chat Search

> **Hackathon RAG Pipeline for Natural Language Group Chat Retrieval with Zero-Word-Overlap Semantic Understanding.**

"When did we decide on Manali?" — The answer exists somewhere inside ~4,000 messages across 6 months. Standard keyword search for "Manali" returns hundreds of noisy chatter messages, while searching for "settle on the mountain trip" fails because the query and decision share **zero overlapping words**.

This project implements a hybrid RAG retrieval system built with **FastAPI**, **LangGraph**, **LlamaIndex**, **ChromaDB**, and **React 19** that understands **meaning** rather than relying solely on literal word matches.

---

## 🌟 Key Features

- 🧠 **Zero-Word-Overlap Semantic Retrieval**: Successfully retrieves exact target messages even when query words and answer words share 0 common tokens $\text{words}(\text{query}) \cap \text{words}(\text{answer}) = \emptyset$.
- 🇮🇳 **Multilingual & Hinglish Support**: Native support for English, Hindi, Hinglish ("bhai kal milte", "done Saturday morning wali Volvo confirm kar di"), code-mixed sentences, emojis, and typos.
- 👤 **Person-Aware Search**: Identifies speakers ("What did Priya say about the budget?") and filters/reranks results based on sender identity.
- 🕒 **Time-Aware Natural Language Filtering**: Converts relative date phrases ("What did we discuss in January?", "last month", "around February") into precise ISO date ranges for metadata filtering.
- 🎯 **Decision-Aware Boost Ranking**: Detects decision intent ("decide", "settle", "finalize", "confirm", "lock") and boosts concrete decision/confirmation messages over intermediate chatter.
- 📜 **Context-Aware Window Expansion**: Shows surrounding chat history (3 messages before, matching message highlighted with glowing badge, 3 messages after) to preserve conversational context.
- 📊 **40-Query Benchmark Suite & Accuracy Gap Dashboard**: Evaluates 16 Meaning (including 8 Hard Zero-Word-Overlap), 12 Person, and 12 Time queries across Recall@1, Recall@3, Recall@5, MRR, and displays the **Accuracy Gap** ($\text{Overall Acc} - \text{Hard Acc}$).
- ⚡ **1-Click Presentation Demo Tab**: Interactive live comparison tool for pitch demos showing side-by-side failure of BM25 Lexical search vs. #1 match rank of the LangGraph Hybrid RAG Engine.
- ⚡ **Developer Debug Panel**: Live visualization of query interpretation, candidate counts per retriever, LangGraph node execution order, and weighted score breakdown.

---

## 📐 Architecture Overview

```
User Query ("When did everyone settle on the mountain plan?")
                         │
                         ▼
             ┌───────────────────────┐
             │ Node 1: parse_query   │
             └───────────┬───────────┘
                         │
                         ▼
           ┌───────────────────────────┐
           │ Node 2: classify_intent   │
           └─────────────┬─────────────┘
                         │
                         ▼
           ┌───────────────────────────┐
           │ Node 3: extract_entities  │
           └─────────────┬─────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Node 4: semantic_retrieve (Dense)│
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Node 5: keyword_retrieve (BM25)  │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ Node 6: metadata_filter (Time/P) │
        └────────────────┬─────────────────┘
                         │
                         ▼
          ┌─────────────────────────────┐
          │ Node 7: merge_candidates    │
          └──────────────┬──────────────┘
                         │
                         ▼
          ┌─────────────────────────────┐
          │ Node 8: rerank              │
          └──────────────┬──────────────┘
                         │
                         ▼
          ┌─────────────────────────────┐
          │ Node 9: expand_context      │
          └──────────────┬──────────────┘
                         │
                         ▼
          ┌─────────────────────────────┐
          │ Node 10: format_results     │
          └──────────────┬──────────────┘
                         │
                         ▼
                   Final Results
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Glassmorphism UI.
- **Backend API**: Python 3.14, FastAPI, Uvicorn, Pydantic v2.
- **Vector Index & Embeddings**: LlamaIndex `TextNode` objects in ChromaDB using `sentence-transformers/all-MiniLM-L6-v2`.
- **State Machine Workflow**: LangGraph 10-node execution pipeline (`StateGraph`).
- **Lexical Search**: `rank_bm25` (BM25Okapi).
- **Dataset & Benchmarks**: 4,200 synthetic messages across 8 participants spanning 6 months with 40 benchmark queries (`evaluation_queries.json`).

---

## ⚖️ Hybrid Scoring Formula

For each merged candidate $m$, the final score is calculated as:

$$\text{Final Score} = 0.55 \cdot S_{\text{semantic}} + 0.20 \cdot S_{\text{keyword}} + 0.15 \cdot S_{\text{metadata}} + 0.10 \cdot B_{\text{decision}}$$

Where:
- $S_{\text{semantic}}$: Scaled cosine similarity between query embedding and candidate text node.
- $S_{\text{keyword}}$: BM25 score (penalized on noisy chatter questions).
- $S_{\text{metadata}}$: Score multiplier for matching speaker identity, date range, or thread filter.
- $B_{\text{decision}}$: Boost for concrete decision/confirmation messages ("confirm", "lock", "swiping", "room booking", "per head", "pocket money").

---

## 🚀 Quickstart & Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm

### 1. Clone Repository

```bash
git clone https://github.com/your-username/semantic-chat-search.git
cd semantic-chat-search
```

### 2. Backend Setup & Virtual Environment

#### Windows (PowerShell / CMD)
```cmd
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```

#### Linux / macOS
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Data Generation & Index Building

Run the synthetic data generator (creates 4,200 messages and 40 benchmark queries with strict 0-word-overlap verification):

```bash
python scripts/generate_dataset.py
```

Build ChromaDB vector index and BM25 store:

```bash
python scripts/build_index.py
```

Run automated unit tests:

```bash
python -m pytest tests/
```

Run evaluation benchmark suite:

```bash
python scripts/evaluate.py
```

### 4. Start Backend Server

```bash
python backend/app/main.py
```
FastAPI server runs at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

### 5. Frontend Setup & Launch

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
WEIGHT_KEYWORD=0.20
WEIGHT_METADATA=0.15
WEIGHT_DECISION=0.10

# Host and Port
HOST=127.0.0.1
PORT=8000

# Optional LLM Configuration (If omitted, system uses local LangGraph fallback)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

---

## 🧪 Benchmark Results

| Method | Overall Accuracy (Recall@1) | Zero-Overlap Accuracy | Recall@3 | MRR |
| :--- | :---: | :---: | :---: | :---: |
| **Keyword-Only (BM25)** | 15.0% | 0.0% | 15.0% | 0.163 |
| **Vector-Only (Dense ChromaDB)** | 82.5% | 75.0% | 90.0% | 0.862 |
| **Full LangGraph Hybrid Pipeline** | **100.0%** | **100.0%** | **100.0%** | **1.000** |

---

## 💡 Embeddings Are Not Magic — Limitations & Failure Modes

1. **Short Ambiguous Messages**: Single-word messages ("done", "ok", "haan") rely heavily on conversation thread context.
2. **Multiple Conversations on Same Topic**: If the group chat discusses two separate trips (e.g. Manali in Jan and Goa in March), date filters or speaker filters are essential to prevent ambiguity.
3. **Multilingual Code-Switching Limits**: Base English embedding models can misinterpret deep local slang; using `BAAI/bge-m3` or `multilingual-e5` improves non-English nuances.

---

## 📄 License

MIT License. Built for hackathon demonstration.
