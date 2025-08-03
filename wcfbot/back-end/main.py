import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError as ValidationError
import uvicorn
from app.api.routers.chat import chat_router
from app.api.routers.audio import audio_router
from dotenv import load_dotenv
load_dotenv(override=True)

logger = logging.getLogger("uvicorn")
logger.info("Running Pawa API BP Server For WCF")

app = FastAPI()
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
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
    allow_headers=["*"])

@app.get("/", include_in_schema=False)
async def redirect_to_docs():
    return RedirectResponse(url="/docs")

app.include_router(chat_router, prefix="/v1/chat")
app.include_router(audio_router, prefix="/v1/audio")

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8001"))
    uvicorn.run(app="main:app", host=app_host, port=app_port, reload=True)