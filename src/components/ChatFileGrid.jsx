"use client";
import React from 'react';

export const FileAttachmentGrid = ({
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
          <div className="bg-gray-100 rounded p-2 text-xs text-gray-900 border border-gray-200">
            {file.name || file.fileName || 'File'}
          </div>
        </div>
      ))}
    </div>
  );
};