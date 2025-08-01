"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useCopyToClipboard } from "@/components/copy-to-clipboard";
import { Message } from "@/types/Message";
import { UserMessage } from "../ui/UserMessage";
import { AssistantMessage } from "../ui/AssistantMessage";
import { FilePreviewModel } from "../ui/FilepreviewModel";
import { useSpeech } from "@/hook/useSpeech";

interface MessageBubbleProps {
  message: Message;
  isEditingDisabled: boolean;
  isGenerating: boolean;
  onResubmitMessage?: (newContent: string, messageId: string) => void;
  getLastUserMessage?: () => Message | null;
  onStopGeneration?: () => void;
  hasPendingUploads?: boolean;
  isWebSearching?: boolean;
  currentlyEditingMessageId: string | null;
  setCurrentlyEditingMessageId: (id: string | null) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGenerating,
  isEditingDisabled,
  onResubmitMessage,
  getLastUserMessage,
  isWebSearching,
  currentlyEditingMessageId,
  setCurrentlyEditingMessageId,
}) => {
  const isUser = message.role === "user";

  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fileLoadingStates, setFileLoadingStates] = useState<Record<string, boolean>>({});
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [previewFile, setPreviewFile] = useState<any>(null);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  useEffect(() => {
    if (!isUser && !isGenerating) {
      const timer = setTimeout(() => setShowActions(true), 500);
      return () => clearTimeout(timer);
    } else if (isGenerating) {
      setShowActions(false);
    }
  }, [message.content, isUser, isGenerating]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && previewFile) {
        setPreviewFile(null);
      }
    };

    if (previewFile) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [previewFile]);

  useEffect(() => {
    if (isEditingDisabled && isEditing) {
      setIsEditing(false);
      setEditedContent(message.content);
    }
  }, [isEditingDisabled, message.content, isEditing]);

  useEffect(() => {
    if (message.files && message.files.length > 0 && !isGenerating) {
      const newFileLoadingStates: Record<string, boolean> = {};
      const newImageLoadStates: Record<string, boolean> = {};
      const newObjectUrls: Record<string, string> = {};

      message.files.forEach((file) => {
        if (file.fileUrl) {
          newFileLoadingStates[file.fileUrl] = true;
          newImageLoadStates[file.fileUrl] = false;
          if (file.fileType.startsWith("image/")) {
            newObjectUrls[file.fileUrl] = file.fileUrl;
          }
        }
      });

      setFileLoadingStates(newFileLoadingStates);
      setImageLoadStates(newImageLoadStates);
      setObjectUrls(newObjectUrls);
    }
  }, [message.files, isGenerating]);

  const handleResubmit = useCallback(() => {
    if (onResubmitMessage && editedContent !== message.content) {
      console.log("Calling onResubmitMessage!");
      onResubmitMessage(editedContent, message.id);
      setIsEditing(false);
      setCurrentlyEditingMessageId(null);
      console.log("Calling onResubmitMessage here is message id!", message.id);
    } else {
      console.log("onResubmitMessage is missing or content is unchanged!....");
    }
  }, [onResubmitMessage, editedContent, message.content]);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const getPairedUserMessage = useCallback((): Message | null => {
    if (isUser) return message;
    return getLastUserMessage?.() || null;
  }, [isUser, message, getLastUserMessage]);

  const {
    isLoading: speechLoading,
    isPlaying,
    isOtherPlaying,
    handlePlayPause,
    // error,
  } = useSpeech({ text: message.content, messageId: message.id });

  return (
    <>
      <div
        className={`flex items-start ${
          isUser ? "justify-end" : "justify-start"
        } my-2`}
      >
        {isUser ? (
          <UserMessage
            message={message}
            isEditing={isEditing}
            editedContent={editedContent}
            isEditingDisabled={isEditingDisabled}
            currentlyEditingMessageId={currentlyEditingMessageId}
            setIsEditing={setIsEditing}
            setEditedContent={setEditedContent}
            setCurrentlyEditingMessageId={setCurrentlyEditingMessageId}
            handleResubmit={handleResubmit}
            fileLoadingStates={fileLoadingStates}
            imageLoadStates={imageLoadStates}
            objectUrls={objectUrls}
            setPreviewFile={setPreviewFile}
            isEditingAnother={
              currentlyEditingMessageId !== null &&
              currentlyEditingMessageId !== message.id
            }
            isAnyRegenerating={false}
            isGenerating={isGenerating}
          />
        ) : (
          <AssistantMessage
            message={message}
            isGenerating={isGenerating}
            hasPendingUploads={message.hasPendingUploads}
            isWebSearching={isWebSearching}
            showActions={showActions}
            isCopied={isCopied}
            handleCopy={() => copyToClipboard(message.content)}
            speechLoading={speechLoading}
            isPlaying={isPlaying}
            isOtherPlaying={isOtherPlaying}
            speechHandlePlay={handlePlayPause}
          />
        )}
      </div>

      {/* <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        userMessage={isUser ? message : getPairedUserMessage()}
        aiResponse={!isUser ? message : null}
      /> */}

      <FilePreviewModel
        previewFile={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </>
  );
};
