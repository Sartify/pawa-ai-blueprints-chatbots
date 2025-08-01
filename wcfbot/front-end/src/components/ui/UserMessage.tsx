"use client";
import React from "react";
import { SquarePen } from "lucide-react";
import Markdown from "@/components/markdown";
import { FileAttachmentGrid } from "./FileAttachmentGrid";
import { MicRecorderButton } from "./micRecorderButton";

interface UserMessageProps {
  message: any;
  isEditing: boolean;
  editedContent: string;
  isEditingDisabled: boolean;
  currentlyEditingMessageId: string | null;
  setIsEditing: (val: boolean) => void;
  setEditedContent: (val: string) => void;
  setCurrentlyEditingMessageId: (id: string | null) => void;
  handleResubmit: () => void;
  fileLoadingStates: Record<string, boolean>;
  imageLoadStates: Record<string, boolean>;
  objectUrls: Record<string, string>;
  setPreviewFile: (file: any) => void;
  isEditingAnother: boolean;
  isAnyRegenerating: boolean;
  isGenerating: boolean;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  isEditing,
  editedContent,
  isEditingDisabled,
  // currentlyEditingMessageId,
  setIsEditing,
  setEditedContent,
  setCurrentlyEditingMessageId,
  handleResubmit,
  fileLoadingStates,
  imageLoadStates,
  objectUrls,
  setPreviewFile,
  isAnyRegenerating,
  isEditingAnother,
  isGenerating,
}) => (
  <div
    className={`relative ${
      isEditing ? "w-full" : "max-w-[calc(80%-15px)]"
    } group transition-all duration-200 flex flex-col items-end gap-2`}
  >
    {!isEditing ? (
      <>
        {Array.isArray(message.files) && message.files.length > 0 && (
          <FileAttachmentGrid
            files={message.files}
            fileLoadingStates={fileLoadingStates}
            imageLoadStates={imageLoadStates}
            objectUrls={objectUrls}
            onPreview={setPreviewFile}
          />
        )}

        <div className="flex items-start gap-2">
          <div
            className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isEditingDisabled ? "pointer-events-none" : ""
            }`}
          >
            <button
              onClick={() => {
                setIsEditing(true);
                setCurrentlyEditingMessageId(message.id);
              }}
              disabled={
                isEditingAnother ||
                isGenerating ||
                isEditingDisabled ||
                isAnyRegenerating
              }
              className={`mt-1 ${
                isEditingDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:scale-110"
              } transition-transform`}
            >
              <SquarePen className="w-[13px] h-[13px] text-gray-600 hover:text-[#022e79]" />
            </button>
          </div>

          <div className="bg-[#022e79] text-white rounded-bl-lg rounded-tl-lg rounded-br-lg p-3 shadow-md overflow-hidden max-w-full">
            <div className="text-[0.9rem] overflow-hidden break-words break-all">
              <Markdown content={message.content} />
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="flex flex-col gap-2 p-2 w-full">
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className={`w-full p-2 rounded-bl-md rounded-tl-md rounded-br-md bg-[#022e79] text-white min-h-[200px] resize-none overflow-wrap-anywhere focus:outline-none focus:ring-1 focus:ring-[#FFA200] focus:border-[#FFA200]${
            isEditingDisabled ? "opacity-70" : ""
          }`}
          autoFocus
          disabled={isEditingDisabled}
        />
        <div className="flex justify-end gap-2">
          <MicRecorderButton
            onTranscription={(text) => {
              setEditedContent(text);
            }}
            disabled={isEditingDisabled}
          />
          <button
            onClick={() => {
              setIsEditing(false);
              setEditedContent(message.content);
              setCurrentlyEditingMessageId(null);
            }}
            disabled={isEditingDisabled}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleResubmit}
            disabled={isEditingDisabled}
            className="px-3 py-1 text-sm bg-[#FFA200] text-white rounded hover:bg-[#FFA200]/80 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    )}
  </div>
);
