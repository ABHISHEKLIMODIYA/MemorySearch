import os
import json
import time
import csv
import io
from typing import Optional, List, Dict
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Body

from app.models.chat import (
    SearchQuery, SearchResponse, Message,
    RetrievalStats, QueryInterpretation, SearchResultItem,
    DatasetSelectRequest
)
from app.graph.retrieval_graph import retrieval_graph_app
from app.retrieval.bm25_retriever import bm25_service
from app.retrieval.vector_retriever import vector_service

router = APIRouter(prefix="/api")

DATASETS_DIR = "data/datasets"
DATASETS_META_FILE = "data/datasets_meta.json"
MESSAGES_FILE = "data/messages.jsonl"
EVALUATION_FILE = "data/evaluation_results.json"

_messages_cache: List[Dict] = []
_messages_map: Dict[str, Dict] = {}
_messages_order: List[str] = []
_active_dataset_id: str = "default"

def get_datasets_meta() -> List[Dict]:
    if not os.path.exists(DATASETS_META_FILE):
        os.makedirs(DATASETS_DIR, exist_ok=True)
        msgs = []
        if os.path.exists(MESSAGES_FILE):
            with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        msgs.append(json.loads(line))
        default_meta = [{
            "id": "default",
            "name": "Synthetic Group Chat (Default)",
            "filename": "messages.jsonl",
            "file_path": MESSAGES_FILE,
            "message_count": len(msgs) if msgs else 4200,
            "participants": list(set([m["sender"] for m in msgs])) if msgs else ["Rahul", "Priya", "Ankit", "Sneha", "Vikram", "Neha", "Aman", "Rohan"],
            "created_at": "2026-02-14T20:00:00",
            "is_default": True
        }]
        save_datasets_meta(default_meta)
        return default_meta

    try:
        with open(DATASETS_META_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_datasets_meta(meta_list: List[Dict]):
    os.makedirs(os.path.dirname(DATASETS_META_FILE), exist_ok=True)
    with open(DATASETS_META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta_list, f, indent=2, ensure_ascii=False)

def load_dataset_by_id(dataset_id: str) -> Dict:
    global _messages_cache, _messages_map, _messages_order, _active_dataset_id
    meta_list = get_datasets_meta()
    target = next((d for d in meta_list if d["id"] == dataset_id), None)
    if not target:
        target = meta_list[0] if meta_list else None

    if not target:
        raise HTTPException(status_code=404, detail="No datasets available.")

    file_path = target.get("file_path", MESSAGES_FILE)
    if not os.path.exists(file_path):
        file_path = MESSAGES_FILE

    msgs = []
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    msgs.append(json.loads(line))

    _messages_cache = msgs
    _messages_map = {m["id"]: m for m in msgs}
    _messages_order = [m["id"] for m in msgs]
    _active_dataset_id = target["id"]

    # Re-fit retrievers
    bm25_service.fit(msgs)
    vector_service.initialize()
    vector_service.build_index(msgs)

    return target

def load_data_if_needed():
    global _messages_cache
    if not _messages_cache:
        load_dataset_by_id(_active_dataset_id)

@router.get("/datasets")
def list_datasets():
    load_data_if_needed()
    meta_list = get_datasets_meta()
    for d in meta_list:
        d["is_active"] = (d["id"] == _active_dataset_id)
    return {
        "active_id": _active_dataset_id,
        "datasets": meta_list
    }

@router.post("/datasets/select")
def select_dataset(body: DatasetSelectRequest):
    dataset_id = body.dataset_id
    if not dataset_id:
        raise HTTPException(status_code=400, detail="dataset_id is required")

    active_target = load_dataset_by_id(dataset_id)
    meta_list = get_datasets_meta()
    for d in meta_list:
        d["is_active"] = (d["id"] == _active_dataset_id)

    return {
        "status": "success",
        "active_dataset": active_target,
        "datasets": meta_list
    }

@router.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    global _active_dataset_id
    if dataset_id == "default":
        raise HTTPException(status_code=400, detail="Cannot delete default dataset.")

    meta_list = get_datasets_meta()
    target = next((d for d in meta_list if d["id"] == dataset_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    file_path = target.get("file_path")
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    updated_meta = [d for d in meta_list if d["id"] != dataset_id]
    save_datasets_meta(updated_meta)

    if _active_dataset_id == dataset_id:
        load_dataset_by_id("default")

    return {
        "status": "success",
        "message": f"Deleted dataset {target.get('name')}",
        "active_id": _active_dataset_id,
        "datasets": updated_meta
    }

@router.get("/health")
def health_check():
    load_data_if_needed()
    meta_list = get_datasets_meta()
    active = next((d for d in meta_list if d["id"] == _active_dataset_id), None)
    return {
        "status": "healthy",
        "active_dataset_id": _active_dataset_id,
        "active_dataset_name": active.get("name") if active else "Default",
        "messages_count": len(_messages_cache),
        "bm25_ready": bm25_service.bm25 is not None,
        "vector_ready": vector_service.index is not None or vector_service.chroma_collection is not None
    }

@router.post("/search", response_model=SearchResponse)
def execute_search(body: SearchQuery):
    load_data_if_needed()
    if not body.query or not body.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    start_time = time.time()

    initial_state = {
        "search_query": body,
        "query_text": body.query,
        "interpretation": QueryInterpretation(intent="semantic"),
        "semantic_candidates": [],
        "keyword_candidates": [],
        "metadata_candidates": [],
        "merged_candidates": [],
        "reranked_results": [],
        "executed_nodes": [],
        "messages_corpus": _messages_cache,
        "messages_map": _messages_map,
        "messages_order": _messages_order
    }

    final_state = retrieval_graph_app.invoke(initial_state)

    elapsed_ms = (time.time() - start_time) * 1000.0

    stats = RetrievalStats(
        semantic_candidates_count=len(final_state["semantic_candidates"]),
        keyword_candidates_count=len(final_state["keyword_candidates"]),
        metadata_candidates_count=len(final_state["metadata_candidates"]),
        total_candidates_merged=len(final_state["merged_candidates"]),
        execution_time_ms=round(elapsed_ms, 2),
        graph_nodes_executed=final_state["executed_nodes"]
    )

    return SearchResponse(
        query=body.query,
        interpretation=final_state["interpretation"],
        results=final_state["reranked_results"],
        retrieval_stats=stats
    )

@router.get("/messages")
def list_messages(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    sender: Optional[str] = None,
    thread_id: Optional[str] = None
):
    load_data_if_needed()
    filtered = _messages_cache

    if sender:
        filtered = [m for m in filtered if m["sender"].lower() == sender.lower()]
    if thread_id:
        filtered = [m for m in filtered if m["thread_id"] == thread_id]

    total = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_data = filtered[start_idx:end_idx]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "messages": page_data
    }

import zipfile
import re

def parse_whatsapp_text(text_content: str) -> List[Dict]:
    lines = text_content.splitlines()
    msgs = []
    # Pattern 1: WhatsApp export format with date/time, e.g. [12/05/25, 14:30] Rahul: Hey or 12/05/25, 2:30 PM - Rahul: Hey
    pattern_wa = re.compile(
        r'^[\[\s]*(\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[AaPp][Mm])?)[\]\s]*[-–:]?\s*([^:]+):\s*(.+)$'
    )
    current_msg = None
    msg_counter = 1

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue
        match = pattern_wa.match(line_str)
        if match:
            date_str, time_str, sender_str, body = match.groups()
            sender_clean = sender_str.strip()
            if "end-to-end encrypted" in body.lower() or "created group" in body.lower() or "security code changed" in body.lower():
                continue

            iso_timestamp = "2026-02-14T20:00:00"

            msg_obj = {
                "id": f"msg_txt_{msg_counter:06d}",
                "timestamp": iso_timestamp,
                "sender": sender_clean,
                "text": body.strip(),
                "thread_id": "thread_txt_import",
                "message_type": "text",
                "reply_to": None,
                "is_forwarded": False
            }
            msgs.append(msg_obj)
            current_msg = msg_obj
            msg_counter += 1
        elif current_msg:
            current_msg["text"] += "\n" + line_str

    # Fallback 1: Sender: Message format (e.g., "Alice: Hi guys")
    if not msgs:
        pattern_sender = re.compile(r'^([A-Za-z0-9_\s]{2,25}):\s*(.+)$')
        msg_counter = 1
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            match = pattern_sender.match(line_str)
            if match:
                sender_clean, body = match.groups()
                msg_obj = {
                    "id": f"msg_txt_{msg_counter:06d}",
                    "timestamp": "2026-02-14T20:00:00",
                    "sender": sender_clean.strip(),
                    "text": body.strip(),
                    "thread_id": "thread_txt_import",
                    "message_type": "text",
                    "reply_to": None,
                    "is_forwarded": False
                }
                msgs.append(msg_obj)
                current_msg = msg_obj
                msg_counter += 1
            elif current_msg:
                current_msg["text"] += "\n" + line_str

    # Fallback 2: Plain text lines fallback
    if not msgs:
        msg_counter = 1
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            msg_obj = {
                "id": f"msg_txt_{msg_counter:06d}",
                "timestamp": "2026-02-14T20:00:00",
                "sender": "Chat Participant",
                "text": line_str,
                "thread_id": "thread_txt_import",
                "message_type": "text",
                "reply_to": None,
                "is_forwarded": False
            }
            msgs.append(msg_obj)
            msg_counter += 1

    return msgs

@router.get("/evaluation")
def get_evaluation_metrics():
    if not os.path.exists(EVALUATION_FILE):
        raise HTTPException(
            status_code=404,
            detail="Evaluation file data/evaluation_results.json not found. Run 'python scripts/evaluate.py' first."
        )

    with open(EVALUATION_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data

@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    global _messages_cache, _messages_map, _messages_order
    content = await file.read()
    filename = file.filename.lower()

    msgs = []
    try:
        if filename.endswith(".zip"):
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                for zip_info in z.infolist():
                    if zip_info.is_dir():
                        continue
                    z_name = zip_info.filename.lower()
                    z_bytes = z.read(zip_info)
                    if z_name.endswith(".txt"):
                        try:
                            txt_str = z_bytes.decode("utf-8")
                        except Exception:
                            txt_str = z_bytes.decode("latin-1", errors="ignore")
                        extracted_msgs = parse_whatsapp_text(txt_str)
                        msgs.extend(extracted_msgs)
                    elif z_name.endswith(".jsonl"):
                        lines = z_bytes.decode("utf-8", errors="ignore").splitlines()
                        for i, line in enumerate(lines):
                            if line.strip():
                                item = json.loads(line)
                                msgs.append({
                                    "id": item.get("id", f"msg_up_{len(msgs)+1:06d}"),
                                    "timestamp": item.get("timestamp", "2026-02-14T20:00:00"),
                                    "sender": item.get("sender", "User"),
                                    "text": item.get("text", item.get("message", "")),
                                    "thread_id": item.get("thread_id", "thread_custom"),
                                    "message_type": item.get("message_type", "text"),
                                    "reply_to": None,
                                    "is_forwarded": False
                                })
                    elif z_name.endswith(".json"):
                        items = json.loads(z_bytes.decode("utf-8", errors="ignore"))
                        if isinstance(items, list):
                            for item in items:
                                msgs.append({
                                    "id": item.get("id", f"msg_up_{len(msgs)+1:06d}"),
                                    "timestamp": item.get("timestamp", "2026-02-14T20:00:00"),
                                    "sender": item.get("sender", "User"),
                                    "text": item.get("text", item.get("message", "")),
                                    "thread_id": item.get("thread_id", "thread_custom"),
                                    "message_type": item.get("message_type", "text"),
                                    "reply_to": None,
                                    "is_forwarded": False
                                })
        elif filename.endswith(".txt"):
            try:
                txt_str = content.decode("utf-8")
            except Exception:
                txt_str = content.decode("latin-1", errors="ignore")
            msgs = parse_whatsapp_text(txt_str)
        elif filename.endswith(".jsonl"):
            lines = content.decode("utf-8").splitlines()
            for i, line in enumerate(lines):
                if line.strip():
                    item = json.loads(line)
                    msgs.append({
                        "id": item.get("id", f"msg_up_{i+1:06d}"),
                        "timestamp": item.get("timestamp", "2026-02-14T20:00:00"),
                        "sender": item.get("sender", "User"),
                        "text": item.get("text", item.get("message", "")),
                        "thread_id": item.get("thread_id", "thread_custom"),
                        "message_type": item.get("message_type", "text"),
                        "reply_to": item.get("reply_to", None),
                        "is_forwarded": item.get("is_forwarded", False)
                    })
        elif filename.endswith(".json"):
            items = json.loads(content.decode("utf-8"))
            if isinstance(items, list):
                for i, item in enumerate(items):
                    msgs.append({
                        "id": item.get("id", f"msg_up_{i+1:06d}"),
                        "timestamp": item.get("timestamp", "2026-02-14T20:00:00"),
                        "sender": item.get("sender", "User"),
                        "text": item.get("text", item.get("message", "")),
                        "thread_id": item.get("thread_id", "thread_custom"),
                        "message_type": item.get("message_type", "text"),
                        "reply_to": item.get("reply_to", None),
                        "is_forwarded": item.get("is_forwarded", False)
                    })
        elif filename.endswith(".csv"):
            reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
            for i, row in enumerate(reader):
                msgs.append({
                    "id": row.get("id", f"msg_up_{i+1:06d}"),
                    "timestamp": row.get("timestamp", "2026-02-14T20:00:00"),
                    "sender": row.get("sender", "User"),
                    "text": row.get("text", row.get("message", "")),
                    "thread_id": row.get("thread_id", "thread_custom"),
                    "message_type": row.get("message_type", "text"),
                    "reply_to": None,
                    "is_forwarded": False
                })
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .zip, .txt, .jsonl, .json, or .csv")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing dataset file: {str(e)}")

    if not msgs:
        raise HTTPException(status_code=400, detail="Uploaded file contained no valid messages.")

    ds_timestamp = int(time.time())
    dataset_id = f"ds_{ds_timestamp}"
    ds_filename = f"dataset_{ds_timestamp}.jsonl"
    os.makedirs(DATASETS_DIR, exist_ok=True)
    file_path = os.path.join(DATASETS_DIR, ds_filename)

    with open(file_path, "w", encoding="utf-8") as f:
        for m in msgs:
            f.write(json.dumps(m, ensure_ascii=False) + "\n")

    clean_title = file.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
    ds_name = f"{clean_title} ({len(msgs)} msgs)"
    participants = list(set([m["sender"] for m in msgs]))

    new_dataset_meta = {
        "id": dataset_id,
        "name": ds_name,
        "filename": file.filename,
        "file_path": file_path,
        "message_count": len(msgs),
        "participants": participants,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "is_default": False
    }

    meta_list = get_datasets_meta()
    meta_list.append(new_dataset_meta)
    save_datasets_meta(meta_list)

    # Immediately activate & index newly uploaded dataset
    load_dataset_by_id(dataset_id)

    # Refresh active states for return list
    for d in meta_list:
        d["is_active"] = (d["id"] == dataset_id)

    return {
        "status": "success",
        "message": f"Successfully loaded and indexed {len(msgs)} messages for '{ds_name}'.",
        "active_dataset": new_dataset_meta,
        "datasets": meta_list,
        "message_count": len(msgs),
        "participants": participants
    }

@router.get("/auth/me")
@router.post("/auth/login")
@router.post("/auth/register")
def auth_handler(data: Optional[Dict] = Body(None)):
    email = (data.get("email") if data else None) or "user@example.com"
    name = (data.get("name") if data else None) or email.split("@")[0].capitalize()
    return {
        "status": "success",
        "user": {
            "id": "usr_001",
            "name": name,
            "email": email
        },
        "token": "demo_jwt_token_123456789"
    }
