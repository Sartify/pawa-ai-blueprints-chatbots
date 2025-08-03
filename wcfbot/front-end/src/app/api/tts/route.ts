// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { text, voice, model, max_tokens, temperature, top_p, repetition_penalty } = payload;

<<<<<<< HEAD
    const apiUrl = `${process.env.API_BASE_URL}${process.env.API_TTS_ENDPOINT}`;
=======
    const apiUrl = `${process.env.API_BASE_URL1}${process.env.API_TTS_ENDPOINT}`;
>>>>>>> ee4d4a7404b387eae5e0196fae5ecb337fc55c9f

    console.log("TTS Request payload:", payload);
    console.log("TTS API URL:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });

    console.log("TTS Response status:", response.status);
    console.log("TTS Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TTS External API error:", errorText);
      return NextResponse.json({ 
        error: "TTS API request failed", 
        details: errorText 
      }, { status: response.status });
    }

    return new NextResponse(response.body, { 
      status: response.status,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error) {
    console.error("Error in TTS API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
