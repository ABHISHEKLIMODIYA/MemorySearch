# 🔍 Semantic Group Chat Search

> **A hybrid RAG-powered search engine that understands what your group chat means — not just what words it contains.**

**Semantic Group Chat Search** is an intelligent retrieval system for finding information buried inside thousands of group-chat messages using **natural-language questions**.

Imagine asking:

> **“When did we decide on the mountain trip?”**

The relevant messages might actually say:

> *“Manali final hai bhai 🏔️”*
> *“Saturday wali Volvo confirm kar do.”*
> *“Hotel bhi book kar dete hain.”*

A traditional keyword search can easily miss the real decision because the user's query and the relevant messages may have **little or even zero lexical overlap**.

This project solves that problem using a **Hybrid RAG Retrieval Pipeline** combining:

**Semantic Search + BM25 + Metadata Filtering + Decision-Aware Ranking + Context Expansion**

Built with **FastAPI, LangGraph, LlamaIndex, ChromaDB, BM25, React 19, and Sentence Transformers**.

---

## 🎯 The Problem

Group chats contain enormous amounts of useful information:

* Trip plans
* Project discussions
* Budget decisions
* Meeting arrangements
* Hackathon planning
* Deadlines
* Links and resources
* Final decisions

But conventional search has a major limitation:

### Keyword search searches for words.

### We need search that understands meaning.

For example:

| User Query                                 | Actual Chat Message                           |
| ------------------------------------------ | --------------------------------------------- |
| “When did we decide on the mountain trip?” | “Manali final hai bhai 🏔️”                   |
| “Who discussed the project budget?”        | “Bro ₹5k enough rahega for hosting.”          |
| “What did we finalize for Saturday?”       | “Saturday morning wali Volvo confirm kar di.” |
| “When did everyone agree on the trip?”     | “Done, Manali locked for February.”           |

The words may differ completely, but the **meaning is strongly related**.

---

# 🚀 Solution

Semantic Group Chat Search converts natural-language questions into structured retrieval signals and processes them through a **10-node LangGraph pipeline**.

```text
Natural Language Query
        │
        ▼
┌──────────────────────┐
│  Query Understanding │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Intent Classification │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Entity Extraction    │
└──────────┬───────────┘
           ▼
      ┌─────────────┐
      │  Retrieval  │
      └──────┬──────┘
             │
       ┌─────┴─────┐
       ▼           ▼
   Semantic      BM25
   Retrieval    Retrieval
       │           │
       └─────┬─────┘
             ▼
     Metadata Filtering
             │
             ▼
     Candidate Merging
             │
             ▼
          Reranking
             │
             ▼
      Context Expansion
             │
             ▼
       Final Results
```

The system does **not rely on a single retrieval strategy**.

Instead, it combines multiple signals to identify the most relevant message.

---

# ⭐ Key Features

## 🧠 1. Zero-Word-Overlap Semantic Retrieval

The system can retrieve relevant messages even when the query and target message have **no meaningful words in common**.

Formally:

```text
words(query) ∩ words(answer) = ∅
```

Example:

```text
Query:
"When did everyone settle on the mountain plan?"

Target:
"Manali final hai bhai, February mein chalte hain."
```

Traditional lexical retrieval struggles here.

Dense semantic retrieval understands that both messages refer to the **same underlying decision**.

---

## 🇮🇳 2. Multilingual & Hinglish Search

Designed for realistic Indian group chats.

Supports:

* English
* Hindi
* Hinglish
* Code-mixed messages
* Emojis
* Informal language
* Typos
* Chat abbreviations

Examples:

```text
"bhai kal milte"

"Saturday morning wali Volvo confirm kar di"

"haan bro done"

"budget kitna rakhe?"

"February mein Manali pakka?"
```

---

## 👤 3. Person-Aware Search

The system understands speaker-related queries.

Example:

> **“What did Priya say about the project budget?”**

The pipeline can identify:

```text
Entity:
Priya

Topic:
Project budget

Intent:
Information retrieval
```

Speaker information is then used during filtering and reranking.

---

## 🕒 4. Time-Aware Search

Natural-language time expressions are converted into structured date filters.

Examples:

```text
"What did we discuss in January?"

"Show me the trip conversation from February."

"What happened last month?"

"What did we decide around March?"
```

These queries can be converted into precise ISO date ranges for metadata filtering.

---

## 🎯 5. Decision-Aware Ranking

Not every message is equally important.

Consider:

```text
"Manali?"

"Maybe Manali?"

"Let's see."

"Okay sounds good."

"MANALI FINAL ✅"
```

If the user asks:

> **“When did we finalize the trip?”**

The final confirmation should rank higher than casual discussion.

The system detects decision-related intent such as:

```text
decide
settle
finalize
confirm
lock
book
fixed
done
```

Decision signals are incorporated into the final ranking score.

---

## 📜 6. Conversation Context Expansion

A matching message alone often isn't enough.

Instead of returning only:

```text
"Manali final hai."
```

the system displays surrounding conversation:

```text
3 messages before
       ↓
┌─────────────────────────────┐
│ Rahul: February chale?       │
│ Priya: Haan works for me.   │
│ Aman: Manali better rahega. │
│                             │
│ ⭐ Manali final hai bhai.    │ ← MATCH
│                             │
│ Rahul: Hotel dekhte hain.   │
│ Priya: I'll check prices.   │
│ Aman: Done 👍               │
└─────────────────────────────┘
       ↑
3 messages after
```

This preserves the original conversational context.

---

# 📊 7. Built-In Evaluation Dashboard

The project includes a **40-query benchmark suite** covering:

* 16 Meaning queries
* 8 Hard Zero-Word-Overlap queries
* 12 Person queries
* 12 Time queries

Evaluation metrics include:

* Recall@1
* Recall@3
* Recall@5
* Mean Reciprocal Rank (MRR)
* Overall Accuracy
* Zero-Overlap Accuracy
* Accuracy Gap

### Accuracy Gap

```text
Accuracy Gap =
Overall Accuracy − Hard Zero-Overlap Accuracy
```

This highlights how well the system performs on the hardest semantic retrieval cases.

---

# ⚡ 8. One-Click Presentation Demo

A dedicated demo mode provides a side-by-side comparison between:

### ❌ BM25 Keyword Search

and

### ✅ LangGraph Hybrid RAG

Example:

```text
┌────────────────────────┬────────────────────────┐
│   BM25 Keyword Search  │ Hybrid RAG Search      │
├────────────────────────┼────────────────────────┤
│ Rank #1: random chat   │ ⭐ Rank #1: decision    │
│ Rank #2: random chat   │ Rank #2: confirmation  │
│ Rank #3: noisy chatter │ Rank #3: context      │
└────────────────────────┴────────────────────────┘
```

This makes the retrieval improvement immediately visible during a hackathon presentation.

---

# 🛠️ Technology Stack

## Frontend

* **React 19**
* **Vite**
* **Tailwind CSS**
* **Lucide Icons**
* Glassmorphism UI
* Dark / Light interface

## Backend

* **Python**
* **FastAPI**
* **Uvicorn**
* **Pydantic v2**

## RAG / AI

* **LangGraph**
* **LlamaIndex**
* **Sentence Transformers**
* `all-MiniLM-L6-v2`

## Retrieval

* **ChromaDB** — vector database
* **BM25Okapi** — lexical retrieval
* Dense vector similarity
* Hybrid candidate fusion
* Metadata filtering
* Decision-aware reranking

## Dataset

* **4,200 synthetic chat messages**
* **8 participants**
* **6 months of conversations**
* **40 benchmark queries**

---

# 🏗️ System Architecture

```text
                    USER QUERY
                        │
                        ▼
               ┌────────────────┐
               │  parse_query   │
               └───────┬────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ classify_intent     │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ extract_entities    │
            └──────────┬──────────┘
                       │
              ┌────────┴─────────┐
              │                  │
              ▼                  ▼
      ┌──────────────┐    ┌──────────────┐
      │ Dense Search │    │ BM25 Search  │
      │  ChromaDB    │    │  rank_bm25   │
      └──────┬───────┘    └───────┬──────┘
             │                    │
             └─────────┬──────────┘
                       ▼
             ┌───────────────────┐
             │ Metadata Filter   │
             │ Time + Person     │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │ Merge Candidates  │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │     Reranker      │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │ Context Expansion │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │ Format Results    │
             └─────────┬─────────┘
                       │
                       ▼
                 FINAL RESULTS
```

---

# 🔄 LangGraph Workflow

The retrieval process is implemented as a **10-node StateGraph**.

| Node                | Responsibility                                  |
| ------------------- | ----------------------------------------------- |
| `parse_query`       | Normalize and parse the user's query            |
| `classify_intent`   | Identify meaning, person, time, decision intent |
| `extract_entities`  | Extract people, topics, dates and entities      |
| `semantic_retrieve` | Dense vector retrieval using ChromaDB           |
| `keyword_retrieve`  | BM25 lexical retrieval                          |
| `metadata_filter`   | Apply speaker/date/thread constraints           |
| `merge_candidates`  | Combine candidates from retrieval strategies    |
| `rerank`            | Calculate hybrid relevance score                |
| `expand_context`    | Add surrounding messages                        |
| `format_results`    | Return frontend-ready results                   |

This gives the application a **stateful, inspectable retrieval workflow** rather than a black-box search call.

---

# ⚖️ Hybrid Ranking

Each candidate message receives a final relevance score:

$$
FinalScore =
0.55S_{semantic}
+ 0.20S_{keyword}
+ 0.15S_{metadata}
+ 0.10B_{decision}
$$

Where:

### `Ssemantic`

Scaled cosine similarity between the query embedding and message embedding.

### `Skeyword`

BM25 relevance score.

### `Smetadata`

Metadata relevance based on:

* Speaker
* Date range
* Thread
* Extracted entities

### `Bdecision`

Decision-aware boost for messages containing strong confirmation signals such as:

```text
confirm
final
fixed
locked
booked
done
settled
```

The weights can be configured through environment variables:

```env
WEIGHT_SEMANTIC=0.55
WEIGHT_KEYWORD=0.20
WEIGHT_METADATA=0.15
WEIGHT_DECISION=0.10
```

---

# 📈 Benchmark Results

The system was evaluated against a 40-query benchmark.

| Method                   |   Recall@1 | Zero-Overlap |   Recall@3 |       MRR |
| ------------------------ | ---------: | -----------: | ---------: | --------: |
| BM25 Keyword-Only        |      15.0% |         0.0% |      15.0% |     0.163 |
| Dense Vector-Only        |      82.5% |        75.0% |      90.0% |     0.862 |
| **Hybrid LangGraph RAG** | **100.0%** |   **100.0%** | **100.0%** | **1.000** |

### Key takeaway

```text
BM25
15% Recall@1
      ↓
Vector Search
82.5% Recall@1
      ↓
Hybrid RAG
100% Recall@1
```

The hybrid pipeline combines the strengths of lexical and semantic retrieval while using metadata and decision-aware ranking to improve precision.

---

# 🧪 Dataset

The benchmark dataset contains:

```text
4,200 messages
8 participants
6 months
40 evaluation queries
```

Conversation topics include:

### 🏔️ Travel

* Manali
* Goa
* Hotels
* Transport
* Trip dates
* Budgets
* Booking confirmations

### 💻 Projects

* Project ideas
* Tasks
* Deadlines
* Technical discussions
* Team assignments

### 💰 Budgets

* Trip expenses
* Project costs
* Food
* Accommodation
* Transport

### 🏆 Hackathons

* Participation
* Ideas
* Team planning
* Submission deadlines
* Technology choices

The dataset is intentionally designed to include realistic noise and overlapping conversations.

---

# 🚀 Quick Start

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/semantic-chat-search.git

cd semantic-chat-search
```

---

## 2. Create Python Environment

### Windows

```bash
python -m venv .venv

.venv\Scripts\activate

pip install -r backend/requirements.txt
```

### Linux / macOS

```bash
python3 -m venv .venv

source .venv/bin/activate

pip install -r backend/requirements.txt
```

---

## 3. Generate Dataset

Generate the synthetic chat dataset and benchmark queries:

```bash
python scripts/generate_dataset.py
```

This creates:

```text
4,200 messages
40 benchmark queries
Zero-overlap verification
```

---

## 4. Build Search Index

Create the ChromaDB vector index and BM25 search store:

```bash
python scripts/build_index.py
```

---

## 5. Run Tests

```bash
python -m pytest tests/
```

---

## 6. Run Benchmark

```bash
python scripts/evaluate.py
```

---

## 7. Start Backend

```bash
python backend/app/main.py
```

Backend:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 8. Start Frontend

Open a second terminal:

```bash
cd frontend

npm install

npm run dev
```

Open the Vite development URL shown in your terminal.

---

# ⚙️ Configuration

Create a `.env` file:

```env
HOST=127.0.0.1
PORT=8000

WEIGHT_SEMANTIC=0.55
WEIGHT_KEYWORD=0.20
WEIGHT_METADATA=0.15
WEIGHT_DECISION=0.10

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

The system can operate using the local fallback workflow when an OpenAI API key is not configured.

---

# 🔬 Why Hybrid Retrieval?

No single retrieval method is perfect.

### BM25

Excellent for:

* Exact names
* Keywords
* URLs
* Specific terms
* Rare tokens

But weak when the query uses different wording.

### Dense Retrieval

Excellent for:

* Meaning
* Paraphrases
* Natural-language questions
* Zero-word-overlap retrieval

But can sometimes retrieve semantically similar yet incorrect conversations.

### Metadata Filtering

Useful for:

* People
* Dates
* Threads
* Conversation boundaries

### Decision-Aware Ranking

Useful when the user is looking for:

* Final decisions
* Confirmations
* Bookings
* Agreements
* Settled plans

### Hybrid Search

Combining all of these produces a more robust retrieval system.

---

# 🧠 Embeddings Are Not Magic

Semantic retrieval still has limitations.

## 1. Short Ambiguous Messages

Messages such as:

```text
"done"
"ok"
"haan"
"fixed"
```

contain very little semantic information.

The surrounding conversation becomes essential.

---

## 2. Multiple Similar Conversations

A group may discuss:

```text
Manali → January

Goa → March
```

A query such as:

> “When did we finalize the trip?”

may require date, speaker, or conversation context to determine which trip is intended.

---

## 3. Multilingual Nuances

The current embedding model is optimized primarily for general semantic retrieval.

For deeper multilingual or Indian-language understanding, models such as:

```text
BAAI/bge-m3
multilingual-e5
```

may provide better results depending on the dataset.

---

# 🐛 Debug & Developer Mode

The application includes a developer debugging panel exposing the retrieval pipeline.

It can visualize:

```text
Query Interpretation
        ↓
Intent
        ↓
Entities
        ↓
Semantic Candidates
        ↓
BM25 Candidates
        ↓
Metadata Filtering
        ↓
Merged Candidates
        ↓
Reranking
        ↓
Final Score
```

This makes it easier to understand **why a particular message was ranked #1**.

---

# 📁 Project Structure

```text
semantic-chat-search/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── pipeline/
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
├── scripts/
│   ├── generate_dataset.py
│   ├── build_index.py
│   └── evaluate.py
│
├── tests/
│
├── data/
│
├── evaluation_queries.json
│
├── .env.example
│
└── README.md
```

---

# 🏆 Hackathon Value Proposition

### Traditional Search

> **“Find messages containing these words.”**

### Semantic Group Chat Search

> **“Find the conversation where this idea, decision, or event was discussed.”**

The system transforms group-chat search from:

```text
Keyword Matching
```

into:

```text
Intent
   +
Semantic Meaning
   +
Metadata
   +
Conversation Context
   +
Decision Awareness
```

---

# 🎬 Example Demo

### User

> **“When did we decide to go to Manali?”**

### Search Engine

```text
Intent:
Decision Retrieval

Entities:
Manali

Time:
Not specified

Semantic Search:
✓ Candidate found

BM25:
✓ Supporting candidates found

Decision Signal:
✓ "final"
✓ "confirm"
✓ "book"

Final Match:
⭐ Manali final hai bhai, February mein chalte hain.
```

The UI then displays the surrounding conversation so the user can see **how the decision was made**, not just one isolated message.

---

# 🔮 Future Improvements

Potential next steps include:

* 🔤 Better multilingual embeddings
* 🧵 Conversation/thread detection
* 🧠 Cross-encoder reranking
* 🗣️ Voice-query support
* 📱 WhatsApp/Telegram export ingestion
* 🔐 Local/private inference
* 📚 Larger real-world datasets
* 🤖 Conversational follow-up queries
* 🧩 Multi-hop retrieval
* 📌 Automatic decision extraction
* 🕸️ Conversation knowledge graphs

---

# 📜 License

MIT License.

Built for hackathon demonstration and experimentation.

---

# ⭐ Built With

**FastAPI · LangGraph · LlamaIndex · ChromaDB · BM25 · Sentence Transformers · React 19 · Vite · Tailwind CSS**

> **Search the meaning. Find the moment. Recover the decision.** 🔍
