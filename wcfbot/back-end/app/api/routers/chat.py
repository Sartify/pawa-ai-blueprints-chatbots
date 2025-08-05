from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
import logging
import os
import requests
import json
import numpy as np
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
from app.api.models.user_request import UserRequest, UserResponse
from app.engine import pawa_chat_non_streaming, pawa_chat_streaming
from dotenv import load_dotenv

load_dotenv(override=True)

chat_router = r = APIRouter()
logger = logging.getLogger("uvicorn")

PAWA_API_KEY = os.getenv("PAWA_API_KEY")
PAWA_BASE_URL = os.getenv("PAWA_BASE_URL", "https://staging.api.pawa-ai.com")
PAWA_EMBEDDING_MODEL = os.getenv("PAWA_EMBEDDING_MODEL", "pawa-embedding-v1-20240701")
PAWA_CHAT_MODEL = os.getenv("PAWA_CHAT_MODEL", "pawa-v1-ember-20240924")
KNOWLEDGE_BASE_NAME = os.getenv("KB_NAME", "tanzania_vision_2050")

class RAGResponse(BaseModel):
    message: str
    sources: List[Dict[str, Any]] = []
    confidence_score: Optional[float] = None

class RetrievalConfig:
    def __init__(self):
        self.max_chunks = 5
        self.min_similarity = 0.3
        self.chunk_overlap = 0.2
        self.rerank_top_k = 3
        self.tanzania_keywords = [
            "Tanzania", "Vision 2050", "development", "economic growth", 
            "infrastructure", "education", "healthcare", "agriculture"
        ]
        self.boost_terms = ["vision 2050", "tanzania", "development strategy", "pillar"]

class RAGProcessor:
    def __init__(self, config: RetrievalConfig):
        self.config = config
        self.headers = {
            "Authorization": f"Bearer {PAWA_API_KEY}",
            "Content-Type": "application/json"
        }
    
    async def enhance_query(self, query: str) -> str:
        enhanced_query = query
        
        if not any(keyword.lower() in query.lower() for keyword in ["tanzania", "vision", "2050"]):
            enhanced_query = f"Tanzania Vision 2050: {query}"
        
        return enhanced_query

    async def retrieve_knowledge(self, query: str) -> List[Dict[str, Any]]:
        try:
            enhanced_query = await self.enhance_query(query)
            query_embedding = await self._get_query_embedding(enhanced_query)
            
            if not query_embedding:
                return []
            
            chunks = self._load_local_chunks()
            if not chunks:
                return []
            
            similarities = self._calculate_similarities(query_embedding, chunks)
            return self._filter_and_sort_results(similarities)
            
        except Exception as e:
            logger.error(f"Knowledge retrieval error: {str(e)}")
            return []
    
    async def _get_query_embedding(self, query: str) -> Optional[List[float]]:
        embedding_payload = {
            "model": PAWA_EMBEDDING_MODEL,
            "lang": "multi",
            "sentences": [query]
        }
        
        try:
            response = requests.post(
                f"{PAWA_BASE_URL}/v1/vectors/embedding",
                json=embedding_payload,
                headers=self.headers
            )
            
            if response.status_code != 200:
                logger.error(f"PAWA Embedding API error: {response.text}")
                return None
                
            return response.json()["data"]["embeddings"][0]
        except Exception as e:
            logger.error(f"Embedding generation error: {str(e)}")
            return None
    
    def _load_local_chunks(self) -> List[Dict]:
        try:
            with open(f"data/{KNOWLEDGE_BASE_NAME}_chunks.json", "r") as f:
                kb_data = json.load(f)
                return kb_data["chunks"]
        except FileNotFoundError:
            logger.error("Knowledge base not found. Please run generate_kb.py first")
            return []
    
    def _calculate_similarities(self, query_embedding: List[float], chunks: List[Dict]) -> List[Dict]:
        similarities = []
        
        for chunk in chunks:
            chunk_embedding = chunk["embedding"]
            similarity = cosine_similarity([query_embedding], [chunk_embedding])[0][0]
            
            if similarity >= self.config.min_similarity:
                similarities.append({
                    "content": chunk["content"],
                    "page": chunk["page_number"],
                    "source": "Tanzania Vision 2050",
                    "similarity_score": float(similarity),
                    "section": chunk["section_title"],
                    "metadata": chunk["metadata"]
                })
        
        return similarities
    
    def _filter_and_sort_results(self, similarities: List[Dict]) -> List[Dict]:
        similarities.sort(key=lambda x: x["similarity_score"], reverse=True)
        return similarities[:self.config.max_chunks]

    def rerank_chunks(self, query: str, chunks: List[Dict]) -> List[Dict[str, Any]]:
        try:
            query_words = set(query.lower().split())
            
            for chunk in chunks:
                chunk["relevance_score"] = self._calculate_relevance_score(chunk, query_words)
            
            ranked_chunks = sorted(chunks, key=lambda x: x.get("relevance_score", 0), reverse=True)
            return ranked_chunks[:self.config.rerank_top_k]
            
        except Exception as e:
            logger.error(f"Re-ranking error: {str(e)}")
            return chunks[:self.config.rerank_top_k]
    
    def _calculate_relevance_score(self, chunk: Dict, query_words: set) -> float:
        text = chunk.get("content", "").lower()
        chunk_words = set(text.split())
        
        overlap = len(query_words.intersection(chunk_words))
        relevance = overlap / len(query_words) if query_words else 0
        
        for term in self.config.boost_terms:
            if term in text:
                relevance += 0.1
        
        return relevance

class ResponseFormatter:
    @staticmethod
    def format_context_for_llm(chunks: List[Dict], query: str) -> str:
        if not chunks:
            return "No relevant information found in the Tanzania Vision 2050 document."
        
        context_parts = ["=== RELEVANT INFORMATION FROM TANZANIA VISION 2050 ===\n"]
        
        for i, chunk in enumerate(chunks, 1):
            content = chunk.get("content", "")
            page = chunk.get("page", "Unknown")
            relevance = chunk.get("relevance_score", 0)
            
            context_parts.extend([
                f"[Source {i}] (Page {page}, Relevance: {relevance:.2f})",
                f"{content}\n"
            ])
        
        context_parts.append("=== END OF RETRIEVED INFORMATION ===\n")
        return "\n".join(context_parts)

    @staticmethod
    def create_rag_prompt(query: str, context: str) -> str:
        return f"""You are an expert assistant helping people understand Tanzania's Vision 2050 development strategy. 

INSTRUCTIONS:
1. Answer the user's question using ONLY the provided context from Tanzania Vision 2050
2. If the context doesn't contain relevant information, clearly state this
3. Provide specific references to sections/pages when possible
4. Be accurate and don't make assumptions beyond the provided context
5. If asked about implementation timelines, funding, or specific metrics, only cite what's explicitly mentioned
6. Maintain a helpful, professional tone

CONTEXT FROM TANZANIA VISION 2050:
{context}

USER QUESTION: {query}

RESPONSE: Please provide a comprehensive answer based on the retrieved information. If you reference specific information, mention which source it comes from."""

class ChatService:
    def __init__(self):
        self.processor = RAGProcessor(RetrievalConfig())
        self.formatter = ResponseFormatter()
        self.headers = {
            "Authorization": f"Bearer {PAWA_API_KEY}",
            "Content-Type": "application/json"
        }

    async def process_rag_request(self, query: str) -> RAGResponse:
        relevant_chunks = await self.processor.retrieve_knowledge(query)
        
        if not relevant_chunks:
            return RAGResponse(
                message="I couldn't find relevant information in the Tanzania Vision 2050 document to answer your question. Please try rephrasing your question or ask about specific aspects of Tanzania's development strategy.",
                sources=[],
                confidence_score=0.0
            )
        
        formatted_context = self.formatter.format_context_for_llm(relevant_chunks, query)
        rag_prompt = self.formatter.create_rag_prompt(query, formatted_context)
        
        assistant_message = await self._generate_response(rag_prompt)
        if not assistant_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate response from PAWA Chat API"
            )
        
        confidence_score = self._calculate_confidence_score(relevant_chunks)
        sources = self._prepare_sources(relevant_chunks)
        
        return RAGResponse(
            message=assistant_message,
            sources=sources,
            confidence_score=confidence_score
        )
    
    async def _generate_response(self, prompt: str) -> Optional[str]:
        chat_payload = {
            "model": PAWA_CHAT_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ],
            "temperature": 0.1,
            "max_tokens": 1000,
            "stream": False
        }
        
        try:
            response = requests.post(
                f"{PAWA_BASE_URL}/v1/chat/request",
                json=chat_payload,
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()["data"]["request"][0]["message"]["content"]
            else:
                logger.error(f"PAWA Chat API error: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Chat response generation error: {str(e)}")
            return None
    
    def _calculate_confidence_score(self, chunks: List[Dict]) -> float:
        if not chunks:
            return 0.0
        
        avg_relevance = sum(chunk.get("relevance_score", 0) for chunk in chunks) / len(chunks)
        return min(avg_relevance * 2, 1.0)
    
    def _prepare_sources(self, chunks: List[Dict]) -> List[Dict[str, Any]]:
        return [
            {
                "content": chunk.get("content", "")[:200] + "...",
                "page": chunk.get("page", "Unknown"),
                "relevance_score": chunk.get("relevance_score", 0),
                "source": chunk.get("source", "Tanzania Vision 2050")
            }
            for chunk in chunks
        ]

chat_service = ChatService()

@r.post("/", summary="RAG-powered Tanzania Vision 2050 Assistant", tags=["Chat"])
async def create_rag_chat_request(request: UserRequest = Depends(UserRequest.as_form)):
    try:
        if not request.message or len(request.message.strip()) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query must be at least 3 characters long"
            )
        
        query = request.message.strip()
        logger.info(f"Processing RAG query: {query}")
        
        return await chat_service.process_rag_request(query)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RAG processing error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your question about Tanzania Vision 2050"
        ) from e

@r.post("/stream", summary="Streaming RAG-powered Tanzania Vision 2050 Assistant", tags=["Chat"])
async def create_rag_chat_stream(request: UserRequest = Depends(UserRequest.as_form)):
    try:
        query = request.message.strip()
        retrieval_config = RetrievalConfig()
        processor = RAGProcessor(retrieval_config)
        
        relevant_chunks = await processor.retrieve_knowledge(query)
        
        if relevant_chunks:
            formatter = ResponseFormatter()
            formatted_context = formatter.format_context_for_llm(relevant_chunks, query)
            rag_prompt = formatter.create_rag_prompt(query, formatted_context)
            rag_request = UserRequest(message=rag_prompt)
        else:
            rag_request = UserRequest(message=f"I don't have specific information about: {query}. Please provide a general response about Tanzania Vision 2050.")
        
        stream = await pawa_chat_streaming(rag_request)
        return StreamingResponse(stream, media_type="text/event-stream")
        
    except Exception as e:
        logger.error(f"Streaming RAG error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your streaming request"
        ) from e

@r.get("/kb-stats", summary="Get knowledge base statistics", tags=["Knowledge Base"])
async def get_kb_stats():
    try:
        headers = {
            "Authorization": f"Bearer {PAWA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{PAWA_BASE_URL}/knowledge/info/{KNOWLEDGE_BASE_NAME}",
            headers=headers
        )
        
        if response.status_code == 200:
            kb_info = response.json()
            return {
                "knowledge_base": KNOWLEDGE_BASE_NAME,
                "status": "active",
                "document_count": kb_info.get("document_count", "Unknown"),
                "chunk_count": kb_info.get("chunk_count", "Unknown"),
                "last_updated": kb_info.get("last_updated", "Unknown")
            }
        else:
            return {
                "knowledge_base": KNOWLEDGE_BASE_NAME,
                "status": "unknown",
                "message": "Could not retrieve KB statistics"
            }
            
    except Exception as e:
        logger.error(f"KB stats error: {str(e)}")
        return {
            "knowledge_base": KNOWLEDGE_BASE_NAME,
            "status": "error",
            "message": str(e)
        }