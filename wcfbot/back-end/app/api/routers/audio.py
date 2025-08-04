from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse, JSONResponse
import logging
from app.api.models.user_request import TextToSpeechRequest
import httpx
import os
from dotenv import load_dotenv

load_dotenv()



audio_router = APIRouter()
logger = logging.getLogger("uvicorn")
logger.info("Running On Audio Routers....")


TTS_API_URL = os.getenv("TTS_API_URL")
voice = os.getenv("VOICE")
tts_model =os.getenv("TTS_MODEL")
max_tokens = int(os.getenv("TTS_MAX_TOKEN"))
temperature = float(os.getenv("TTS_TEMP"))
top_p = float(os.getenv("TTS_TOP_P"))
repetition_penalty = float(os.getenv("REP_PENALTY"))
SPEECH_TO_TEXT_API_URL = os.getenv("STT_API_URL")

@audio_router.post("/v1/audio/text-to-speech", tags=['Audio'])
async def text_to_speech(req: TextToSpeechRequest):
    """
    Streams audio from TTS API directly to client
    """
    payload = {
        "text": req.text,
        "voice": voice,
        "model": tts_model,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
        "repetition_penalty": repetition_penalty
    }
    headers = {
        "Authorization": f"Bearer {os.getenv('PAWA_AI_API_KEY')}"
    }

    async def audio_stream():
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                async with client.stream("POST", TTS_API_URL, json=payload, headers=headers) as response:
                    if response.status_code != 200:
                        body = await response.aread()
                        raise HTTPException(
                            status_code=response.status_code,
                            detail=f"TTS service error: {response.status_code} - {body.decode()}"
                        )
                    async for chunk in response.aiter_bytes():
                        yield chunk
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail="TTS service timeout")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    return StreamingResponse(
        audio_stream(),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )


@audio_router.post("/v1/audio/speech-to-text", tags=['Audio'])
async def speech_to_text(

    prompt: str = Form(...),
    model: str = Form(...),
    language: str = Form(...),
    temp: float = Form(...),
    resp_format: str = Form(...),
    file: UploadFile = File(...)
):
    
    form_data = {
        "model": (None, model),
        "language": (None, language),
        "prompt": (None, prompt),
        "temperature": (None, str(temp)),
        "response_format": (None, resp_format),
        "file": (file.filename, await file.read(), file.content_type)
    }
    
    headers = {
        "Authorization": f"Bearer {os.getenv('PAWA_AI_API_KEY')}"
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                SPEECH_TO_TEXT_API_URL,
                files=form_data,
                timeout=60,
                headers=headers
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

