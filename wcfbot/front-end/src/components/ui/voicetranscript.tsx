"use client";
import { transcribeAudio } from '@/services/voiceService';
import React, { useEffect, useRef } from 'react';

async function convertWebMToWav(webmBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
  
  function encodeWAV(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const blockAlign = numChannels * bitsPerSample / 8;
    const byteRate = sampleRate * blockAlign;
    const length = audioBuffer.length * blockAlign;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    let offset = 0;
    
    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, 36 + length, true); offset += 4;
    writeString(view, offset, 'WAVE'); offset += 4;
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, bitsPerSample, true); offset += 2;
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, length, true); offset += 4;
    
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return buffer;
  }
  
  const wavData = encodeWAV(audioBuffer);
  return new Blob([wavData], { type: 'audio/wav' });
}

interface VoiceTranscriptionHandlerProps {
  audioBlob: Blob;
  onTranscriptionComplete: (text: string) => void;
  onTranscriptionError: (error: string) => void;
}

const VoiceTranscriptionHandler: React.FC<VoiceTranscriptionHandlerProps> = ({
  audioBlob,
  onTranscriptionComplete,
  onTranscriptionError,
}) => {
  const hasTranscribed = useRef(false);
  const transcriptionPromise = useRef<Promise<void> | null>(null);
  
  useEffect(() => {
    if (hasTranscribed.current || transcriptionPromise.current) {
      return;
    }
    
    const doTranscription = async () => {
      try {
        console.log("[VoiceTranscriptionHandler] Starting transcription...");
        const wavBlob = await convertWebMToWav(audioBlob);
        const wavFile = new File([wavBlob], "recording.wav", { type: "audio/wav" });
        const result = await transcribeAudio(wavFile);
        
        console.log("[VoiceTranscriptionHandler] Transcription complete:", result.text);
        hasTranscribed.current = true;
        onTranscriptionComplete(result.text);
      } catch (err) {
        console.error("[VoiceTranscriptionHandler] Transcription error:", err);
        hasTranscribed.current = true;
        onTranscriptionError("Sorry, we couldn't transcribe your message. Please try again.");
      } finally {
        transcriptionPromise.current = null;
      }
    };
    
    transcriptionPromise.current = doTranscription();
    
  }, [audioBlob, onTranscriptionComplete, onTranscriptionError]);
  
  return null;
};

export default VoiceTranscriptionHandler;