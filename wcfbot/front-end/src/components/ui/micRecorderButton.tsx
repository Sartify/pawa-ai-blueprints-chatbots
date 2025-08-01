import React, { useState } from 'react';

interface MicRecorderButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const MicRecorderButton: React.FC<MicRecorderButtonProps> = ({
  onTranscription,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Simulate voice transcription result
      setTimeout(() => {
        onTranscription('This is a simulated voice transcription result that would come from the microphone recording.');
      }, 500);
    } else {
      // Start recording
      setIsRecording(true);
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        onTranscription('This is a simulated voice transcription result that would come from the microphone recording.');
      }, 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`px-3 py-1 text-sm rounded transition-all duration-200 flex items-center gap-2 ${
        isRecording
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-gray-600 text-white hover:bg-gray-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isRecording ? 'Stop recording' : 'Start voice recording'}
    >
      <span className={`text-lg ${isRecording ? 'animate-pulse' : ''}`}>
        {isRecording ? '⏹️' : '🎤'}
      </span>
      <span className="text-xs">
        {isRecording ? 'Recording...' : 'Voice'}
      </span>
    </button>
  );
}; 