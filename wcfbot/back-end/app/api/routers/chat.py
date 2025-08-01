from fastapi import APIRouter
import logging
import os
from app.api.models.user_request import UserRequest, UserResponse
from fastapi import HTTPException, status, Depends
from app.engine import pawa_chat_non_streaming, pawa_chat_streaming
from fastapi.responses import StreamingResponse
from typing import List, Optional
from fastapi import File, UploadFile
from dotenv import load_dotenv
load_dotenv(override=True)

chat_router = r = APIRouter()
logger = logging.getLogger("uvicorn")
logger.info("Running On Chat Routers....")

@r.post("/", summary="Generate text from user with Pawa AI", tags=["Chat"])
async def create_chat_request_non_stream(
          request: UserRequest = Depends(UserRequest.as_form),  
          files: Optional[List[UploadFile]] = File(None) 
    ):
    
    try:
        if files:
            if len(files) > 3:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You can only upload up to 3 files."
                )
                
            for file in files:
                if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "audio/mp3", "audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav", "audio/x-pn-wav", "image/png", "image/jpg", "image/jpeg"]:
                    raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Unsupported file type: {file.content_type} for file {file.filename}. Supported types are: pdf, docx, txt, mp3, wav, png, jpg, jpeg."
                        )
                
            if file.size > 5 * 1024 * 1024:
                raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"File {file.filename} is too large. Maximum size is 5MB."
                        )
                
        response = await pawa_chat_non_streaming(request, files=files)        
        assistance_message= response["data"]["request"][0]["message"]
        return UserResponse(message=assistance_message)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occured in non stream chat") from e

@r.post("/stream", summary="Generate streaming text from user with Pawa AI", tags=["Chats"])
async def create_chat_request_stream(
          request: UserRequest = Depends(UserRequest.as_form),  
          files: Optional[List[UploadFile]] = File(None) 
    ): 
    try:
        if files:
            if len(files) > 3:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You can only upload up to 3 files."
                )
                
            for file in files:
                if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "audio/mp3", "audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav", "audio/x-pn-wav", "image/png", "image/jpg", "image/jpeg"]:
                    raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Unsupported file type: {file.content_type} for file {file.filename}. Supported types are: pdf, docx, txt, mp3, wav, png, jpg, jpeg."
                        )
                    
            if file.size > 5 * 1024 * 1024:
                raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"File {file.filename} is too large. Maximum size is 5MB."
                        )
            
        stream = await pawa_chat_streaming(request, files=files)
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request."
        ) from e

