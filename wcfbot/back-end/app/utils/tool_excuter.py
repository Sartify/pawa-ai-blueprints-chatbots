"""
Tool execution handler for Pawa AI chat system
"""
import json
from app.utils.tools import get_current_datetime

AVAILABLE_TOOLS = {
    "get_current_datetime": get_current_datetime
}

async def execute_tool_call(tool_name: str, parameters: dict) -> dict:
    """Execute a tool call and return the result"""
    if tool_name not in AVAILABLE_TOOLS:
        return {"error": f"Tool '{tool_name}' not found"}
    
    try:
        tool_function = AVAILABLE_TOOLS[tool_name]
        
        if isinstance(parameters, str):
            try:
                parameters = json.loads(parameters) if parameters else {}
            except json.JSONDecodeError:
                parameters = {}
        elif not parameters:
            parameters = {}
            
        result = tool_function(**parameters)
        return {"success": True, "result": result}
    except Exception as e:
        return {"error": f"Error executing tool '{tool_name}': {str(e)}"}

async def handle_tool_calls(tool_calls: list, complete_message: dict) -> dict:
    """Handle tool calls and create a follow-up request"""
    tool_results = []
    
    for i, tool_call in enumerate(tool_calls):
        tool_name = tool_call.get("function", {}).get("name")
        parameters = tool_call.get("function", {}).get("arguments", {})
        
        tool_call_id = tool_call.get("id", f"call_{i}_{tool_name}")
        
        tool_call["id"] = tool_call_id
        
        if isinstance(parameters, str):
            try:
                parameters = json.loads(parameters) if parameters else {}
            except json.JSONDecodeError:
                parameters = {}
        
        result = await execute_tool_call(tool_name, parameters)
        
        tool_results.append({
            "role": "tool",
            "tool_call_id": tool_call_id,
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(result)
                }
            ]
        })

    complete_message["messages"].append({
        "role": "assistant",
        "content": [
            {
                "type": "text", 
                "text": ""
            }
        ],
        "tool_calls": tool_calls
    })
    
    complete_message["messages"].extend(tool_results)
    
    return complete_message