import os
import json
import pytest
from scripts.generate_dataset import count_overlap, normalize_text

QUERIES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "queries.json")
MESSAGES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "messages.jsonl")

def test_zero_word_overlap_queries_property():
    eval_queries_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "evaluation_queries.json")
    target_file = eval_queries_file if os.path.exists(eval_queries_file) else QUERIES_FILE

    if not os.path.exists(target_file) or not os.path.exists(MESSAGES_FILE):
        pytest.skip("Dataset files missing. Generate dataset first.")

    with open(target_file, "r", encoding="utf-8") as f:
        queries = json.load(f)

    msg_map = {}
    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                m = json.loads(line)
                msg_map[m["id"]] = m

    assert len(queries) == 40, f"Expected exactly 40 evaluation benchmark queries, found {len(queries)}"

    zero_overlap_queries = [q for q in queries if q.get("zero_word_overlap") or q.get("hard")]
    assert len(zero_overlap_queries) >= 8, f"Expected at least 8 zero-overlap queries, found {len(zero_overlap_queries)}"

    for q in queries:
        gold_id = q.get("gold_message_id", q.get("expected_message_id"))
        assert gold_id in msg_map, f"Gold message {gold_id} for query '{q['query']}' not found in corpus"

    for q in zero_overlap_queries:
        target_id = q.get("gold_message_id", q.get("expected_message_id"))
        target_text = msg_map[target_id]["text"]

        q_words = normalize_text(q["query"])
        a_words = normalize_text(target_text)

        overlap = q_words.intersection(a_words)
        assert len(overlap) == 0, f"Query '{q['query']}' had non-zero word overlap with '{target_text}': {overlap}"

