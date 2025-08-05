import os
import requests
import PyPDF2
import logging
import json
import re
from typing import List, Dict, Any
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv(override=True)

PAWA_API_KEY = os.getenv("PAWA_API_KEY")
PAWA_BASE_URL = os.getenv("PAWA_BASE_URL", "https://staging.api.pawa-ai.com")
PAWA_EMBEDDING_MODEL = os.getenv("PAWA_EMBEDDING_MODEL", "pawa-embedding-v1-20240701")
KNOWLEDGE_BASE_NAME = "tanzania_vision_2050"

@dataclass
class DocumentChunk:
    content: str
    page_number: int
    chunk_id: str
    metadata: Dict[str, Any]
    section_title: str = ""

class TanzaniaVision2050Processor:
    def __init__(self):
        self.chunk_size = 800
        self.chunk_overlap = 150
        self.min_chunk_size = 100
        self.section_patterns = [
            r"PILLAR\s+[IVX]+",
            r"CHAPTER\s+\d+",
            r"SECTION\s+\d+",
            r"\d+\.\d+\s+[A-Z]",
            r"VISION\s+2050",
            r"DEVELOPMENT\s+STRATEGY"
        ]
        self.theme_keywords = {
            "ECONOMIC": ["ECONOMIC", "GDP", "GROWTH", "INDUSTRY", "MANUFACTURING"],
            "SOCIAL": ["EDUCATION", "HEALTH", "SOCIAL", "HUMAN DEVELOPMENT"],
            "INFRASTRUCTURE": ["INFRASTRUCTURE", "TRANSPORT", "ENERGY", "POWER"],
            "GOVERNANCE": ["GOVERNANCE", "INSTITUTIONS", "DEMOCRACY", "RULE OF LAW"],
            "ENVIRONMENT": ["ENVIRONMENT", "CLIMATE", "NATURAL RESOURCES", "SUSTAINABILITY"]
        }
    
    def extract_text_from_pdf(self, pdf_path: str) -> List[Dict[str, Any]]:
        pages_content = []
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                cleaned_text = self._clean_text(text)
                
                if len(cleaned_text.strip()) > 50:
                    pages_content.append({
                        "page_number": page_num,
                        "content": cleaned_text,
                        "raw_text": text
                    })
                        
        return pages_content
    
    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'Page \d+ of \d+', '', text)
        text = re.sub(r'Tanzania Vision 2050', '', text)
        text = text.replace('|', 'I').replace('"', '"').replace('"', '"')
        text = text.replace(''', "'").replace(''', "'")
        
        return text.strip()
    
    def _identify_section(self, text: str) -> str:
        text_upper = text.upper()
        
        for pattern in self.section_patterns:
            match = re.search(pattern, text_upper)
            if match:
                return match.group(0)
        
        for theme, keywords in self.theme_keywords.items():
            if any(keyword in text_upper for keyword in keywords):
                return f"PILLAR: {theme}"
        
        return "GENERAL"
    
    def create_smart_chunks(self, pages_content: List[Dict[str, Any]]) -> List[DocumentChunk]:
        chunks = []
        chunk_counter = 0
        
        for page_data in pages_content:
            page_text = page_data["content"]
            page_num = page_data["page_number"]
            paragraphs = [p.strip() for p in page_text.split('\n\n') if p.strip()]
            
            current_chunk = ""
            current_section = self._identify_section(page_text)
            
            for paragraph in paragraphs:
                potential_chunk = current_chunk + "\n\n" + paragraph if current_chunk else paragraph
                
                if len(potential_chunk) <= self.chunk_size:
                    current_chunk = potential_chunk
                else:
                    if len(current_chunk) >= self.min_chunk_size:
                        chunk_counter += 1
                        chunks.append(self._create_chunk(current_chunk, page_num, chunk_counter, current_section))
                    
                    if len(current_chunk) > self.chunk_overlap:
                        overlap_text = current_chunk[-self.chunk_overlap:]
                        current_chunk = overlap_text + "\n\n" + paragraph
                    else:
                        current_chunk = paragraph
            
            if len(current_chunk) >= self.min_chunk_size:
                chunk_counter += 1
                chunks.append(self._create_chunk(current_chunk, page_num, chunk_counter, current_section))
        
        return chunks
    
    def _create_chunk(self, content: str, page_num: int, chunk_counter: int, section: str) -> DocumentChunk:
        return DocumentChunk(
            content=content,
            page_number=page_num,
            chunk_id=f"tz_vision_2050_chunk_{chunk_counter:04d}",
            section_title=section,
            metadata={
                "document": "Tanzania Vision 2050",
                "page": page_num,
                "section": section,
                "chunk_size": len(content),
                "language": "english"
            }
        )
    
    def upload_to_pawa_kb(self, chunks: List[DocumentChunk]) -> bool:
        try:
            kb_reference_id = self._create_knowledge_base()
            if not kb_reference_id:
                return False
                
            self._store_chunks_with_embeddings(chunks, kb_reference_id)
            return True
                
        except Exception as e:
            logging.error(f"Upload error: {str(e)}")
            return False
    
    def _create_knowledge_base(self) -> str:
        headers = {
            "Authorization": f"Bearer {PAWA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        kb_payload = {
            "name": KNOWLEDGE_BASE_NAME,
            "description": "Tanzania Vision 2050 Development Strategy Document - Comprehensive national development plan for Tanzania through 2050"
        }
        
        response = requests.post(
            f"{PAWA_BASE_URL}/v1/store/knowledge-base",
            json=kb_payload,
            headers=headers
        )
        
        if response.status_code in [200, 201]:
            kb_data = response.json()
            kb_reference_id = kb_data["data"]["kbReferenceId"]
            logging.info(f"Knowledge base created: {kb_reference_id}")
            return kb_reference_id
        else:
            logging.error(f"Knowledge base creation failed: {response.text}")
            return None
    
    def _store_chunks_with_embeddings(self, chunks: List[DocumentChunk], kb_id: str):
        chunk_data = []
        headers = {
            "Authorization": f"Bearer {PAWA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        for chunk in chunks:
            embedding_payload = {
                "model": PAWA_EMBEDDING_MODEL,
                "lang": "multi",
                "sentences": [chunk.content]
            }
            
            try:
                response = requests.post(
                    f"{PAWA_BASE_URL}/v1/vectors/embedding",
                    json=embedding_payload,
                    headers=headers
                )
                
                if response.status_code == 200:
                    embedding = response.json()["data"]["embeddings"][0]
                    chunk_data.append({
                        "id": chunk.chunk_id,
                        "content": chunk.content,
                        "embedding": embedding,
                        "metadata": chunk.metadata,
                        "page_number": chunk.page_number,
                        "section_title": chunk.section_title
                    })
                    
            except Exception as e:
                logging.error(f"Failed to create embedding for chunk {chunk.chunk_id}: {str(e)}")
        
        os.makedirs("data", exist_ok=True)
        with open(f"data/{KNOWLEDGE_BASE_NAME}_chunks.json", "w") as f:
            json.dump({
                "kb_id": kb_id,
                "chunks": chunk_data,
                "total_chunks": len(chunk_data)
            }, f, indent=2)
        
        logging.info(f"Stored {len(chunk_data)} chunks locally with embeddings")

def main():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    pdf_path = "documents/tanzania_vision_2050.pdf"
    
    if not os.path.exists(pdf_path):
        logger.error(f"PDF file not found: {pdf_path}")
        logger.info("Please ensure your Tanzania Vision 2050 PDF is in the documents/ folder")
        return
    
    try:
        processor = TanzaniaVision2050Processor()
        
        logger.info("Extracting text from Tanzania Vision 2050 PDF...")
        pages_content = processor.extract_text_from_pdf(pdf_path)
        logger.info(f"Extracted content from {len(pages_content)} pages")
        
        logger.info("Creating intelligent document chunks...")
        chunks = processor.create_smart_chunks(pages_content)
        logger.info(f"Created {len(chunks)} chunks")
        
        avg_chunk_size = sum(len(chunk.content) for chunk in chunks) / len(chunks)
        sections = set(chunk.section_title for chunk in chunks)
        
        logger.info(f"Chunk Statistics:")
        logger.info(f"  - Average chunk size: {avg_chunk_size:.0f} characters")
        logger.info(f"  - Sections identified: {', '.join(sections)}")
        
        logger.info("Uploading to PAWA knowledge base...")
        success = processor.upload_to_pawa_kb(chunks)
        
        if success:
            logger.info("✅ Tanzania Vision 2050 knowledge base created successfully!")
            logger.info(f"Knowledge base name: {KNOWLEDGE_BASE_NAME}")
            logger.info("Your RAG chatbot is ready to answer questions about Tanzania's development strategy!")
        else:
            logger.error("❌ Failed to upload knowledge base")
            
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")

if __name__ == "__main__":
    main()