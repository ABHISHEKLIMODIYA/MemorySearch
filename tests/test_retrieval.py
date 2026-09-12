import os
import sys
import json
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.models.chat import SearchQuery, QueryInterpretation
from app.graph.retrieval_graph import retrieval_graph_app

MESSAGES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "messages.jsonl")

def test_langgraph_retrieval_execution():
    if not os.path.exists(MESSAGES_FILE):
        pytest.skip("Dataset missing")

    msgs = []
    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                msgs.append(json.loads(line))

    msg_map = {m["id"]: m for m in msgs}
    msgs_order = [m["id"] for m in msgs]

    query_obj = SearchQuery(query="When did we decide on the trip?", top_k=5)
    initial_state = {
        "search_query": query_obj,
        "query_text": query_obj.query,
        "interpretation": QueryInterpretation(intent="semantic"),
        "semantic_candidates": [],
        "keyword_candidates": [],
        "metadata_candidates": [],
        "merged_candidates": [],
        "reranked_results": [],
        "executed_nodes": [],
        "messages_corpus": msgs,
        "messages_map": msg_map,
        "messages_order": msgs_order
    }

    final_state = retrieval_graph_app.invoke(initial_state)

    assert len(final_state["executed_nodes"]) >= 10
    assert "parse_query" in final_state["executed_nodes"]
    assert "format_results" in final_state["executed_nodes"]
    assert len(final_state["reranked_results"]) <= 5
