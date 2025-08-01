"use client";
import React, { useEffect, useRef, useState } from "react";
import { AudioLines, Paperclip, Send } from "lucide-react";
import { MessageFile } from "@/types/Message";
import FileUpload, { FileUploadHandle } from "../ui/FileUpload";
import { useVoiceRecording } from "@/hook/useVoiceRecording";

type ChatInputProps = {
  onSend: (message: string, files: MessageFile[]) => void;
  disabled?: boolean;
  showVoiceButton?: boolean;
  onVoiceClick?: () => void;
};

export default function ChatInput({
  onSend,
  disabled = false,
  showVoiceButton = true,
  onVoiceClick,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<MessageFile[]>([]);
  const [resetTrigger, setResetTrigger] = useState(false);
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const handleTranscription = (text: string) => {
    setMessage(text);
  };

  const handleVoiceError = (error: string) => {
    console.error("Voice recording error:", error);
    // You can add a toast notification here if needed
  };

  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  } = useVoiceRecording({
    onTranscription: handleTranscription,
    onError: handleVoiceError
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message.trim(), files);
    setMessage("");
    setFiles([]);
    // Reset file upload to close any open modals
    setResetTrigger(prev => !prev);
  };

  const handlePaperclipClick = () => {
    fileUploadRef.current?.triggerFilePicker();
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <footer className="pb-4 pt-2 px-4 flex flex-col bg-white shrink-0">
      <div className="w-full lg:w-[70%] mx-auto">
        <FileUpload
          ref={fileUploadRef}
          onFilesChange={setFiles}
          disabled={disabled}
          resetTrigger={resetTrigger}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full lg:w-[70%] mx-auto flex items-center gap-2"
      >
        <div
          className={`flex items-center flex-1 bg-white border border-[#F3F7F6] shadow-md rounded-lg px-4 py-2 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <button
            type="button"
            onClick={handlePaperclipClick}
            disabled={disabled}
            className="mr-2 opacity-60 hover:opacity-100"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message WCF Agent..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={disabled || isProcessing}
            className="h-8 w-8 flex items-center justify-center border border-[#F3F7F6] rounded-md hover:bg-gray-100 transition"
            title={isRecording ? "Stop Recording" : isProcessing ? "Processing..." : "Start Recording"}
          >
            <AudioLines
              className={`w-4 h-4 ${
                isRecording 
                  ? "animate-pulse text-red-500" 
                  : isProcessing 
                    ? "text-[#022e79] animate-spin" 
                    : "opacity-60"
              }`}
            />
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="ml-2 h-8 w-8 flex items-center justify-center bg-[#022e79] rounded-md hover:bg-blue-900 transition"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </footer>
  );
}
