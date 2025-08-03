from fastapi import FastAPI, HTTPException, status
from app.api.models.user_request import UserRequest
from app.utils.format_message import msg_to_pawa_chat
import yaml
import httpx
import os
<<<<<<< HEAD
import json
from typing import AsyncGenerator, Union, List, Optional
from fastapi import File, UploadFile
from app.utils.format_memory import format_message
from app.utils.tool_excuter import handle_tool_calls
=======
from typing import AsyncGenerator, Union
from fastapi import HTTPException, status
import httpx
import json
from typing import List, Optional
from fastapi import File, UploadFile
from app.utils.format_memory import format_message
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
from dotenv import load_dotenv
load_dotenv(override=True)

with open("app/engine/config.yaml", "r") as file:
    config = yaml.safe_load(file)

BASE_UL = config["Chat"]["Base_URL"]
ENDPOINT = config["Chat"]["Endpoint"]
url = f"{BASE_UL}{ENDPOINT}"
MEMORY_PATH = "app/engine/memory.json"

<<<<<<< HEAD

async def inference_pawa_chat_stream(complete_message: dict, request: UserRequest) -> AsyncGenerator[str, None]:
=======
async def inference_pawa_chat_stream(complete_message: dict,  request:UserRequest) -> AsyncGenerator[str, None]:
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
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
                
<<<<<<< HEAD
                complete_response_message = ""
                tool_calls = []
                
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line.strip())
                            
                            # Handle different response structures
                            if 'data' not in data:
                                print(f"Unexpected response structure: {data}")
                                continue
                                
                            if not data['data'].get('request'):
                                print(f"No request data: {data}")
                                continue
                                
                            finish_reason = data['data']['request'][0]['finish_reason']
                            
                            if finish_reason == "tool_calls":
                                # Handle tool calls
                                tool_calls = data['data']['request'][0]['message'].get('tool_calls', [])
                                if tool_calls:
                                    print(f"Processing tool calls: {tool_calls}")
                                    
                                    # Execute tools and make follow-up request
                                    updated_message = await handle_tool_calls(tool_calls, complete_message)
                                    
                                    # Make a new streaming request with tool results
                                    async with client.stream(
                                        "POST",
                                        url=url,
                                        json=updated_message,
                                        headers={
                                            "Content-Type": "application/json",
                                            "Authorization": f"Bearer {os.getenv('PAWA_AI_API_KEY')}"
                                        }
                                    ) as tool_response:
                                        async for tool_line in tool_response.aiter_lines():
                                            if tool_line.strip():
                                                try:
                                                    tool_data = json.loads(tool_line.strip())
                                                    
                                                    # Check if tool_response has expected structure
                                                    if 'data' not in tool_data:
                                                        print(f"Tool response missing data: {tool_data}")
                                                        continue
                                                        
                                                    if not tool_data['data'].get('request'):
                                                        print(f"Tool response missing request: {tool_data}")
                                                        continue
                                                    
                                                    if tool_data['data']['request'][0]['finish_reason'] != "tool_calls":
                                                        content = tool_data['data']['request'][0]['message']['content']
                                                        complete_response_message += content
                                                        yield json.dumps({
                                                            "message": {
                                                                "role": "assistant",
                                                                "content": content
                                                            }
                                                        }) + "\n"
                                                except json.JSONDecodeError as e:
                                                    print(f"JSON decode error in tool response: {e}")
                                                    continue
                                                except KeyError as e:
                                                    print(f"KeyError in tool response: {e}, data: {tool_data}")
                                                    continue
                                continue
                            else:
                                content = data['data']['request'][0]['message']['content']
                                complete_response_message += content
                                yield json.dumps({
                                    "message": {
                                        "role": "assistant",
                                        "content": content
                                    }
                                }) + "\n"
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error: {e}, line: {line}")
                            continue
                        except KeyError as e:
                            print(f"KeyError: {e}, data: {data}")
                            continue
                        except Exception as e:
                            print(f"Unexpected error: {e}, data: {data}")
                            continue
                
                # Save to memory
                from_assistant = complete_response_message
                from_user = request.message
                user_entry = format_message("user", from_user)
                assistant_entry = format_message("assistant", from_assistant)
=======
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
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
                
                try:
                    if os.path.exists(MEMORY_PATH):
                        with open(MEMORY_PATH, "r", encoding="utf-8") as f:
                            memory_data = json.load(f)
                    else:
<<<<<<< HEAD
                        memory_data = []
=======
                            memory_data = []
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
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

<<<<<<< HEAD
async def inference_pawa_chat_non_stream(complete_message: dict, request: UserRequest) -> dict:
=======
async def inference_pawa_chat_non_stream(complete_message: dict, request:UserRequest) -> dict:
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
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
<<<<<<< HEAD
    
    # Check if response contains tool calls
    finish_reason = response_json['data']['request'][0]['finish_reason']
    
    if finish_reason == "tool_calls":
        tool_calls = response_json['data']['request'][0]['message'].get('tool_calls', [])
        if tool_calls:
            print(f"Processing tool calls: {tool_calls}")
            
            # Execute tools and make follow-up request
            updated_message = await handle_tool_calls(tool_calls, complete_message)
            print(f"Updated message with tools: {json.dumps(updated_message, indent=2)}")
            
            # Make another request with tool results
            try:
                async with httpx.AsyncClient(timeout=300) as client:
                    tool_response = await client.post(
                        url=url,
                        json=updated_message,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {os.getenv('PAWA_AI_API_KEY')}"
                        }
                    )
                tool_response_json = tool_response.json()
                
                if tool_response.status_code == 200:
                    response_json = tool_response_json  # Use the tool response as final response
                else:
                    print(f"Tool response error: {tool_response_json}")
                    
            except Exception as e:
                print(f"Error in tool follow-up request: {e}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Failed to process tool calls: {str(e)}"
                )
    
    from_assistant = response_json['data']['request'][0]['message']['content']
    from_user = request.message

    user_entry = format_message("user", from_user)
    assistant_entry = format_message("assistant", from_assistant)
=======
        
    from_assitant=response_json['data']['request'][0]['message']['content']
    from_user=request.message

    user_entry = format_message("user", from_user)
    assistant_entry = format_message("assistant", from_assitant)
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
    
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
<<<<<<< HEAD
        # print("Request payload:", json.dumps(complete_message, indent=2))
        response = await inference_pawa_chat_non_stream(complete_message, request)
        return response
    except Exception as e:
        print(f"Error in pawa_chat_non_streaming: {e}")
        raise HTTPException(
=======
        print(complete_message)
        response = await inference_pawa_chat_non_stream(complete_message, request)
        return response
    except Exception as e:
        raise HTTPException(
            print(f"Error in pawa_chat_non_streaming: {e}"), 
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
            status_code=500,
            detail="An error occurred while processing a non streaming request"
        ) from e

async def pawa_chat_streaming(request: UserRequest, files: Optional[List[UploadFile]] = None):
    try:
        complete_message = await msg_to_pawa_chat(request, files, is_streaming=True)
<<<<<<< HEAD
        # print("Streaming request payload:", json.dumps(complete_message, indent=2))
=======
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
        return inference_pawa_chat_stream(complete_message, request) 
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing a streaming request"
<<<<<<< HEAD
        ) from e
=======
        ) from e

>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f
