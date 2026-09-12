import os
import json
from typing import List, Dict, Tuple, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings

from llama_index.core import Document, VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.schema import TextNode

from app.config import settings

class VectorRetrieverService:
    def __init__(self):
        self.chroma_client = None
        self.chroma_collection = None
        self.vector_store = None
        self.index = None
        self.embed_model = None
        self.messages_map: Dict[str, Dict] = {}
        
    def initialize(self, chroma_dir: Optional[str] = None):
        if not chroma_dir:
            chroma_dir = settings.CHROMA_DIR
            
        os.makedirs(chroma_dir, exist_ok=True)
        self.chroma_client = chromadb.PersistentClient(path=chroma_dir)
        self.chroma_collection = self.chroma_client.get_or_create_collection("group_chat_collection")
        
        # Load embedding model via HuggingFaceEmbedding
        try:
            self.embed_model = HuggingFaceEmbedding(model_name=settings.EMBEDDING_MODEL)
        except Exception as e:
            print(f"Warning: Loading HF model {settings.EMBEDDING_MODEL} failed: {e}. Falling back to default.")
            self.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
            
        self.vector_store = ChromaVectorStore(chroma_collection=self.chroma_collection)
        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        
        # Try loading existing index
        try:
            self.index = VectorStoreIndex.from_vector_store(
                self.vector_store,
                embed_model=self.embed_model
            )
        except Exception as e:
            print(f"No existing VectorStoreIndex found: {e}")

    def reset_collection(self):
        if self.chroma_collection:
            try:
                existing = self.chroma_collection.get()
                if existing and existing.get("ids") and len(existing["ids"]) > 0:
                    # Delete in batches of 1000 to prevent buffer overflow
                    all_ids = existing["ids"]
                    for i in range(0, len(all_ids), 1000):
                        batch_ids = all_ids[i:i+1000]
                        self.chroma_collection.delete(ids=batch_ids)
            except Exception as e:
                print(f"Reset collection warning: {e}")

    def build_index(self, messages: List[Dict]):
        self.reset_collection()
        self.messages_map = {m["id"]: m for m in messages}
        
        nodes = []
        for m in messages:
            node_text = f"Sender: {m['sender']} | Message: {m['text']}"
            
            node = TextNode(
                text=node_text,
                id_=m["id"],
                metadata={
                    "id": m["id"],
                    "timestamp": m["timestamp"],
                    "sender": m["sender"],
                    "thread_id": m["thread_id"],
                    "message_type": m["message_type"],
                    "is_forwarded": m["is_forwarded"],
                    "raw_text": m["text"]
                }
            )
            nodes.append(node)
            
        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        self.index = VectorStoreIndex(
            nodes,
            storage_context=storage_context,
            embed_model=self.embed_model
        )
        print(f"Successfully built LlamaIndex + ChromaDB index with {len(nodes)} message nodes.")

    def search(self, query: str, top_k: int = 20, metadata_filters: Optional[Dict] = None) -> List[Tuple[Dict, float]]:
        if not self.index:
            # Fallback direct search via Chroma collection if index object isn't ready
            if self.chroma_collection:
                results = self.chroma_collection.query(
                    query_texts=[query],
                    n_results=top_k
                )
                res = []
                if results and results["ids"] and results["ids"][0]:
                    ids = results["ids"][0]
                    distances = results["distances"][0] if "distances" in results and results["distances"] else [0.5]*len(ids)
                    for msg_id, dist in zip(ids, distances):
                        # Convert distance to similarity score
                        sim = max(0.0, 1.0 - float(dist))
                        if msg_id in self.messages_map:
                            res.append((self.messages_map[msg_id], sim))
                return res
            return []
            
        retriever = self.index.as_retriever(similarity_top_k=top_k)
        nodes_with_scores = retriever.retrieve(query)
        
        results = []
        for nws in nodes_with_scores:
            msg_id = nws.node.node_id
            score = float(nws.score) if nws.score is not None else 0.5
            
            if msg_id in self.messages_map:
                msg = self.messages_map[msg_id]
            else:
                # Reconstruct from metadata if available
                meta = nws.node.metadata
                msg = {
                    "id": msg_id,
                    "text": nws.node.text,
                    "sender": meta.get("sender", "Unknown"),
                    "timestamp": meta.get("timestamp", ""),
                    "thread_id": meta.get("thread_id", ""),
                    "message_type": meta.get("message_type", "text"),
                    "is_forwarded": meta.get("is_forwarded", False)
                }
            results.append((msg, score))
            
        return results

vector_service = VectorRetrieverService()
