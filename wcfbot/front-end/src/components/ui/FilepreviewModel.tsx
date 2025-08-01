"use client";
import React from 'react';

interface FilePreviewModelProps {
  previewFile: any;
  onClose: () => void;
}

export const FilePreviewModel: React.FC<FilePreviewModelProps> = ({
  previewFile,
  onClose,
}) => {
  if (!previewFile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-2xl max-h-2xl overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">File Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {previewFile.name || 'File'}
        </div>
      </div>
    </div>
  );
};
