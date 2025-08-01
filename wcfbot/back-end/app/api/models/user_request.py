from pydantic import BaseModel, Field
from typing import Literal, Optional, Union
from fastapi import Form

class UserRequest(BaseModel):
    message: str = Field(..., 
                         example="mambo wewe nani?", 
                         description="The message sent by the user to the chatbot."       
                         )
    @classmethod
    def as_form(
        cls,
        message: str = Form(...)
    ) -> "UserRequest":
        return cls(message=message)
    
class AssistantMessage(BaseModel):
    role: str
    content: str

class UserResponse(BaseModel):
    message: AssistantMessage
    
class UserRequestTTS(BaseModel):
    message: str = Field(..., 
                         example="Habari yako?", 
                         description="The message sent by the user to the chatbot for text-to-speech conversion."
                         )


class TextToSpeechRequest(BaseModel):
    text: str