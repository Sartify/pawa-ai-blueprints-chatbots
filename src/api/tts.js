const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_AUDIO_TTS = import.meta.env.VITE_API_AUDIO_TTS;

export const convertTextToSpeech = async (text) => {
  try {
    console.log('🚀 TTS API - Starting request...');
    console.log('📝 Text:', text);
    console.log('🔧 Environment variables:');
    console.log('   - API_BASE_URL:', API_BASE_URL);
    console.log('   - API_AUDIO_TTS:', API_AUDIO_TTS);

    if (!text || typeof text !== 'string') {
      console.error('❌ TTS API - Invalid text:', text);
      throw new Error('Text is required and must be a string');
    }

    const url = `${API_BASE_URL}${API_AUDIO_TTS}`;
    console.log('🌐 Constructed URL:', url);

    // Create request body
    const requestBody = {
      text: text
    };
    
    console.log('📤 Request body:', requestBody);

    console.log('📡 Making API request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/*'
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      // Try to get the error response body
      let errorDetails = '';
      try {
        const errorResponse = await response.text();
        console.log('📥 Error response body:', errorResponse);
        errorDetails = errorResponse;
      } catch (e) {
        console.log('📥 Could not read error response body');
      }

      console.error('❌ TTS API - Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorDetails: errorDetails
      });
      throw new Error(`TTS API request failed with status: ${response.status} - ${errorDetails}`);
    }

    console.log('✅ TTS API - Request successful, processing audio response...');
    
    // Get the audio blob
    const audioBlob = await response.blob();
    console.log('📥 Audio blob received:', {
      size: audioBlob.size,
      type: audioBlob.type
    });

    // Create audio URL for playback
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const result = {
      audioUrl: audioUrl,
      blob: audioBlob,
      size: audioBlob.size,
      type: audioBlob.type
    };

    console.log('✅ TTS API - Successfully converted text to speech:', result);
    return result;

  } catch (error) {
    console.error('❌ TTS API - Error occurred:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    throw error;
  }
};
