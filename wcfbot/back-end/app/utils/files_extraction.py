import httpx
from fastapi import UploadFile, HTTPException, status
from typing import List
import yaml
from dotenv import load_dotenv
load_dotenv(override=True)

with open("app/engine/config.yaml", "r") as file:
    config = yaml.safe_load(file)

BASE_UL = config["Extraction"]["Base_URL"]
ENDPOINT = config["Extraction"]["Endpoint"]
EXTRACTION_URL= f"{BASE_UL}{ENDPOINT}"

async def send_files_to_extraction_server(files: List[UploadFile]) -> dict:
    multipart_files = []
    try:
        for file in files:
            content = await file.read()
            multipart_files.append(
                ("files", (file.filename, content, file.content_type))
            )
            file.file.seek(0)  
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process uploaded files."
        )

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                EXTRACTION_URL,
                files=multipart_files,
                headers={"accept": "application/json"}
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to connect to the extraction server."
        )

    try:
        response_json = response.json()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid JSON returned from the extraction server."
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response_json.get("detail", "An error occurred during file extraction.")
        )

    return response_json
