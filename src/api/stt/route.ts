import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!audioFile.type.includes('audio/') && !audioFile.name.endsWith('.mp3')) {
      return NextResponse.json(
        { error: 'File must be an audio file (MP3)' },
        { status: 400 }
      );
    }

    const url = `${process.env.API_BASE_URL}${process.env.API_AUDIO_STT}`

    // Create FormData for external API
    const externalFormData = new FormData();
    externalFormData.append('audio', audioFile);

    // Make request to external STT API
    const response = await fetch(url, {
      method: 'POST',
      body: externalFormData,
    });

    if (!response.ok) {
      throw new Error(`STT API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Return the transcribed text as string
    return NextResponse.json({
      text: data.text || data.transcription || data.message || 'No transcription available'
    });

  } catch (error) {
    console.error('STT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
