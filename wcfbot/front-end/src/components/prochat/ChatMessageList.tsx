import React, { useEffect, useRef, useState } from "react";
import { LoadingDots } from "../ui/Loader";
import { MessageBubble } from "./ChatMessageBubble";
import { Message } from "@/types/Message";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  isLoading?: boolean;
  onResubmitMessage?: (
    newContent: string,
    messageId: string,
    assistantMessageId: string
  ) => void;
  onStopGeneration?: () => void;

  hasPendingUploads?: boolean;
  webSearchingMessageId?: string | null;
  currentlyEditingMessageId: string | null;
  setCurrentlyEditingMessageId: (id: string | null) => void;
  enableAutoScrollTrigger?: number;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  isLoading = false,
  onResubmitMessage,
  onStopGeneration,
  hasPendingUploads,
  webSearchingMessageId,
  currentlyEditingMessageId,
  setCurrentlyEditingMessageId,
  enableAutoScrollTrigger,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  useEffect(() => {
    setAutoScrollEnabled(true);
  }, [enableAutoScrollTrigger]);

  useEffect(() => {
    if (autoScrollEnabled && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScrollEnabled]);



  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!bottomRef.current) return;

    if (autoScrollEnabled) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScrollEnabled]);

  const getLastUserMessageForAI = (aiMessageIndex: number): Message | null => {
    for (let i = aiMessageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        return messages[i];
      }
    }
    return null;
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottomNow = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(isAtBottomNow);

    if (isAtBottomNow) {
      setAutoScrollEnabled(true);
    } else {
      setAutoScrollEnabled(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col space-y-4 p-4 overflow-y-auto h-full scrollbar-hide"
    >
      {messages.map((message, index) => (
        <div
          key={message.id}
          ref={(el) => {
            messageRefs.current[message.id] = el;
          }}
        >
          <MessageBubble
            message={message}
            isGenerating={isStreaming && index === messages.length - 1}
            isEditingDisabled={isStreaming}
            onResubmitMessage={(newContent, messageId) => {
              const userIndex = messages.findIndex((m) => m.id === messageId);
              const assistantMessage = messages[userIndex + 1];
              if (assistantMessage && assistantMessage.role === "assistant") {
                onResubmitMessage?.(newContent, messageId, assistantMessage.id);
              }
            }}
            getLastUserMessage={() => getLastUserMessageForAI(index)}
            hasPendingUploads={hasPendingUploads}
            isWebSearching={message.id === webSearchingMessageId}
            currentlyEditingMessageId={currentlyEditingMessageId}
            setCurrentlyEditingMessageId={setCurrentlyEditingMessageId}
          />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};


