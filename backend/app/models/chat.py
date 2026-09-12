from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Message(BaseModel):
    id: str
    timestamp: str
    sender: str
    text: str
    thread_id: str
    message_type: str = "text"  # text, media, forwarded, link, system
    reply_to: Optional[str] = None
    is_forwarded: bool = False

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5
    sender_filter: Optional[str] = None
    time_filter: Optional[str] = None
    thread_filter: Optional[str] = None

class DatasetSelectRequest(BaseModel):
    dataset_id: str

class QueryInterpretation(BaseModel):
    intent: str  # semantic, person, time, mixed
    person: Optional[str] = None
    time_range: Optional[Dict[str, str]] = None
    topic: Optional[str] = None
    is_decision_query: bool = False
    normalized_keywords: List[str] = Field(default_factory=list)

class ScoreBreakdown(BaseModel):
    semantic_score: float = 0.0
    keyword_score: float = 0.0
    metadata_score: float = 0.0
    decision_boost: float = 0.0
    final_score: float = 0.0

class SearchResultItem(BaseModel):
    message: Message
    context_before: List[Message] = Field(default_factory=list)
    context_after: List[Message] = Field(default_factory=list)
    score_breakdown: ScoreBreakdown
    match_reasons: List[str] = Field(default_factory=list)
    retrieval_method: str = "hybrid"

class RetrievalStats(BaseModel):
    semantic_candidates_count: int = 0
    keyword_candidates_count: int = 0
    metadata_candidates_count: int = 0
    total_candidates_merged: int = 0
    execution_time_ms: float = 0.0
    graph_nodes_executed: List[str] = Field(default_factory=list)

class SearchResponse(BaseModel):
    query: str
    interpretation: QueryInterpretation
    results: List[SearchResultItem]
    retrieval_stats: RetrievalStats

class EvaluationQueryMetrics(BaseModel):
    query_id: str
    query: str
    category: str
    expected_message_id: str
    retrieved_message_id: Optional[str] = None
    rank: Optional[int] = None
    reciprocal_rank: float = 0.0
    correct: bool = False
    zero_word_overlap: bool = False
    overlap_count: int = 0

class EvaluationReport(BaseModel):
    total_queries: int = 40
    overall_correct: int = 0
    overall_accuracy: float = 0.0
    zero_overlap_total: int = 8
    zero_overlap_correct: int = 0
    zero_overlap_accuracy: float = 0.0
    recall_at_1: float = 0.0
    recall_at_3: float = 0.0
    recall_at_5: float = 0.0
    mrr: float = 0.0
    queries_detail: List[EvaluationQueryMetrics] = Field(default_factory=list)
    baseline_comparison: Dict[str, Dict[str, float]] = Field(default_factory=dict)
