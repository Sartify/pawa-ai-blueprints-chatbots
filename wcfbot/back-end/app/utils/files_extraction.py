import httpx
from fastapi import UploadFile, HTTPException, status
from typing import List, Optional
import yaml
import os
from dotenv import load_dotenv
load_dotenv(override=True)

with open("app/engine/config.yaml", "r") as file:
    config = yaml.safe_load(file)

BASE_UL = config["Extraction"]["Base_URL"]
ENDPOINT = config["Extraction"]["Endpoint"]
EXTRACTION_URL = f"{BASE_UL}{ENDPOINT}"

async def send_files_to_extraction_server(files: List[UploadFile]) -> Optional[dict]:
    """
    Send files to extraction server and return extracted content
    
    Args:
        files: List of uploaded files
        
    Returns:
        dict: Extraction response or None if no files
    """
    if not files:
        return None
    
    multipart_files = []
    
    try:
        for file in files:
            # Validate file before processing
            if not file.filename:
                continue
                
            # Check file size
            content = await file.read()
            if len(content) == 0:
                print(f"Warning: File {file.filename} is empty")
                continue
                
            print(f"Processing file: {file.filename}, size: {len(content)} bytes, type: {file.content_type}")
            
            multipart_files.append(
                ("files", (file.filename, content, file.content_type))
            )
            
            # Reset file pointer for potential re-reading
            await file.seek(0)
            
    except Exception as e:
        print(f"Error processing files: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process uploaded files: {str(e)}"
        )

    if not multipart_files:
        print("No valid files to process")
        return None

    try:
        print(f"Sending {len(multipart_files)} files to extraction server: {EXTRACTION_URL}")
        
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                EXTRACTION_URL,
                files=multipart_files,
                headers={
                    "accept": "application/json",
                    # Add API key if required
                    **({"Authorization": f"Bearer {os.getenv('EXTRACTION_API_KEY')}"} 
                       if os.getenv('EXTRACTION_API_KEY') else {})
                }
            )
            
        print(f"Extraction server response status: {response.status_code}")
        
    except httpx.RequestError as e:
        print(f"Request error to extraction server: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to the extraction server: {str(e)}"
        )
    except httpx.TimeoutException:
        print("Extraction request timed out")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Extraction server request timed out"
        )

    try:
        response_json = response.json()
        print(f"Extraction response: {response_json}")
        
    except ValueError as e:
        print(f"JSON decode error: {e}")
        print(f"Raw response: {response.text}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid JSON returned from the extraction server."
        )

    if response.status_code != 200:
        error_detail = response_json.get("detail", "An error occurred during file extraction.")
        print(f"Extraction server error: {error_detail}")
        raise HTTPException(
            status_code=response.status_code,
            detail=error_detail
        )

    # Validate response structure
    if not response_json.get("data"):
        print("Warning: No data in extraction response")
        return None
        
    return response_json

async def validate_extracted_content(extraction_result: dict) -> bool:
    """
    Validate that extraction result contains usable content
    
    Args:
        extraction_result: Result from extraction server
        
    Returns:
        bool: True if content is valid
    """
    if not extraction_result or not extraction_result.get("data"):
        return False
        
    data = extraction_result["data"]
    if not isinstance(data, list):
        return False
        
    # Check if at least one file has content
    for doc in data:
        if doc.get("content", "").strip():
            return True
            
    return False