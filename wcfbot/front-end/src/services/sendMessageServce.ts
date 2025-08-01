import { MessageFile } from "@/types/Message";

export async function sendMessage({
  message,
  files,
  onChunk,
}: {
  message: string;
  files: MessageFile[];
  onChunk?: (chunk: string) => void;
}): Promise<Response> {
  const formData = new FormData();
  formData.append("text", message);

  files
    .filter((file): file is File => file instanceof File)
    .forEach((file) => {
      formData.append("file", file);
    });

  console.log("[SERVICE] Sending request to /api/chat");
  const response = await fetch("/api/chat", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error: ${response.status} - ${errorText}`);
  }

  console.log("[SERVICE] Response received, status:", response.status);

  if (onChunk) {
    console.log("[SERVICE] Starting streaming response handling");
    await handleStreamingResponse(response, onChunk);
  }

  return response;
}

async function handleStreamingResponse(
  response: Response,
  onChunk: (chunk: string) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let chunkCount = 0;

  console.log("[SERVICE STREAM] Starting to read chunks from response...");

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("[SERVICE STREAM] Stream finished, total chunks processed:", chunkCount);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      console.log("[SERVICE STREAM] Raw chunk received:", chunk);

      buffer += chunk;

      // Process complete lines (each line is a JSON object)
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // Skip empty lines

        console.log("[SERVICE STREAM] Processing line:", trimmedLine);
        
        try {
          const parsed = JSON.parse(trimmedLine);
          
          if (parsed.message && parsed.message.content) {
            const content = parsed.message.content;
            chunkCount++;
            console.log(`[SERVICE STREAM] Chunk ${chunkCount} content:`, JSON.stringify(content));
            
            onChunk(content);
          } else {
            console.log("[SERVICE STREAM] Skipping line - no message.content:", parsed);
          }
        } catch (parseError) {
          console.warn("[SERVICE STREAM] Failed to parse line:", trimmedLine, parseError);
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      console.log("[SERVICE STREAM] Processing remaining buffer:", buffer.trim());
      try {
        const parsed = JSON.parse(buffer.trim());
        if (parsed.message && parsed.message.content) {
          const content = parsed.message.content;
          chunkCount++;
          console.log(`[SERVICE STREAM] Final chunk ${chunkCount} content:`, JSON.stringify(content));
          onChunk(content);
        }
      } catch (parseError) {
        console.warn("[SERVICE STREAM] Failed to parse buffer:", buffer.trim(), parseError);
      }
    }

  } finally {
    reader.releaseLock();
    console.log("[SERVICE STREAM] Stream processing completed, total chunks:", chunkCount);
  }
}