import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log("=== CHAT API ROUTE START ===");
    console.log("......here is incoming POST");

    const contentType = req.headers.get("content-type") || "";
    console.log("......Headers:", { contentType });

    if (!contentType.includes("multipart/form-data")) {
      console.warn(".... incase of wrong Headers:", { contentType });
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const message = form.get("text") as string;
    const rawFiles = form.getAll("file") as File[];

    console.log("......Received form data:", {
      message: message,
      filesCount: rawFiles.length,
      fileNames: rawFiles.map(f => f.name)
    });

    if (!message) {
      console.log("......Error: No message provided");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const forwardForm = new FormData();
    forwardForm.append("message", message);
    rawFiles.forEach((file) => {
      forwardForm.append("file", file);
    });

    console.log("......Forwarding to external API with:", {
      message: message,
      filesCount: rawFiles.length,
      fileNames: rawFiles.map(f => f.name)
    });

    const apiUrl = `${process.env.API_BASE_URL}${process.env.API_CHAT_STREAM_ENDPOINT}`;
    console.log("......urllll:", apiUrl);
    console.log("......Environment variables:");
    console.log("......API_BASE_URL:", process.env.API_BASE_URL);
    console.log("......API_CHAT_STREAM_ENDPOINT:", process.env.API_CHAT_STREAM_ENDPOINT);
    console.log("......Sending request to external API...");

    // Log the FormData contents
    console.log("......FormData contents being sent:");
    for (const [key, value] of forwardForm.entries()) {
      if (value instanceof File) {
        console.log(`......  ${key}:`, {
          name: value.name,
          type: value.type,
          size: value.size
        });
      } else {
        console.log(`......  ${key}:`, value);
      }
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: forwardForm,
    });
    console.log("......Request sent successfully");

    console.log("......External API response status:", response.status);
    console.log("......External API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External API error: ${errorText}`);
      console.error(`External API error details: Status ${response.status}, URL: ${apiUrl}`);
      
      // Log more details about the error
      console.log("......Error analysis:");
      console.log("......  - Status code:", response.status);
      console.log("......  - Response type:", response.headers.get('content-type'));
      console.log("......  - Error text length:", errorText.length);
      console.log("......  - First 500 chars of error:", errorText.substring(0, 500));
      
      return NextResponse.json(
        { error: "Chat API request failed", details: errorText },
        { status: response.status }
      );
    }

    console.log("......External API request successful, processing response...");

    // Stream the response directly to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error("Response body is not readable"));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let chunkCount = 0;

        console.log("......Starting to stream response to client...");

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log("......Stream finished, total chunks processed:", chunkCount);
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            chunkCount++;
            console.log(`......Received chunk ${chunkCount} (length: ${chunk.length}):`, chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""));
            
            buffer += chunk;

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.message && parsed.message.content) {
                    // Send each chunk immediately
                    const chunkData = JSON.stringify({
                      message: {
                        role: "assistant",
                        content: parsed.message.content
                      }
                    });
                    controller.enqueue(new TextEncoder().encode(chunkData + "\n"));
                    console.log(`......Sent chunk to client: ${parsed.message.content}`);
                  }
                } catch (parseError) {
                  console.log("......Skipping invalid JSON chunk:", line);
                }
              }
            }
          }

          // Handle any remaining buffer
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer);
              if (parsed.message && parsed.message.content) {
                const chunkData = JSON.stringify({
                  message: {
                    role: "assistant",
                    content: parsed.message.content
                  }
                });
                controller.enqueue(new TextEncoder().encode(chunkData + "\n"));
                console.log(`......Sent final chunk to client: ${parsed.message.content}`);
              }
            } catch (parseError) {
              console.log("......Skipping invalid JSON in buffer:", buffer);
            }
          }
        } catch (error) {
          console.error("......Error in streaming:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
          controller.close();
          console.log("......Stream processing completed");
        }
      }
    });

    console.log("=== CHAT API ROUTE END ===");

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    console.error("=== CHAT API ROUTE ERROR ===");
    console.error("Error in chat API route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
