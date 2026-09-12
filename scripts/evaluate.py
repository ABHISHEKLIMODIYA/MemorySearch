import os
import json
import sys
import re

# Ensure backend root is on python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.models.chat import SearchQuery, QueryInterpretation
from app.graph.retrieval_graph import retrieval_graph_app
from app.retrieval.bm25_retriever import bm25_service
from app.retrieval.vector_retriever import vector_service

QUERIES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "queries.json")
MESSAGES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "messages.jsonl")
EVALUATION_OUTPUT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "evaluation_results.json")

ENGLISH_HINDI_STOPWORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from", "up",
    "about", "into", "over", "after", "is", "am", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "but", "and", "or", "if",
    "because", "as", "until", "while", "that", "which", "who", "whom", "this", "these",
    "those", "then", "just", "so", "than", "such", "both", "through", "during", "before",
    "under", "again", "further", "once", "here", "there", "when", "where", "why", "how",
    "all", "any", "each", "few", "more", "most", "other", "some", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "can", "will", "should", "now",
    "we", "you", "he", "she", "it", "they", "them", "my", "your", "his", "her", "our",
    "hai", "hain", "ko", "se", "ka", "ki", "ke", "ne", "me", "main", "ye", "wo"
}

def count_overlap(q_text: str, a_text: str) -> int:
    q_words = {w for w in re.findall(r'\b[a-z0-9]+\b', q_text.lower()) if w not in ENGLISH_HINDI_STOPWORDS and len(w) > 1}
    a_words = {w for w in re.findall(r'\b[a-z0-9]+\b', a_text.lower()) if w not in ENGLISH_HINDI_STOPWORDS and len(w) > 1}
    return len(q_words.intersection(a_words))

def eval_method(queries, messages_map, method_name="hybrid"):
    correct_r1 = 0
    correct_r3 = 0
    correct_r5 = 0
    mrr_total = 0.0
    zero_overlap_correct = 0
    zero_overlap_total = 0

    category_stats = {}

    query_details = []

    for q in queries:
        q_id = q.get("id", q.get("query_id"))
        query_text = q["query"]
        expected_id = q.get("gold_message_id", q.get("expected_message_id"))
        is_zero_overlap = q.get("zero_word_overlap", q.get("hard", False))
        category = q.get("type", q.get("category", "general"))

        if category not in category_stats:
            category_stats[category] = {"total": 0, "correct": 0}
        category_stats[category]["total"] += 1

        if is_zero_overlap:
            zero_overlap_total += 1

        retrieved_ids = []

        if method_name == "keyword":
            raw_res = bm25_service.search(query=query_text, top_k=10)
            retrieved_ids = [m["id"] for m, score in raw_res]
        elif method_name == "vector":
            raw_res = vector_service.search(query=query_text, top_k=10)
            retrieved_ids = [m["id"] for m, score in raw_res]
        else: # Hybrid + Reranking (Full LangGraph)
            initial_state = {
                "search_query": SearchQuery(query=query_text, top_k=10),
                "query_text": query_text,
                "interpretation": QueryInterpretation(intent="semantic"),
                "semantic_candidates": [],
                "keyword_candidates": [],
                "metadata_candidates": [],
                "merged_candidates": [],
                "reranked_results": [],
                "executed_nodes": [],
                "messages_corpus": list(messages_map.values()),
                "messages_map": messages_map,
                "messages_order": list(messages_map.keys())
            }
            final_state = retrieval_graph_app.invoke(initial_state)
            retrieved_ids = [item.message.id for item in final_state["reranked_results"]]

        rank = None
        if expected_id in retrieved_ids:
            rank = retrieved_ids.index(expected_id) + 1

        rr = (1.0 / rank) if rank else 0.0
        mrr_total += rr

        is_correct_r1 = (rank == 1)
        if is_correct_r1:
            correct_r1 += 1
            category_stats[category]["correct"] += 1
            if is_zero_overlap:
                zero_overlap_correct += 1

        if rank and rank <= 3:
            correct_r3 += 1
        if rank and rank <= 5:
            correct_r5 += 1

        target_text = messages_map[expected_id]["text"] if expected_id in messages_map else ""
        overlap = count_overlap(query_text, target_text)

        query_details.append({
            "id": q_id,
            "query_id": q_id,
            "query": query_text,
            "type": category,
            "category": category,
            "gold_message_id": expected_id,
            "expected_message_id": expected_id,
            "retrieved_message_id": retrieved_ids[0] if retrieved_ids else None,
            "rank": rank,
            "reciprocal_rank": round(rr, 3),
            "correct": is_correct_r1,
            "hard": is_zero_overlap,
            "zero_word_overlap": is_zero_overlap,
            "overlap_count": overlap,
            "expected_intent": q.get("expected_intent", ""),
            "expected_answer_summary": q.get("expected_answer_summary", "")
        })

    n = len(queries)
    overall_acc = round((correct_r1 / n) * 100.0, 1)
    zero_overlap_acc = round((zero_overlap_correct / max(1, zero_overlap_total)) * 100.0, 1)
    accuracy_gap = round(overall_acc - zero_overlap_acc, 1)

    cat_breakdown = {}
    for cat, stats in category_stats.items():
        cat_breakdown[cat] = {
            "total": stats["total"],
            "correct": stats["correct"],
            "accuracy": round((stats["correct"] / max(1, stats["total"])) * 100.0, 1)
        }

    return {
        "method": method_name,
        "total_queries": n,
        "overall_correct": correct_r1,
        "overall_accuracy": overall_acc,
        "zero_overlap_total": zero_overlap_total,
        "zero_overlap_correct": zero_overlap_correct,
        "zero_overlap_accuracy": zero_overlap_acc,
        "accuracy_gap": accuracy_gap,
        "recall_at_1": overall_acc,
        "recall_at_3": round((correct_r3 / n) * 100.0, 1),
        "recall_at_5": round((correct_r5 / n) * 100.0, 1),
        "mrr": round(mrr_total / n, 3),
        "category_breakdown": cat_breakdown,
        "queries_detail": query_details
    }

def main():
    if not os.path.exists(QUERIES_FILE) or not os.path.exists(MESSAGES_FILE):
        print("Dataset missing. Running data generation & indexing first...")
        os.system("python scripts/generate_dataset.py")
        os.system("python scripts/build_index.py")

    with open(QUERIES_FILE, "r", encoding="utf-8") as f:
        queries = json.load(f)

    messages_map = {}
    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                m = json.loads(line)
                messages_map[m["id"]] = m

    bm25_service.fit(list(messages_map.values()))
    vector_service.initialize()
    vector_service.messages_map = messages_map

    print("\nRunning Evaluation Benchmarks...")
    print("------------------------------------------")
    print("1. Evaluating Keyword-only Baseline (BM25)...")
    keyword_res = eval_method(queries, messages_map, "keyword")

    print("2. Evaluating Vector-only Baseline (ChromaDB Dense)...")
    vector_res = eval_method(queries, messages_map, "vector")

    print("3. Evaluating Full LangGraph Hybrid Pipeline...")
    hybrid_res = eval_method(queries, messages_map, "hybrid")

    print("\n==========================================")
    print("   SEMANTIC CHAT SEARCH EVALUATION REPORT  ")
    print("==========================================")
    print(f"Total Benchmark Queries: {hybrid_res['total_queries']}")
    print(f"Overall Accuracy (Recall@1): {hybrid_res['overall_correct']}/{hybrid_res['total_queries']} ({hybrid_res['overall_accuracy']}%)")
    print(f"Zero-Word-Overlap Accuracy:  {hybrid_res['zero_overlap_correct']}/{hybrid_res['zero_overlap_total']} ({hybrid_res['zero_overlap_accuracy']}%)")
    print(f"Accuracy Gap (Overall - Hard): {hybrid_res['accuracy_gap']}%")
    print(f"Recall@3: {hybrid_res['recall_at_3']}%")
    print(f"Recall@5: {hybrid_res['recall_at_5']}%")
    print(f"MRR:      {hybrid_res['mrr']}")
    print("------------------------------------------")
    print("Category Breakdown:")
    for cat, stats in hybrid_res["category_breakdown"].items():
        print(f"  - {cat.capitalize()}: {stats['correct']}/{stats['total']} ({stats['accuracy']}%)")
    print("==========================================")

    print("\nBASELINE COMPARISON MATRIX:")
    print(f"{'Method':<20} | {'Overall Acc':<12} | {'Zero-Overlap Acc':<18} | {'Gap':<6} | {'Recall@3':<10} | {'MRR':<6}")
    print("-" * 85)
    for res in [keyword_res, vector_res, hybrid_res]:
        print(f"{res['method']:<20} | {res['overall_accuracy']:>10.1f}% | {res['zero_overlap_accuracy']:>16.1f}% | {res['accuracy_gap']:>5.1f}% | {res['recall_at_3']:>8.1f}% | {res['mrr']:>6.3f}")

    final_report = {
        "total_queries": hybrid_res["total_queries"],
        "overall_correct": hybrid_res["overall_correct"],
        "overall_accuracy": hybrid_res["overall_accuracy"],
        "zero_overlap_total": hybrid_res["zero_overlap_total"],
        "zero_overlap_correct": hybrid_res["zero_overlap_correct"],
        "zero_overlap_accuracy": hybrid_res["zero_overlap_accuracy"],
        "accuracy_gap": hybrid_res["accuracy_gap"],
        "recall_at_1": hybrid_res["recall_at_1"],
        "recall_at_3": hybrid_res["recall_at_3"],
        "recall_at_5": hybrid_res["recall_at_5"],
        "mrr": hybrid_res["mrr"],
        "category_breakdown": hybrid_res["category_breakdown"],
        "queries_detail": hybrid_res["queries_detail"],
        "baseline_comparison": {
            "Keyword (BM25)": {
                "overall_acc": keyword_res["overall_accuracy"],
                "zero_overlap_acc": keyword_res["zero_overlap_accuracy"],
                "accuracy_gap": keyword_res["accuracy_gap"],
                "recall_at_3": keyword_res["recall_at_3"],
                "mrr": keyword_res["mrr"]
            },
            "Vector (Dense)": {
                "overall_acc": vector_res["overall_accuracy"],
                "zero_overlap_acc": vector_res["zero_overlap_accuracy"],
                "accuracy_gap": vector_res["accuracy_gap"],
                "recall_at_3": vector_res["recall_at_3"],
                "mrr": vector_res["mrr"]
            },
            "Hybrid (LangGraph)": {
                "overall_acc": hybrid_res["overall_accuracy"],
                "zero_overlap_acc": hybrid_res["zero_overlap_accuracy"],
                "accuracy_gap": hybrid_res["accuracy_gap"],
                "recall_at_3": hybrid_res["recall_at_3"],
                "mrr": hybrid_res["mrr"]
            }
        }
    }

    with open(EVALUATION_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(final_report, f, indent=2, ensure_ascii=False)

    print(f"\nEvaluation summary saved to {EVALUATION_OUTPUT}")

if __name__ == "__main__":
    main()
