import os
import json
import sys

# Ensure backend root is on python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.retrieval.vector_retriever import vector_service
from app.retrieval.bm25_retriever import bm25_service

MESSAGES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "messages.jsonl")

def main():
    if not os.path.exists(MESSAGES_FILE):
        print(f"Error: {MESSAGES_FILE} does not exist. Please run 'python scripts/generate_dataset.py' first.")
        sys.exit(1)
        
    print("Loading messages dataset...")
    messages = []
    with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                messages.append(json.loads(line))
                
    print(f"Loaded {len(messages)} messages.")
    
    print("Initializing Vector Store Service (ChromaDB + LlamaIndex)...")
    vector_service.initialize()
    vector_service.build_index(messages)
    
    print("Fitting BM25 Retriever Service...")
    bm25_service.fit(messages)
    
    print("\n[OK] Indexing complete! Artifacts persisted to data/chroma_db/")

if __name__ == "__main__":
    main()
