from app.api.models.user_request import UserRequest
import os
from typing import List, Optional
from fastapi import UploadFile
from app.utils.files_extraction import send_files_to_extraction_server
import yaml
from dotenv import load_dotenv
load_dotenv(override=True)
    
MEMORY_PATH = "app/engine/memory.json"
CONFIG = "app/engine/config.yaml"

def load_tools_from_config():
    """Load tools configuration from config.yaml"""
    try:
        with open(CONFIG, "r") as file:
            config = yaml.safe_load(file)
            tools = config.get("Tools", [])
            built_in_tools = config.get("BUILT_IN_TOOLS", [])
            
            # Convert built-in tools to proper format
            formatted_tools = []
            for tool in tools:
                formatted_tools.append(tool)
            
            # Add built-in pawa tools
            for built_in_tool in built_in_tools:
                formatted_tools.append({
                    "type": "pawa_tool",
                    "pawa_tool": built_in_tool["name"]
                })
            
            return formatted_tools
    except Exception as e:
        print(f"Error loading tools from config: {e}")
        return []

async def msg_to_pawa_chat(
    text: UserRequest,
    files: Optional[List[UploadFile]] = None,
    is_streaming: bool = False
) -> dict:
    """
    Converts a UserRequest message to the format required by the Pawa AI chat API.
    
    Args:
        text (UserRequest): The user request containing the message.
        files (Optional[List[UploadFile]]): Optional list of files to extract content from.
        is_streaming (bool): Whether the request is for streaming or not.
        
    Returns:
        dict: The formatted message ready for the Pawa AI chat API.
    """
    
    extraction_result_ = None
    if files:
        extraction_result_ = await send_files_to_extraction_server(files)
    
    user_message = text.message
    if extraction_result_ is not None:
        extraction_data_ = extraction_result_['data']
        if extraction_data_:
            document_contexts = []
            for doc in extraction_data_:
                filename = doc.get("filename")
                content = doc.get("content", "").strip()
            
                if filename and content:
                    document_contexts.append(f"---\nFilename: {filename}\nContent:\n{content}\n")

            if document_contexts:
                prepended_info = (
                    "Nimepakia nyaraka zifuatazo ambazo unaweza kutumia kujibu swali:\n\n"
                    + "\n".join(document_contexts)
                    + "\nTafadhali tumia taarifa hizi kujibu swali lifuatalo:\n\n"
                )
                user_message = prepended_info + user_message
    
    # Load memory if enabled
    memory_data = []
    if os.getenv("IS_MEMORY_ENABLED", "False").lower() == "true":
        if os.path.exists(MEMORY_PATH):
            try:
                with open(MEMORY_PATH, "r", encoding="utf-8") as file:
                    memory_data = yaml.safe_load(file) or []
            except Exception as e:
                print(f"Error loading memory: {e}")
                memory_data = []
    
    # Load tools from config
    tools = load_tools_from_config()
    
    # Base message structure
    message_structure = {
        "model": os.getenv("CHAT_MODEL"),
        "messages": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": os.getenv(
                            "PAWA_SYSTEM_PROMPT",
                           
                        ).replace("\\n", "\n")
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": user_message
                    }
                ]
            }
        ],
        "stream": is_streaming,
        "temperature": float(os.getenv("TEMPERATURE", 0.1)),
        "top_p": float(os.getenv("TOP_P", 0.95)),
        "tool_choice": os.getenv("TOOL_CHOICE", "auto"),
        "max_tokens": int(os.getenv("MAX_TOKENS", 4096)),
        "frequency_penalty": float(os.getenv("FREQUENCY_PENALTY", 0.3)),
        "presence_penalty": float(os.getenv("PRESENCE_PENALTY", 0.3)),
        "seed": int(os.getenv("SEED", 2024))
    }
    
    # Add tools if available
    if tools:
        message_structure["tools"] = tools
    
    # Add knowledge base if configured
    if os.getenv("KB_REFERENCE_ID") is not None:
        message_structure["knowledgeBase"] = {
            "kbReferenceId": os.getenv("KB_REFERENCE_ID"),
            **({"isMust": os.getenv("IS_MUST_USE_KB").lower() == "true"} 
               if os.getenv("IS_MUST_USE_KB") is not None else {})
        }
    
    # Add memory chat if enabled and available
    if memory_data and os.getenv("IS_MEMORY_ENABLED", "False").lower() == "true":
        message_structure["memoryChat"] = memory_data
    
    return message_structure
