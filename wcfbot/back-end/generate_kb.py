import os
import json
import httpx
import base64
import json
import httpx
import asyncio
from fastapi import HTTPException, status
import yaml
from dotenv import load_dotenv
load_dotenv(override=True)

with open("app/engine/config.yaml", "r") as file:
    config = yaml.safe_load(file)

BASE_UL = config["STORE"]["Base_URL"]
ENDPOINT = config["STORE"]["Endpoint"]
FOLDER_PATH = config["STORE"]["FOLDER_PATH"]
KB_NAME = config["STORE"]["Name"]
KB_DESCRIPTION = config["STORE"]["Description"]
url = f"{BASE_UL}{ENDPOINT}"

async def send_documents():
    files_to_upload = []

    for filename in os.listdir(FOLDER_PATH):
        filepath = os.path.join(FOLDER_PATH, filename)
        if os.path.isfile(filepath):
            files_to_upload.append(("knowledgeBase", (filename, open(filepath, "rb"))))

    data = {
        "name": KB_NAME,
        "description": KB_DESCRIPTION,
    }

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(url=url, 
                                         headers={
                                             "accept": "application/json",
                                             "Authorization": f"Bearer {os.getenv('PAWA_AI_API_KEY')}"}, 
                                         data=data, 
                                         files=files_to_upload)
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
    print("Documents uploaded successfully:", response_json)
    
if __name__ == "__main__":
    asyncio.run(send_documents())
