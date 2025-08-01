"use client";
import React from 'react';

interface FileAttachmentGridProps {
  files: any[];
  fileLoadingStates: Record<string, boolean>;
  imageLoadStates: Record<string, boolean>;
  objectUrls: Record<string, string>;
  onPreview: (file: any) => void;
}

export const FileAttachmentGrid: React.FC<FileAttachmentGridProps> = ({
  files,
  fileLoadingStates,
  imageLoadStates,
  objectUrls,
  onPreview,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-2">
      {files.map((file, index) => (
        <div key={index} className="relative">
          <div className="bg-gray-700 rounded p-2 text-xs text-gray-300">
            {file.name || file.fileName || 'File'}
          </div>
        </div>
      ))}
    </div>
  );
};
