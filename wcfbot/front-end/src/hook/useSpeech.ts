"use client";
import { useState, useCallback, useRef } from 'react';
import { fetchTTSAudio } from '@/services/voiceService';

interface UseSpeechOptions {
  text: string;
  messageId: string;
}

export const useSpeech = ({ text, messageId }: UseSpeechOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOtherPlaying, setIsOtherPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      try {
        setIsLoading(true);
        console.log("[TTS] Starting text-to-speech for:", text);
        
        // Fetch TTS audio
        const response = await fetchTTSAudio(text);
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log("[TTS] Audio blob created, size:", audioBlob.size);
        
        // Create and play audio
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          console.log("[TTS] Audio playback ended");
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current.onerror = (error) => {
          console.error("[TTS] Audio playback error:", error);
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        console.log("[TTS] Audio playback started");
        
      } catch (error) {
        console.error('[TTS] Error:', error);
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  }, [isPlaying, text]);

  return {
    isLoading,
    isPlaying,
    isOtherPlaying,
    handlePlayPause,
  };
};