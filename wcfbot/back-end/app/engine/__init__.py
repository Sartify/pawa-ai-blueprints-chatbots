from fastapi import FastAPI, HTTPException, status
from app.api.models.user_request import UserRequest
from app.utils.format_message import msg_to_pawa_chat
import yaml
import httpx
import os
from typing import AsyncGenerator, Union
from fastapi import HTTPException, status
import httpx
import json
from typing import List, Optional
from fastapi import File, UploadFile
from app.utils.format_memory import format_message
from dotenv import load_dotenv
load_dotenv(override=True)

with open("app/engine/config.yaml", "r") as file:
    config = yaml.safe_load(file)

BASE_UL = config["Chat"]["Base_URL"]
ENDPOINT = config["Chat"]["Endpoint"]
url = f"{BASE_UL}{ENDPOINT}"
MEMORY_PATH = "app/engine/memory.json"

async def inference_pawa_chat_stream(complete_message: dict,  request:UserRequest) -> AsyncGenerator[str, None]:
    try:
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST",
                url=url,
                json=complete_message,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {os.getenv('PAWA_AI_API_KEY')}"
                }
            ) as response:

                if response.status_code != 200:
                    body = await response.aread()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=body.decode() or "Streaming failed"
                    )
                
                complete_message = ""
                async for line in response.aiter_lines():
                    if line.strip():
                        data = json.loads(line.strip())
                        if data['data']['request'][0]['finish_reason']=="tool_calls":
                            print("Tool calls detected, skipping...")
                            continue
                            
                        else:
                            content = data['data']['request'][0]['message']['content']
                            complete_message += content
                            yield json.dumps({
                            "message": {
                                "role": "assistant",
                                "content": content
                            }
                        }) + "\n"
                            
                from_assitant= complete_message
                from_user=request.message
                user_entry = format_message("user", from_user)
                assistant_entry = format_message("assistant", from_assitant)
                
                try:
                    if os.path.exists(MEMORY_PATH):
                        with open(MEMORY_PATH, "r", encoding="utf-8") as f:
                            memory_data = json.load(f)
                    else:
                            memory_data = []
                except Exception:
                    memory_data = []
                
                memory_data.extend([user_entry, assistant_entry])
                
                with open(MEMORY_PATH, "w", encoding="utf-8") as f:
                    json.dump(memory_data, f, ensure_ascii=False, indent=2)

    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to connect to the Pawa AI backend."
        )

async def inference_pawa_chat_non_stream(complete_message: dict, request:UserRequest) -> dict:
    try:
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                url=url,
                json=complete_message,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {os.getenv('PAWA_AI_API_KEY')}"
                }
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to connect to the Pawa AI backend."
        )

    try:
        response_json = response.json()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid JSON returned from Pawa AI"
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response_json.get("detail", "An error occurred")
        )
        
    from_assitant=response_json['data']['request'][0]['message']['content']
    from_user=request.message

    user_entry = format_message("user", from_user)
    assistant_entry = format_message("assistant", from_assitant)
    
    try:
        if os.path.exists(MEMORY_PATH):
            with open(MEMORY_PATH, "r", encoding="utf-8") as f:
                memory_data = json.load(f)
        else:
            memory_data = []
    except Exception:
        memory_data = []

    memory_data.extend([user_entry, assistant_entry])

    with open(MEMORY_PATH, "w", encoding="utf-8") as f:
        json.dump(memory_data, f, ensure_ascii=False, indent=2)
    
    return response_json

async def pawa_chat_non_streaming(request: UserRequest, files: Optional[List[UploadFile]] = None) -> dict:
    try:
        complete_message = await msg_to_pawa_chat(request, files, is_streaming=False)
        print(complete_message)
        response = await inference_pawa_chat_non_stream(complete_message, request)
        return response
    except Exception as e:
        raise HTTPException(
            print(f"Error in pawa_chat_non_streaming: {e}"), 
            status_code=500,
            detail="An error occurred while processing a non streaming request"
        ) from e

async def pawa_chat_streaming(request: UserRequest, files: Optional[List[UploadFile]] = None):
    try:
        complete_message = await msg_to_pawa_chat(request, files, is_streaming=True)
        return inference_pawa_chat_stream(complete_message, request) 
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing a streaming request"
        ) from e

