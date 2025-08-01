import { useTutorChat } from "./useHandleSendMessage";
import { Message, MessageFile } from "@/types/Message";

export function useChat() {
  const {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory
  } = useTutorChat();

  const handleSendMessage = async (
    text: string,
    model: string,
    files: MessageFile[] = [],
    isResubmit?: boolean,
    regenerateId?: string
  ) => {
    await sendMessage(text, files);
  };

  const handleResubmitMessage = (
    newContent: string,
    userMessageId: string,
    assistantMessageId: string
  ) => {
    // For now, just send the new content
    sendMessage(newContent, []);
  };

  const handleRegenerateResponse = (messageId: string) => {
    // For now, just clear and resend the last user message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, []);
    }
  };

  const clearMessages = () => {
    clearHistory();
  };

  // Convert messages to the expected format
  const convertedMessages = messages.map((msg, index) => ({
    id: `msg-${index}`,
    role: msg.from === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.text,
    timestamp: new Date(),
    isGenerating: loading && index === messages.length - 1 && msg.from === 'agent',
    error: false,
    hasPendingUploads: false,
  }));

  return {
    messages: convertedMessages,
    isStreaming: loading,
    clearMessages,
    regeneratingMessageId: null,
    handleSendMessage,
    handleResubmitMessage,
    handleRegenerateResponse,
    options: { model: "default" },
    setOptions: () => {},
    stopGeneration: () => {},
    isReceivingChunks: loading,
    hasPendingUploads: false,
    setHasPendingUploads: () => {},
    webSearchingMessageId: null,
    handleVoiceToVoiceMessage: () => {},
    isVoiceMode: false,
  };
} 