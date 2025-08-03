import { STORAGE_KEY } from "@/constants/chat";
import { sendMessage as sendMessageService } from "@/services/sendMessageServce";
import { Message, MessageFile } from "@/types/Message";
import { useEffect, useState } from "react";

type SimpleMessage = {
  from: "user" | "agent";
  text: string;
};

export function useTutorChat(initialMessages: SimpleMessage[] = []) {
  const [messages, setMessages] = useState<SimpleMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (err) {
      console.error("[WCFChat] Failed to load history:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.error("[WCFChat] Failed to save history:", err);
    }
  }, [messages]);

  const sendMessage = async (messageText: string, files: MessageFile[]) => {
    console.log("[HOOK] Starting sendMessage with text:", messageText);
    setLoading(true);
    setError(null);
    
    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: messageText }]);

    setMessages((prev) => [...prev, { from: "agent", text: "" }]);

    let accumulatedText = "";
    let chunkCount = 0;

    try {
      await sendMessageService({
        message: messageText,
        files,
        onChunk: (chunk: string) => {
          chunkCount++;
          console.log(`[HOOK] Received chunk ${chunkCount}:`, JSON.stringify(chunk));
          
          // ✅ SOLUTION: Accumulate chunks properly
          accumulatedText += chunk;
          console.log(`[HOOK] Accumulated text:`, JSON.stringify(accumulatedText));
          console.log(`[HOOK] Accumulated length:`, accumulatedText.length);
          
          // Update the assistant message with accumulated text
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.from === "agent") {
              lastMessage.text = accumulatedText;
            }
            return newMessages;
          });
        }
      });
      
      console.log("[HOOK] Streaming completed, total chunks received:", chunkCount);
      console.log("[HOOK] Final accumulated text:", JSON.stringify(accumulatedText));
      
    } catch (err: any) {
      console.error("[HOOK] Error in sendMessage:", err);
      setError(err.message || "Unknown error");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      console.log("[HOOK] sendMessage completed");
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory
  };
}