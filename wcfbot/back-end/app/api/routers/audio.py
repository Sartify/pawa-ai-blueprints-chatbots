from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse, JSONResponse
from typing import List, Optional
import logging
from app.api.models.user_request import UserRequestTTS, TextToSpeechRequest
import httpx
import os
from dotenv import load_dotenv

load_dotenv()



audio_router = APIRouter()
logger = logging.getLogger("uvicorn")
logger.info("Running On Audio Routers....")

TTS_API_URL = os.getenv("TTS_API_URL")
AUTH = os.getenv("AUTH_KEY")
voice = os.getenv("VOICE")
tts_model =os.getenv("TTS_MODEL")
stt_model =os.getenv("STT_MODEL")
stt_temp =os.getenv("STT_TEMP")
max_tokens = os.getenv("TTS_MAX_TOKEN")
temperature = os.getenv("TTS_TEMP")
top_p = os.getenv("TTS_TOP_P")
repetition_penalty = os.getenv("REP_PENALTY")
SPEECH_TO_TEXT_API_URL = os.getenv("STT_API_URL")
AUTH_API_KEY =os.getenv("AUTH_KEY")
#print(AUTH_API_KEY)

@audio_router.post("/text-to-speech", tags=['Audio']) 
async def text_to_speech(req: TextToSpeechRequest):
    """
    Convert text to speech using external TTS service with streaming audio response.
    """
    payload = {
        "text": req.text,
        "voice": req.voice if hasattr(req, 'voice') else voice,
        "model": req.model if hasattr(req, 'model') else tts_model,
        "max_tokens": int(req.max_tokens) if hasattr(req, 'max_tokens') else int(max_tokens),  # Convert to int
        "temperature": float(req.temperature) if hasattr(req, 'temperature') else 0.5,
        "top_p": float(req.top_p) if hasattr(req, 'top_p') else 0.95,
        "repetition_penalty": float(req.repetition_penalty) if hasattr(req, 'repetition_penalty') else float(repetition_penalty)  # Convert to float
    }

    
    headers = {
        "accept": "audio/mpeg", 
        "Authorization": f"Bearer {AUTH_API_KEY}",
        "Content-Type": "application/json" 
    }

    #print(AUTH_API_KEY)

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(TTS_API_URL, json=payload, headers=headers)
            if response.status_code != 200:
                error_text = response.text
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"TTS service error: {response.status_code} - {error_text}"
                )
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="TTS service timeout")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    async def stream_tts():
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", TTS_API_URL, json=payload, headers=headers) as response:
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    yield chunk
                   
    return StreamingResponse(
        stream_tts(),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Disposition": "attachment; filename=generated_audio.mp3"
        }
    )






@audio_router.post("/speech-to-text", tags=['Audio'])
async def speech_to_text(model: str= Form("pawa-stt-v1-20240701"),language:str= Form("sw"), prompt: str= Form("Nipe maneno yaliyo kwenye hii audio"), temperature: str = Form(0.1),file: UploadFile = File(...)):
    try:
      
        file_content = await file.read()
         
        files = {
            "file": (file.filename, file_content, "audio/wav")
        }
        
        data = {
            "model": model,
            "language": language, 
            "prompt": prompt,
            "temperature": temperature
        }
        
     
        headers = {
            "Authorization": f"Bearer {AUTH_API_KEY}"
        }
        
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                SPEECH_TO_TEXT_API_URL,
                files=files,
                data=data,
                headers=headers,
                timeout=60
            )
            resp.raise_for_status()
            return JSONResponse(content=resp.json())
            
    except httpx.HTTPStatusError as e:
        return JSONResponse(
            status_code=502,
            content={
                "error": "STT service returned an error",
                "status_code": e.response.status_code,
                "details": e.response.text
            }
        )
    except Exception as ex:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error", 
                "details": str(ex)
            }
        )
    


