"use client";
import { transcribeAudio } from "@/services/voiceService";
import { useState, useRef } from "react";

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

async function convertWebMToWav(webmBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const wavData = encodeWAV(audioBuffer);
  return new Blob([wavData], { type: 'audio/wav' });
}


export function useVoiceRecording(onTranscription: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const webmBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const wavBlob = await convertWebMToWav(webmBlob);
          const wavFile = new File([wavBlob], "recording.wav", { type: "audio/wav" });

          const result = await transcribeAudio(wavFile);

          // ✅ Instead of storing, call the callback
          onTranscription(result.text);
        } catch (err) {
          console.error("Transcription error:", err);
          setError("Failed to transcribe audio");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      setError("Microphone access denied or unavailable");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
}
