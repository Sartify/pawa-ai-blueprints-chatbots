"use client";
import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { X, Loader2, Plus } from "lucide-react";
import { MAX_FILES } from "@/constants/chat";

type UploadedFile = {
  file: File;
  loading: boolean;
};

export interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLDivElement>;
  resetTrigger?: boolean;
}

export interface FileUploadHandle {
  triggerFilePicker: () => void;
}

const isImage = (file: File) => file.type.startsWith("image/");
const isPdf = (file: File) => file.type === "application/pdf";

const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
  ({ onFilesChange, disabled = false, resetTrigger }, ref) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

    const formatFileSize = (size: number) => {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    useImperativeHandle(ref, () => ({
      triggerFilePicker,
    }));

    useEffect(() => {
      if (previewFile) {
        const url = URL.createObjectURL(previewFile);
        setPreviewUrl(url);

        return () => {
          URL.revokeObjectURL(url);
          setPreviewUrl(undefined);
        };
      } else {
        setPreviewUrl(undefined);
      }
    }, [previewFile]);

    useEffect(() => {
      setFiles([]);
    }, [resetTrigger]);

    useEffect(() => {
      if (onFilesChange) {
        onFilesChange(files.map((f) => f.file));
      }
    }, [files, onFilesChange]);

    const triggerFilePicker = () => {
      if (!disabled && files.length < MAX_FILES) {
        fileInputRef.current?.click();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []).filter(isPdf);
      if (!selected.length) return;

      const newFiles = [...files];
      selected.forEach((file) => {
        if (newFiles.length < MAX_FILES) {
          newFiles.push({ file, loading: true });
        }
      });
      setFiles(newFiles);

      // Simulate loading state
      setTimeout(() => {
        setFiles((prev) => prev.map((f) => ({ ...f, loading: false })));
      }, 1200);

      e.target.value = "";
    };

    const removeFile = (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className="w-full">
        {files.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap mt-2 mb-2">
            {files.map((file, index) => (
              <div
                key={index}
                onClick={() => !file.loading && setPreviewFile(file.file)}
                className="relative flex items-center bg-gray-50 rounded-md overflow-hidden border border-gray-200 rounded-full min-w-[140px] max-w-[160px] hover:bg-gray-100 transition-colors"
              >
                <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden">
                  {file.loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 className="animate-spin text-[#022e79] w-4 h-4" />
                    </div>
                  ) : isImage(file.file) ? (
                    <img
                      src={URL.createObjectURL(file.file)}
                      alt={file.file.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center border border-gray-300 justify-center w-full h-full text-[#022e79] text-xs font-medium">
                      {file.file.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-0 right-0 bg-[#022e79] hover:bg-red-500 text-white rounded-full p-[2px] m-[2px] transition-colors"
                    disabled={disabled}
                  >
                    <X size={10} />
                  </button>
                </div>

                <div className="flex flex-col justify-center px-2 py-1 text-gray-700 text-[0.7rem] truncate">
                  <p className="truncate max-w-[120px] font-medium">{file.file.name}</p>
                  <p className="text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                </div>
              </div>
            ))}

            {files.length < MAX_FILES && (
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={disabled}
                className="w-12 h-12 rounded-md border border-dashed border-[#022e79] flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="text-[#022e79]" size={20} />
              </button>
            )}
          </div>
        )}

        {previewFile && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
            onClick={() => setPreviewFile(null)}
          >
            <div
              className="relative max-w-full max-h-full p-4 bg-white rounded-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-4 right-4 text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X size={18} />
              </button>

              {isImage(previewFile) ? (
                <img
                  src={previewUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-[80vh] rounded-md"
                />
              ) : isPdf(previewFile) ? (
                <embed
                  src={previewUrl}
                  type="application/pdf"
                  className="w-full max-w-4xl h-[80vh] rounded-sm"
                />
              ) : (
                <div className="text-gray-700 text-center max-w-xs mx-auto">
                  <p className="mb-2 text-lg font-medium">{previewFile.name}</p>
                  <p className="text-gray-500 mb-4">
                    This file type preview is not supported. Try downloading the file.
                  </p>
                  <a
                    href={previewUrl}
                    download={previewFile.name}
                    className="inline-block px-4 py-2 bg-[#022e79] text-white rounded-md hover:bg-[#022e79]/90 transition-colors"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          disabled={disabled}
        />
      </div>
    );
  }
);

FileUpload.displayName = "FileUploader";
export default FileUpload;
