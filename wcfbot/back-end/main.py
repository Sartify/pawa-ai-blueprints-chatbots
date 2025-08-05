import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError as ValidationError
import uvicorn
from dotenv import load_dotenv
from app.api.routers.chat import chat_router
from app.api.routers.audio import audio_router

load_dotenv(override=True)

logger = logging.getLogger("uvicorn")
logger.info("🇹🇿 Starting Tanzania Vision 2050 RAG Assistant Server")

app = FastAPI(
    title="Tanzania Vision 2050 Assistant",
    description="RAG-powered chatbot for understanding Tanzania's development strategy using PAWA AI",
    version="1.0.0"
)

@app.exception_handler(ValidationError)
async def handle_validation_error(request: Request, exc: ValidationError):
    errors = [{"field": err['loc'][0], "message": err['msg']} for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"details": errors},
    )
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Tanzania Vision 2050 Assistant",
        "pawa_ai_integration": "active"
    }

@app.get("/", include_in_schema=False)
async def redirect_to_docs():
    return RedirectResponse(url="/docs")

app.include_router(chat_router, prefix="/api/chat", tags=["Tanzania Vision 2050 Chat"])
app.include_router(audio_router, prefix="/api/audio", tags=["Audio"])

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8001"))
    
    logger.info(f" Starting server on {app_host}:{app_port}")
    logger.info("RAG system ready for Tanzania Vision 2050 queries")
    
    uvicorn.run(app="main:app", host=app_host, port=app_port, reload=True)