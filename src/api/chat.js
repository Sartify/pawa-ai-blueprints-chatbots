const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_CHAT_ENDPOINT = import.meta.env.VITE_API_CHAT_STREAMING;

export const sendChatMessage = async (message, files = [], onChunk) => {
  try {
    console.log('🚀 Chat API - Starting streaming request...');
    console.log('📝 Message:', message);
    console.log('📁 Files:', files);
    console.log('🔧 Environment variables:');
    console.log('   - API_BASE_URL:', API_BASE_URL);
    console.log('   - API_CHAT_ENDPOINT:', API_CHAT_ENDPOINT);

    if (!message || typeof message !== 'string') {
      console.error('❌ Chat API - Invalid message:', message);
      throw new Error('Message is required and must be a string');
    }

    const url = `${API_BASE_URL}${API_CHAT_ENDPOINT}`;
    console.log('🌐 Constructed URL:', url);

    // Create FormData for better file handling
    const formData = new FormData();
    formData.append('message', message);
    
    // Add files to FormData only if files are provided
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append('files', file);
        console.log(`📁 Added file ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
      });
    }
    // Note: Don't add empty files array when no files are present
    
    console.log('📤 FormData created:');
    console.log('   - message:', message);
    console.log('   - files count:', files ? files.length : 0);
    
    // Log all FormData entries for debugging
    console.log('📋 FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`   - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`   - ${key}:`, value);
      }
    }
    
    console.log('📡 Making streaming API request...');
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
      } catch (e) {
        console.log('📥 Could not read error response body');
      }

      console.error('❌ Chat API - Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorDetails: errorDetails
      });
      
      throw new Error(`API request failed with status: ${response.status} - ${errorDetails}`);
    }

    console.log('✅ Chat API - Streaming started, processing chunks...');
    
    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Chat API - Stream completed');
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        
        console.log('📥 Received chunk:', chunk);
        
        // Try to parse each chunk as JSON
        try {
          const parsedChunk = JSON.parse(chunk);
          console.log('📥 Parsed chunk:', parsedChunk);
          
          if (parsedChunk.message?.content) {
            accumulatedContent += parsedChunk.message.content;
            
            // Call the onChunk callback with the accumulated content
            if (onChunk) {
              onChunk({
                message: {
                  role: parsedChunk.message.role || 'assistant',
                  content: accumulatedContent
                }
              });
            }
          }
        } catch (parseError) {
          console.log('📥 Chunk is not valid JSON, continuing...');
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Try to parse the full response as fallback
    let finalData;
    try {
      finalData = JSON.parse(fullResponse);
    } catch (e) {
      console.log('📥 Could not parse full response as JSON, using accumulated content');
      finalData = {
        message: {
          role: 'assistant',
          content: accumulatedContent || 'No response content available'
        }
      };
    }

    // Return the final formatted response
    const formattedResponse = {
      message: {
        role: finalData.message?.role || 'assistant',
        content: finalData.message?.content || accumulatedContent || 'No response content available'
      }
    };

    console.log('✅ Chat API - Final response:', formattedResponse);
    return formattedResponse;

  } catch (error) {
    console.error('❌ Chat API - Error occurred:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    throw error;
  }
};
