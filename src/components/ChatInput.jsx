import React, { useState, useRef, useCallback } from 'react';
import { Paperclip, Mic, Square, Send } from 'lucide-react';
import { convertSpeechToText } from '../api/stt';
import FileUpload from './ChatFileUpload';

const ChatInput = ({ inputValue, setInputValue, onSendMessage, placeholder = "What are the top national parks to visit?", isLoading = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const fileUploadRef = useRef(null);

  // Convert WebM audio to MP3 using Web Audio API
  const convertWebmToMp3 = async (webmBlob) => {
    try {
      console.log('🔄 Starting WebM to MP3 conversion...');
      
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Convert blob to array buffer
      const arrayBuffer = await webmBlob.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('🎵 Decoded audio buffer:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels
      });
      
      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      // Create buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      // Render the audio
      const renderedBuffer = await offlineContext.startRendering();
      console.log('🎵 Rendered audio buffer');
      
      // Convert to WAV format (MP3 encoding is complex, WAV is more reliable)
      const wavBlob = await audioBufferToWav(renderedBuffer);
      console.log('🎵 Converted to WAV format:', {
        size: wavBlob.size,
        type: wavBlob.type
      });
      
      // Create MP3 file (we'll use WAV for now as it's more compatible)
      const audioFile = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
      
      // Clean up
      audioContext.close();
      
      console.log('✅ Audio conversion completed');
      return audioFile;
      
    } catch (error) {
      console.error('❌ Audio conversion failed:', error);
      throw new Error('Failed to convert audio format');
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Try to use MP3 format if supported, fallback to WebM
      let mimeType = 'audio/mp3';
      if (!MediaRecorder.isTypeSupported('audio/mp3')) {
        mimeType = 'audio/webm;codecs=opus';
        console.log('🎤 MP3 not supported, using WebM with Opus codec');
      } else {
        console.log('🎤 Using MP3 format for recording');
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });
      
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        try {
          console.log('🎤 Processing recorded audio...');
          console.log('📊 Recording format:', mimeType);
          console.log('📊 Chunks count:', chunks.length);
          console.log('📊 Total size:', chunks.reduce((acc, chunk) => acc + chunk.size, 0));
          
          // Create audio blob with the recorded format
          const audioBlob = new Blob(chunks, { type: mimeType });
          console.log('🎵 Created audio blob:', {
            size: audioBlob.size,
            type: audioBlob.type
          });
          
          // Convert audio format if needed
          let finalAudioFile;
          if (mimeType.includes('webm')) {
            console.log('🔄 Converting WebM to WAV...');
            finalAudioFile = await convertWebmToMp3(audioBlob);
            console.log('✅ Using converted WAV format for STT API');
          } else {
            finalAudioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });
            console.log('✅ Using MP3 format for STT API');
          }
          
          console.log('📤 Sending audio file to STT API:', {
            name: finalAudioFile.name,
            size: finalAudioFile.size,
            type: finalAudioFile.type
          });
          
          const result = await convertSpeechToText(finalAudioFile);
          console.log('✅ Transcription result:', result);
          
          // Fill the input with transcribed text
          setInputValue(result.text);
        } catch (error) {
          console.error('Transcription failed:', error);
          alert(`Transcription failed: ${error.message}`);
        } finally {
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
          setRecordingTime(0);
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
          }
        }
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('🎤 Recording started with format:', mimeType);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileChange = useCallback((files) => {
    setSelectedFiles(files);
    console.log('📁 Files selected:', files);
  }, []);

  const handlePaperclipClick = () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerFilePicker();
    }
  };

  const handleSend = () => {
    // Require text input even when files are present
    if (!inputValue.trim()) {
      alert('Please enter a message before sending.');
      return;
    }
    
    if (!isLoading) {
      console.log('📤 Sending message with files:');
      console.log('   - Text:', inputValue);
      console.log('   - Files count:', selectedFiles.length);
      console.log('   - Files:', selectedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      })));
      
      onSendMessage(inputValue, selectedFiles);
      setInputValue('');
      setSelectedFiles([]);
      // Reset file upload component
      if (fileUploadRef.current) {
        fileUploadRef.current.clearFiles();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && inputValue.trim()) {
      handleSend();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* File Upload Component */}
          <FileUpload
            ref={fileUploadRef}
            onFilesChange={handleFileChange}
            disabled={isLoading || isRecording}
            resetTrigger={false}
          />
          
          <div className="flex items-center bg-[#019A5A] rounded-lg px-4 py-3 gap-3">
            <Paperclip 
              className="w-5 h-5 text-white cursor-pointer hover:text-gray-200 transition-colors" 
              onClick={handlePaperclipClick}
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isLoading 
                  ? "Assistant is typing..." 
                  : selectedFiles.length > 0 
                    ? "Type your message here (required even with files)..." 
                    : placeholder
              }
              disabled={isLoading || isRecording}
              className="flex-1 bg-transparent text-white placeholder-white outline-none disabled:opacity-50"
            />
            
            {/* File indicator */}
            {selectedFiles.length > 0 && (
              <div className="text-white text-xs bg-white/20 px-2 py-1 rounded">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </div>
            )}
            
            {/* Mic/Stop button */}
            <button
              onClick={handleMicClick}
              disabled={isLoading}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-transparent hover:bg-white/20'
              }`}
            >
              {isRecording ? (
                <Square className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
            
            <button 
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim() || isRecording}
              className="bg-white rounded-lg p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-[#019A5A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
