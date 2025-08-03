from typing import Dict, List, Optional
import os

def format_message(role: str, text: str) -> Dict:
    return {
        "role": role,
        "content": [
            {
                "type": "text",
                "text": text
            }
        ]
    }