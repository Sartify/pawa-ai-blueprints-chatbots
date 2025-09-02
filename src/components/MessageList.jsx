import React, { useState, useRef, useCallback } from 'react';
import { Volume2, Pause } from 'lucide-react';
import ChatbotHeader from './ChatbotHeader'
import SafariImg from '../assets/safari.png'
import Markdown from './markdown';
import { FileAttachmentGrid } from './ChatFileGrid';

const MessageList = ({ messages, onNewChat }) => {
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [generatingMessageId, setGeneratingMessageId] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const audioRefs = useRef({});

  const handleReadAloud = useCallback(async (messageIndex, messageText) => {
    try {
      const messageId = `message-${messageIndex}`;
      
      // If already playing this message, stop it
      if (playingMessageId === messageId) {
        stopAudio(messageId);
        return;
      }

      // Stop any currently playing audio
      if (playingMessageId) {
        stopAudio(playingMessageId);
      }

      console.log('🔊 Starting text-to-speech for message:', messageIndex);
      console.log('📝 Text to convert:', messageText);

      // Show generating state
      setGeneratingMessageId(messageId);

      // Call TTS API with streaming
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_AUDIO_TTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/*'
        },
        body: JSON.stringify({
          text: messageText.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) throw new Error("Empty response body");

      // Create MediaSource for streaming
      const mediaSource = new MediaSource();
      const audio = new Audio();
      audio.src = URL.createObjectURL(mediaSource);
      audioRefs.current[messageId] = audio;

      // Set loading timeout
      const loadingTimeout = setTimeout(() => {
        console.warn('[MessageList] Loading timeout reached, clearing loading state');
        setGeneratingMessageId(null);
      }, 10000);

      mediaSource.addEventListener("sourceopen", async () => {
        try {
          const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
          const reader = response.body.getReader();
          let started = false;

          const appendChunk = async (chunk) => {
            return new Promise((resolve, reject) => {
              const doAppend = () => {
                try {
                  if (sourceBuffer.updating) {
                    sourceBuffer.addEventListener("updateend", doAppend, { once: true });
                  } else {
                    const buffer = chunk.buffer instanceof ArrayBuffer 
                      ? chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)
                      : new Uint8Array(chunk).buffer;
                    
                    sourceBuffer.appendBuffer(buffer);
                    resolve();
                  }
                } catch (err) {
                  reject(err);
                }
              };
              doAppend();
            });
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (mediaSource.readyState === "open") {
                try {
                  mediaSource.endOfStream();
                } catch (err) {
                  console.warn("endOfStream error:", err);
                }
              }
              break;
            }

            const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
            await appendChunk(chunk);

            if (!started) {
              clearTimeout(loadingTimeout);
              setGeneratingMessageId(null);
              setPlayingMessageId(messageId);
              
              audio.play();
              started = true;
              console.log(`[MessageList] Audio started playing for message ${messageIndex}`);
            }
          }

          if (!started) {
            clearTimeout(loadingTimeout);
            setGeneratingMessageId(null);
          }
        } catch (err) {
          console.error("[MessageList] Streaming error:", err);
          clearTimeout(loadingTimeout);
          setGeneratingMessageId(null);
          setPlayingMessageId(null);
          audio.pause();
          audio.src = "";
        }
      });

      mediaSource.addEventListener("error", (err) => {
        console.error("[MessageList] MediaSource error:", err);
        clearTimeout(loadingTimeout);
        setGeneratingMessageId(null);
        setPlayingMessageId(null);
      });

      audio.onended = () => {
        console.log(`[MessageList] Audio ended for message ${messageIndex}`);
        setPlayingMessageId(null);
      };

      audio.onerror = (err) => {
        console.error(`[MessageList] Audio error for message ${messageIndex}:`, err);
        clearTimeout(loadingTimeout);
        setGeneratingMessageId(null);
        setPlayingMessageId(null);
      };

      setAudioElements(prev => ({
        ...prev,
        [messageId]: audio
      }));

    } catch (error) {
      console.error('❌ Text-to-speech failed:', error);
      setGeneratingMessageId(null);
      alert(`Text-to-speech failed: ${error.message}`);
    }
  }, [playingMessageId]);

  const stopAudio = (messageId) => {
    if (audioRefs.current[messageId]) {
      audioRefs.current[messageId].pause();
      audioRefs.current[messageId].currentTime = 0;
      setPlayingMessageId(null);
      setGeneratingMessageId(null);
      console.log('⏹️ Audio stopped');
    }
  };

  React.useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
      Object.values(audioElements).forEach(audio => {
        if (audio && audio.src) {
          URL.revokeObjectURL(audio.src);
        }
      });
    };
  }, []);

  const isPlaying = (messageIndex) => {
    return playingMessageId === `message-${messageIndex}`;
  };

  const isGenerating = (messageIndex) => {
    return generatingMessageId === `message-${messageIndex}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Chatbot Header */}
      <ChatbotHeader onNewChat={onNewChat} />

      {/* Chat Content */}
      <div className="px-6 py-8 space-y-6 pb-24 pt-20">
        {messages.map((message, index) => (
          <div key={index}>
            {/* User Question */}
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-4">
                {/* <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-[#019A5A] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">U</span>
                  </div>
                </div> */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#019A5A] font-medium">You</span>
                  </div>
                  
                  <div className="bg-[#019A5A] text-white px-6 py-3 rounded-lg max-w-md">
                    {message.userMessage}
                  </div>
                  
                  {/* File Attachments - Outside and below the message bubble */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2">
                      <FileAttachmentGrid
                        files={message.files}
                        fileLoadingStates={{}}
                        imageLoadStates={{}}
                        objectUrls={{}}
                        onPreview={() => {}}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bot Response */}
            {message.botResponse && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <img 
                    src={SafariImg} 
                    alt="Assistant" 
                    className="w-8 h-8" 
                    style={{
                      filter: 'brightness(0) saturate(100%) invert(67%) sepia(100%) saturate(1000%) hue-rotate(360deg) brightness(1) contrast(1)'
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#019A5A] font-medium">Unforgettable Experience</span>
                  </div>
                  
                  <div className="p-6 border-l-4 border-[#FFA200]">
                    <h3 className="font-semibold text-gray-900 mb-4">{message.botResponse.title}</h3>
                    <p className="text-gray-700 mb-4">
                      {message.botResponse.description}
                    </p>
                    
                    {message.botResponse.content && (
                      <div className="text-gray-700">
                        <Markdown content={message.botResponse.content} />
                        {/* {message.botResponse.content} */}
                      </div>
                    )}
                  </div>

                  {/* Read Aloud Button */}
                  <button
                    onClick={() => handleReadAloud(index, message.botResponse.description)}
                    className={`flex items-center gap-2 mt-4 transition-colors p-2 bg-[#E9FFF6] ${
                      isPlaying(index) 
                        ? 'text-[#019A5A] hover:text-[#018a4f]' 
                        : isGenerating(index)
                        ? 'text-[#FFA200] cursor-wait'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    disabled={!message.botResponse.description || isGenerating(index)}
                  >
                    {isGenerating(index) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Generating...</span>
                      </>
                    ) : isPlaying(index) ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span className="text-sm">Pause</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span className="text-sm">Read aloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {message.isLoading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <img src={SafariImg} alt="Assistant" className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#019A5A] font-medium">Assistant is typing...</span>
                  </div>
                  
                  <div className="p-6 border-l-4 border-[#FFA200]">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-500 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;
