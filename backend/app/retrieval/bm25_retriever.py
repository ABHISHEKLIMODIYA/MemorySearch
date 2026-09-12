import re
from typing import List, Dict, Tuple, Optional
from rank_bm25 import BM25Okapi

def tokenize(text: str) -> List[str]:
    return re.findall(r'\b[a-zA-Z0-9]+\b', text.lower())

class BM25RetrieverService:
    def __init__(self):
        self.bm25: Optional[BM25Okapi] = None
        self.messages: List[Dict] = []
        self.id_to_index: Dict[str, int] = {}
        
    def fit(self, messages: List[Dict]):
        self.messages = messages
        self.id_to_index = {m["id"]: i for i, m in enumerate(messages)}
        corpus = [tokenize(f"{m['sender']} {m['thread_id']} {m['text']}") for m in messages]
        self.bm25 = BM25Okapi(corpus)
        
    def search(self, query: str, top_k: int = 20) -> List[Tuple[Dict, float]]:
        if not self.bm25 or not self.messages:
            return []
            
        tokenized_query = tokenize(query)
        if not tokenized_query:
            return []
            
        raw_scores = self.bm25.get_scores(tokenized_query)
        top_indices = sorted(range(len(raw_scores)), key=lambda i: raw_scores[i], reverse=True)[:top_k]
        
        max_score = raw_scores[top_indices[0]] if top_indices and raw_scores[top_indices[0]] > 0 else 1.0
        
        results = []
        for idx in top_indices:
            score = raw_scores[idx]
            if score <= 0:
                continue
            normalized_score = float(score / max_score)
            results.append((self.messages[idx], normalized_score))
            
        return results

bm25_service = BM25RetrieverService()
