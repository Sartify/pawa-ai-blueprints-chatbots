"use client";
import React, { useEffect, useState } from "react";
import { MessageList } from "./ChatMessageList";
import { useChat } from "@/hook/useChat";
import TutorEmptyState from "./ChatEmptyState";
import { LoadingDots } from "../ui/Loader";
import { Header } from "./ChatContainerHeader";
import ChatInput from "./ChatInputBar";

export const ChatContainer: React.FC = () => {
  const {
    messages,
    isStreaming,
    clearMessages,
    handleSendMessage,
    handleResubmitMessage,
    options,
    setOptions,
    stopGeneration,
    isReceivingChunks,
    hasPendingUploads,
    setHasPendingUploads,
    webSearchingMessageId,
    handleVoiceToVoiceMessage,
    isVoiceMode,
  } = useChat();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentlyEditingMessageId, setCurrentlyEditingMessageId] = useState<string | null>(null);
  const [autoScrollTrigger, setAutoScrollTrigger] = useState(0);

  const handleSendMessageAndScroll = (
    text: string,
    model: string,
    files?: File[],
    isResubmit?: boolean,
    regenerateId?: string
  ) => {
    handleSendMessage(text, model, files, isResubmit, regenerateId);
    setAutoScrollTrigger((t) => t + 1);
  };

  const handleResubmitMessageAndScroll = (
    newContent: string,
    userMessageId: string,
    assistantMessageId: string
  ) => {
    handleResubmitMessage(newContent, userMessageId, assistantMessageId);
    setAutoScrollTrigger((t) => t + 1);
  };



  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNewChat = async () => {
    clearMessages();
  };

  const renderContent = () => {
    if (isInitialLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoadingDots />
        </div>
      );
    }

    return messages.length === 0 ? (
      // Empty State Layout
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <TutorEmptyState
            onSend={(message, files) =>
              handleSendMessage(message, options.model, files as File[])
            }
            disabled={isStreaming}
          />
        </div>
        <div className="flex-shrink-0 px-4 pb-4">
          <p className="text-xs text-gray-500 text-center mt-2">
            WCF Agent can make mistakes. Verify the response. Read our{" "}
            <a href="#" className="text-[#022e79] hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    ) : (
      // Messages Layout
      <div className="flex flex-col h-full">
        <div className="overflow-y-auto flex-1 pb-2 scrollbar-hide">
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            onResubmitMessage={handleResubmitMessageAndScroll}
            enableAutoScrollTrigger={autoScrollTrigger}
            hasPendingUploads={hasPendingUploads}
            webSearchingMessageId={webSearchingMessageId}
            currentlyEditingMessageId={currentlyEditingMessageId}
            setCurrentlyEditingMessageId={setCurrentlyEditingMessageId}
          />
        </div>
        <ChatInput
          onSend={(message, files) => handleSendMessageAndScroll(message, options.model, files as File[])}
          disabled={isStreaming}
        />
        <p className="text-xs text-gray-500 text-center mt-2">
           WCF Agent can make mistakes. Verify the response. Read our{" "}
          <a href="#" className="text-[#022e79] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#022e79]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="flex-shrink-0 px-4 md:px-8 lg:px-10 bg-white">
          <Header
            onNewChat={handleNewChat}
          />
        </div>

        {/* Chat Content */}
        <main className="flex-1 flex justify-center min-h-0 bg-white">
          <div
            className="h-full w-full mx-auto px-2 sm:px-4 max-w-4xl bg-white"
            style={{ maxWidth: "896px" }}
          >
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};