"use client";
import React from "react";
import Markdown from "@/components/markdown";
import { ActionButton } from "./ActionButton";
import {
  Copy,
  Check,
  Loader2,
  Search,
  Volume2,
  CircleAlert,
  Pause,
  Bot,
} from "lucide-react";
import { LoadingDots } from "@/components/ui/Loader";
import { Message } from "@/types/Message";
import { TextShimmer } from "../../../components/motion-primitives/text-shimmer";

interface AssistantMessageProps {
  message: Message;
  isGenerating: boolean;
  hasPendingUploads?: boolean;
  isWebSearching?: boolean;
  showActions: boolean;
  isCopied: boolean;
  handleCopy: () => void;
  speechLoading: boolean;
  isPlaying: boolean;
  isOtherPlaying: boolean;
  speechHandlePlay: () => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  isGenerating,
  hasPendingUploads,
  isWebSearching,
  showActions,
  isCopied,
  handleCopy,
  speechLoading,
  isPlaying,
  isOtherPlaying,
  speechHandlePlay,
}) => {
  const isErrorMessage = message.error === true;

  return (
    <>
      <div className="w-10 h-10 bg-white rounded flex justify-center items-center mr-3">
        <Bot
          className="w-6 h-6 text-[#022e79]"
        />
      </div>

      <div className="relative max-w-[80%] w-full">
        <div className="whitespace-pre-wrap break-words break-all text-black">
          <div className="text-[0.9rem] overflow-hidden break-words break-all">
            {isErrorMessage ? (
              <div className="flex items-center gap-3 bg-red-800/30 border border-red-500 text-red-200 rounded-lg p-4 shadow-lg">
                <CircleAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="font-medium">{message.content}</span>
              </div>
            ) : isGenerating ? (
              hasPendingUploads ? (
                <TextShimmer className="font-avenir text-md" duration={1}>
                  Processing uploaded files...
                </TextShimmer>
              ) : isWebSearching ? (
                <div className="flex items-center gap-2 font-avenir text-md">
                  <Search className="w-4 h-4" />
                  <TextShimmer className="font-avenir text-md" duration={1}>
                    Searching across the web...
                  </TextShimmer>
                </div>
              ) : (
                <Markdown content={message.content} />
              )
            ) : (
              <Markdown content={message.content} />
            )}
          </div>

          {isGenerating && (
            <div className="flex justify-center mt-2 items-center w-full">
              <LoadingDots />
            </div>
          )}
        </div>

        {!isGenerating && showActions && (
          <div className="flex -ml-3">
            <ActionButton
              icon={
                isCopied ? (
                  <Check className="w-[13px] h-[13px] text-[#022e79] group-hover:text-white transition-colors" />
                ) : (
                  <Copy className="w-[13px] h-[13px] text-[#022e79] group-hover:text-white transition-colors" />
                )
              }
              tooltipText={isCopied ? "Copied!" : "Copy Message"}
              onClick={handleCopy}
            />

            <ActionButton
              icon={
                speechLoading ? (
                  <Loader2
                    className="w-[13px] h-[13px] animate-spin text-[#022e79] group-hover:text-white transition-colors"
                  />
                ) : isPlaying ? (
                  <Pause className="w-[13px] h-[13px] text-[#022e79] group-hover:text-white transition-colors" />
                ) : (
                  <Volume2 className="w-[13px] h-[13px] text-[#022e79] group-hover:text-white transition-colors" />
                )
              }
              tooltipText={
                isOtherPlaying
                  ? "Loading..."
                  : isPlaying
                  ? "Pause"
                  : isOtherPlaying
                  ? "Stop other audio first"
                  : "Listen"
              }
              onClick={speechHandlePlay}
              disabled={isOtherPlaying}
            />
          </div>
        )}
      </div>
    </>
  );
};
