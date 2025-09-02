const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_AUDIO_STT = import.meta.env.VITE_API_AUDIO_STT;

export const convertSpeechToText = async (audioFile) => {
  try {
    console.log('🚀 STT API - Starting request...');
    console.log('🎵 Audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });
    console.log('🔧 Environment variables:');
    console.log('   - API_BASE_URL:', API_BASE_URL);
    console.log('   - API_AUDIO_STT:', API_AUDIO_STT);

    if (!audioFile) {
      console.error('❌ STT API - No audio file provided');
      throw new Error('Audio file is required');
    }

    // More flexible file type validation - accept common audio formats
    const validAudioTypes = [
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav',
      'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/aac'
    ];
    
    const isValidType = validAudioTypes.includes(audioFile.type) || 
                       audioFile.name.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i);
    
    if (!isValidType) {
      console.error('❌ STT API - Invalid file type:', {
        type: audioFile.type,
        name: audioFile.name
      });
      throw new Error('File must be an audio file (MP3, WAV, OGG, WebM, M4A, AAC)');
    }

    const url = `${API_BASE_URL}${API_AUDIO_STT}`;
    console.log('🌐 Constructed URL:', url);

    // Create FormData for the request
    const formData = new FormData();
    formData.append('file', audioFile);
    console.log('📤 FormData created with audio file');

    console.log('📡 Making API request...');
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Try to get the error response body
      let errorDetails = '';
      try {
        const errorResponse = await response.text();
        console.log('📥 Error response body:', errorResponse);
        errorDetails = errorResponse;
        
        // Try to parse JSON error for better error messages
        try {
          const errorJson = JSON.parse(errorResponse);
          if (errorJson.error) {
            errorDetails = errorJson.error;
          }
          if (errorJson.details) {
            errorDetails += ` - ${errorJson.details}`;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the raw error text
          console.log('📥 Could not parse error as JSON, using raw text');
        }
      } catch (e) {
        console.log('📥 Could not read error response body');
      }

      console.error('❌ STT API - Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorDetails: errorDetails
      });
      
      // Provide more specific error messages based on status codes
      let errorMessage = `STT API request failed with status: ${response.status}`;
      
      if (response.status === 502) {
        errorMessage = 'STT service is currently unavailable. Please try again later.';
      } else if (response.status === 500) {
        errorMessage = 'STT service encountered an internal error. Please try again.';
      } else if (response.status === 413) {
        errorMessage = 'Audio file is too large. Please record a shorter message.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid audio format. Please try recording again.';
      }
      
      if (errorDetails) {
        errorMessage += ` (${errorDetails})`;
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ STT API - Request successful, parsing response...');
    const data = await response.json();
    console.log('📥 Response data:', data);

    // Return the transcribed text
    const result = {
      text: data.text || data.transcription || data.message || 'No transcription available'
    };

    console.log('✅ STT API - Successfully converted speech to text:', result);
    return result;

  } catch (error) {
    console.error('❌ STT API - Error occurred:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    throw error;
  }
};
