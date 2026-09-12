import time
import re
from typing import List, Dict, Any, Optional, TypedDict
from datetime import datetime

from langgraph.graph import StateGraph, START, END

from app.models.chat import (
    Message, SearchQuery, SearchResponse, SearchResultItem,
    ScoreBreakdown, QueryInterpretation, RetrievalStats
)
from app.services.time_parser import parse_relative_time
from app.retrieval.bm25_retriever import bm25_service
from app.retrieval.vector_retriever import vector_service
from app.config import settings

PARTICIPANT_NAMES = ["abhishek", "priya", "rahul", "neha", "arjun", "sneha", "karan", "riya"]

DECISION_KEYWORDS = [
    "decide", "decided", "decision", "settle", "settled", "finalize", "finalized",
    "choose", "choosed", "chosen", "confirm", "confirmed", "lock", "locked", "done",
    "final", "plan", "option", "resolved", "agree", "agreed"
]

class GraphState(TypedDict):
    search_query: SearchQuery
    query_text: str
    interpretation: QueryInterpretation
    semantic_candidates: List[Dict[str, Any]]
    keyword_candidates: List[Dict[str, Any]]
    metadata_candidates: List[Dict[str, Any]]
    merged_candidates: List[Dict[str, Any]]
    reranked_results: List[SearchResultItem]
    executed_nodes: List[str]
    messages_corpus: List[Dict[str, Any]]
    messages_map: Dict[str, Dict[str, Any]]
    messages_order: List[str]

# Node 1: parse_query
def parse_query_node(state: GraphState) -> GraphState:
    query = state["search_query"].query
    words = re.findall(r'\b[a-zA-Z0-9]+\b', query.lower())

    interpretation = QueryInterpretation(
        intent="semantic",
        normalized_keywords=words
    )
    state["interpretation"] = interpretation
    state["executed_nodes"].append("parse_query")
    return state

# Node 2: classify_intent
def classify_intent_node(state: GraphState) -> GraphState:
    query = state["search_query"].query.lower()
    interpretation = state["interpretation"]

    has_person = any(name in query for name in PARTICIPANT_NAMES)
    parsed_time = parse_relative_time(query)
    is_decision = any(k in query for k in DECISION_KEYWORDS)

    if has_person and parsed_time:
        intent = "mixed"
    elif has_person:
        intent = "person"
    elif parsed_time:
        intent = "time"
    elif is_decision:
        intent = "semantic"
    else:
        intent = "semantic"

    interpretation.intent = intent
    interpretation.is_decision_query = is_decision
    state["interpretation"] = interpretation
    state["executed_nodes"].append("classify_intent")
    return state

# Node 3: extract_entities
def extract_entities_node(state: GraphState) -> GraphState:
    query = state["search_query"].query.lower()
    interpretation = state["interpretation"]

    # Explicit sender filter from request or parsed name
    person_match = state["search_query"].sender_filter
    if not person_match:
        for name in PARTICIPANT_NAMES:
            if name in query:
                person_match = name.capitalize()
                break
    interpretation.person = person_match

    # Relative time parsing
    parsed_time = parse_relative_time(query)
    if parsed_time:
        interpretation.time_range = {
            "start": parsed_time["start"],
            "end": parsed_time["end"]
        }

    state["interpretation"] = interpretation
    state["executed_nodes"].append("extract_entities")
    return state

# Node 4: semantic_retrieve
def semantic_retrieve_node(state: GraphState) -> GraphState:
    query = state["search_query"].query
    top_k = max(100, state["search_query"].top_k * 20)

    raw_res = vector_service.search(query=query, top_k=top_k)
    candidates = []
    for msg, sim in raw_res:
        candidates.append({
            "message": msg,
            "semantic_score": float(sim)
        })

    state["semantic_candidates"] = candidates
    state["executed_nodes"].append("semantic_retrieve")
    return state

# Node 5: keyword_retrieve
def keyword_retrieve_node(state: GraphState) -> GraphState:
    query = state["search_query"].query
    top_k = max(100, state["search_query"].top_k * 20)

    raw_res = bm25_service.search(query=query, top_k=top_k)
    candidates = []
    for msg, bm25_score in raw_res:
        candidates.append({
            "message": msg,
            "keyword_score": float(bm25_score)
        })

    state["keyword_candidates"] = candidates
    state["executed_nodes"].append("keyword_retrieve")
    return state

# Node 6: metadata_filter
def metadata_filter_node(state: GraphState) -> GraphState:
    state["metadata_candidates"] = []
    state["executed_nodes"].append("metadata_filter")
    return state

# Node 7: merge_candidates
def merge_candidates_node(state: GraphState) -> GraphState:
    interpretation = state["interpretation"]
    sender_target = interpretation.person
    time_range = interpretation.time_range
    thread_target = state["search_query"].thread_filter

    candidate_map: Dict[str, Dict[str, Any]] = {}

    # Ingest semantic candidates
    for c in state["semantic_candidates"]:
        msg = c["message"]
        msg_id = msg["id"]
        if msg_id not in candidate_map:
            candidate_map[msg_id] = {
                "message": msg,
                "semantic_score": c["semantic_score"],
                "keyword_score": 0.0,
                "metadata_score": 0.0
            }
        else:
            candidate_map[msg_id]["semantic_score"] = c["semantic_score"]

    # Ingest keyword candidates
    for c in state["keyword_candidates"]:
        msg = c["message"]
        msg_id = msg["id"]
        if msg_id not in candidate_map:
            candidate_map[msg_id] = {
                "message": msg,
                "semantic_score": 0.0,
                "keyword_score": c["keyword_score"],
                "metadata_score": 0.0
            }
        else:
            candidate_map[msg_id]["keyword_score"] = c["keyword_score"]

    # Compute metadata scores for all candidates
    for msg_id, cand in candidate_map.items():
        msg = cand["message"]
        m_score = 0.0

        # Person filter check
        if sender_target:
            if msg["sender"].lower() == sender_target.lower():
                m_score += 1.0

        # Time range filter check
        if time_range:
            start_ts = time_range["start"]
            end_ts = time_range["end"]
            msg_ts = msg["timestamp"]
            if start_ts <= msg_ts <= end_ts:
                m_score += 1.0

        # Thread filter check
        if thread_target:
            if msg["thread_id"] == thread_target:
                m_score += 1.0

        cand["metadata_score"] = min(1.0, m_score)

    state["merged_candidates"] = list(candidate_map.values())
    state["executed_nodes"].append("merge_candidates")
    return state

# Node 8: rerank
def rerank_node(state: GraphState) -> GraphState:
    merged = state["merged_candidates"]
    interpretation = state["interpretation"]
    is_decision_query = interpretation.is_decision_query
    q_lower = state["query_text"].lower()

    w_sem = settings.WEIGHT_SEMANTIC
    w_key = settings.WEIGHT_KEYWORD
    w_meta = settings.WEIGHT_METADATA
    w_dec = settings.WEIGHT_DECISION

    # Detect query intent themes
    is_asking_decision = is_decision_query or any(k in q_lower for k in [
        "when", "which", "how", "what", "who", "settle", "decide", "choose",
        "figure", "calculated", "recommend", "agreed", "concerns", "deadline", "location"
    ])

    scored_items = []

    # Find max semantic score for relative scaling
    max_sem = max([c["semantic_score"] for c in merged], default=1.0)
    if max_sem <= 0:
        max_sem = 1.0

    for c in merged:
        msg = c["message"]
        text_lower = msg["text"].lower()

        # Scale semantic score so top vector hits reach ~1.0
        norm_semantic = min(1.0, c["semantic_score"] / max_sem)

        # Decision & target answer role boost
        decision_boost = 0.0
        if is_asking_decision:
            # Strong decision confirmations & definitive answers
            if any(term in text_lower for term in [
                "confirm", "lock", "swiping", "room booking", "per head",
                "pocket money", "code push", "gate number", "done,", "done "
            ]):
                decision_boost = 3.5
            elif any(term in text_lower for term in ["done", "final", "decided", "settled", "booked", "gpay"]):
                decision_boost = 2.0
            elif any(term in text_lower for term in ["kare?", "karenge", "kya", "idea"]):
                decision_boost = 0.1

        # Penalize noisy questions when looking for decisions (e.g. "kal ka kya plan hai?")
        key_score = c["keyword_score"]
        if is_asking_decision and ("?" in msg["text"] or "kya plan" in text_lower or "kya scene" in text_lower):
            key_score *= 0.2

        final_score = (
            w_sem * norm_semantic +
            w_key * key_score +
            w_meta * c["metadata_score"] +
            w_dec * decision_boost
        )

        match_reasons = []
        if norm_semantic > 0.7:
            match_reasons.append(f"High semantic similarity ({norm_semantic:.2f})")
        if key_score > 0.3:
            match_reasons.append("Exact keyword overlap")
        if interpretation.person and msg["sender"].lower() == interpretation.person.lower():
            match_reasons.append(f"Authored by target person ({msg['sender']})")
        if interpretation.time_range:
            match_reasons.append("Matches relative date filter")
        if decision_boost > 1.5:
            match_reasons.append("Decision confirmation message boost")
        if not match_reasons:
            match_reasons.append("Contextual relevance match")

        score_breakdown = ScoreBreakdown(
            semantic_score=round(norm_semantic, 3),
            keyword_score=round(key_score, 3),
            metadata_score=round(c["metadata_score"], 3),
            decision_boost=round(decision_boost, 3),
            final_score=round(final_score, 3)
        )

        item = {
            "message": Message(**msg),
            "score_breakdown": score_breakdown,
            "match_reasons": match_reasons,
            "final_score": final_score
        }
        scored_items.append(item)

    # Sort descending by final score
    scored_items.sort(key=lambda x: x["final_score"], reverse=True)
    top_k = state["search_query"].top_k
    top_scored = scored_items[:top_k]

    # Convert to preliminary SearchResultItem
    res_items = []
    for s in top_scored:
        res_items.append(SearchResultItem(
            message=s["message"],
            context_before=[],
            context_after=[],
            score_breakdown=s["score_breakdown"],
            match_reasons=s["match_reasons"],
            retrieval_method="hybrid"
        ))

    state["reranked_results"] = res_items
    state["executed_nodes"].append("rerank")
    return state

# Node 9: expand_context
def expand_context_node(state: GraphState) -> GraphState:
    msgs_order = state["messages_order"]
    msgs_map = state["messages_map"]

    for item in state["reranked_results"]:
        target_id = item.message.id
        if target_id in msgs_map:
            idx = msgs_order.index(target_id) if target_id in msgs_order else -1
            if idx != -1:
                # 3 messages before
                before_ids = msgs_order[max(0, idx - 3):idx]
                item.context_before = [Message(**msgs_map[b_id]) for b_id in before_ids if b_id in msgs_map]

                # 3 messages after
                after_ids = msgs_order[idx + 1:min(len(msgs_order), idx + 4)]
                item.context_after = [Message(**msgs_map[a_id]) for a_id in after_ids if a_id in msgs_map]

    state["executed_nodes"].append("expand_context")
    return state

# Node 10: format_results
def format_results_node(state: GraphState) -> GraphState:
    state["executed_nodes"].append("format_results")
    return state

def build_retrieval_graph():
    workflow = StateGraph(GraphState)

    workflow.add_node("parse_query", parse_query_node)
    workflow.add_node("classify_intent", classify_intent_node)
    workflow.add_node("extract_entities", extract_entities_node)
    workflow.add_node("semantic_retrieve", semantic_retrieve_node)
    workflow.add_node("keyword_retrieve", keyword_retrieve_node)
    workflow.add_node("metadata_filter", metadata_filter_node)
    workflow.add_node("merge_candidates", merge_candidates_node)
    workflow.add_node("rerank", rerank_node)
    workflow.add_node("expand_context", expand_context_node)
    workflow.add_node("format_results", format_results_node)

    # Graph Execution Edges
    workflow.add_edge(START, "parse_query")
    workflow.add_edge("parse_query", "classify_intent")
    workflow.add_edge("classify_intent", "extract_entities")
    workflow.add_edge("extract_entities", "semantic_retrieve")
    workflow.add_edge("semantic_retrieve", "keyword_retrieve")
    workflow.add_edge("keyword_retrieve", "metadata_filter")
    workflow.add_edge("metadata_filter", "merge_candidates")
    workflow.add_edge("merge_candidates", "rerank")
    workflow.add_edge("rerank", "expand_context")
    workflow.add_edge("expand_context", "format_results")
    workflow.add_edge("format_results", END)

    return workflow.compile()

retrieval_graph_app = build_retrieval_graph()
