import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    CHROMA_DIR: str = os.getenv("CHROMA_DIR", "data/chroma_db")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    WEIGHT_SEMANTIC: float = float(os.getenv("WEIGHT_SEMANTIC", "0.55"))
    WEIGHT_KEYWORD: float = float(os.getenv("WEIGHT_KEYWORD", "0.20"))
    WEIGHT_METADATA: float = float(os.getenv("WEIGHT_METADATA", "0.15"))
    WEIGHT_DECISION: float = float(os.getenv("WEIGHT_DECISION", "0.10"))
    
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
