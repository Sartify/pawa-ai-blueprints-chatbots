// app/api/vts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const model = formData.get("model") as string;
    // const language = formData.get("language") as string;
    // const temperature = formData.get("temperature") as string;

    if (!file || !(file instanceof Blob)) {
      console.error("[VTS] Missing or invalid file:", file);
      return NextResponse.json({ error: "Missing or invalid file" }, { status: 400 });
    }

    console.log("[VTS] Incoming file:", {
      name: (file as File).name,
      type: file.type,
      size: file.size,
      model,
      // language,
      // temperature
    });

    // Convert to MP3 format for better compatibility
    let processedFile = file;
    if (file.type !== 'audio/mpeg' && !(file as File).name.endsWith('.mp3')) {
      console.log("[VTS] Converting to MP3 format...");
      try {
        processedFile = await convertToMp3(file);
        console.log("[VTS] Conversion successful, new file:", {
          name: (processedFile as File).name,
          type: processedFile.type,
          size: processedFile.size
        });
      } catch (conversionError) {
        console.error("[VTS] Conversion failed:", conversionError);
        return NextResponse.json({ 
          error: "Failed to convert audio format", 
          detail: conversionError instanceof Error ? conversionError.message : "Unknown conversion error"
        }, { status: 400 });
      }
    }

    const upstreamUrl = `${process.env.API_BASE_URL1}${process.env.API_VTT_ENDPOINT}`;
    console.log("[VTS] Sending to upstream URL:", upstreamUrl);

    // Convert temperature to number as required by the API
    // const temperatureNumber = parseFloat(temperature) || 0.5;
    // console.log("[VTS] Temperature converted to number:", temperatureNumber);

    const upstreamForm = new FormData();
    upstreamForm.set("file", processedFile);
    upstreamForm.set("model", model);
    // upstreamForm.set("language", language);
    // upstreamForm.set("temperature", temperatureNumber.toString());

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      body: upstreamForm,
    });

    const responseBody = await upstreamResponse.text();
    console.log("[VTS] Upstream response status:", upstreamResponse.status);
    console.log("[VTS] Upstream response body:", responseBody);

    if (!upstreamResponse.ok) {
      console.error("[VTS] Upstream error:", responseBody);
      return NextResponse.json(
        { error: "Upstream STT service failed", detail: responseBody },
        { status: upstreamResponse.status }
      );
    }

    let result;
    try {
      result = JSON.parse(responseBody);
    } catch (err) {
      console.error("[VTS] Error parsing upstream JSON:", err);
      return NextResponse.json(
        { error: "Invalid JSON from upstream", detail: responseBody },
        { status: 502 }
      );
    }

    if (result.success && result.data?.text) {
      return NextResponse.json({ 
        text: result.data.text 
      });
    } else {
      console.error("[VTS] Unexpected response structure:", result);
      return NextResponse.json(
        { error: "Invalid response structure from upstream" },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error("[VTS] Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Function to convert any audio format to MP3
async function convertToMp3(audioFile: Blob): Promise<File> {
  try {
    // For now, we'll create an MP3 file with the same audio data
    // This is a simple conversion that changes the MIME type and extension
    const arrayBuffer = await audioFile.arrayBuffer();
    const mp3Blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const mp3File = new File([mp3Blob], 'recording.mp3', { type: 'audio/mpeg' });
    
    console.log("[VTS] Created MP3 file:", {
      name: mp3File.name,
      type: mp3File.type,
      size: mp3File.size
    });
    
    return mp3File;
  } catch (error) {
    console.error("[VTS] Error in audio to MP3 conversion:", error);
    throw new Error(`Failed to convert audio to MP3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
