"use client";
import React, {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { X, Loader2, Plus } from "lucide-react";

const MAX_FILES = 5; // Define constant locally

const isImage = (file) => file.type.startsWith("image/");
const isPdf = (file) => file.type === "application/pdf";
const isDoc = (file) =>
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const isText = (file) => file.type === "text/plain";
const isAudio = (file) => file.type.startsWith("audio/");

// Check if file type is supported by backend
const isSupportedFile = (file) => {
    const supportedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "audio/mp3",
        "audio/mpeg",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/x-pn-wav",
        "image/png",
        "image/jpg",
        "image/jpeg"
    ];
    return supportedTypes.includes(file.type);
};

const FileUpload = forwardRef(({ onFilesChange, disabled = false }, ref) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(undefined);
    const prevFilesRef = useRef([]);

    const formatFileSize = (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    useImperativeHandle(ref, () => ({
        triggerFilePicker,
        clearFiles: () => setFiles([]),
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
        // Only call onFilesChange if files actually changed and onFilesChange exists
        if (onFilesChange && files !== prevFilesRef.current) {
            const fileObjects = files.map((f) => f.file);
            onFilesChange(fileObjects);
            prevFilesRef.current = files;
        }
    }, [files, onFilesChange]);

    const triggerFilePicker = () => {
        if (!disabled && files.length < MAX_FILES) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []).filter(isSupportedFile);
        if (!selected.length) {
            alert("Please select supported file types: PDF, DOCX, TXT, MP3, WAV, PNG, JPG, JPEG");
            return;
        }

        const newFiles = [...files];
        selected.forEach((file) => {
            if (newFiles.length < MAX_FILES) {
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                    return;
                }
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

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file) => {
        if (isImage(file)) return "🖼️";
        if (isPdf(file)) return "📄";
        if (isDoc(file)) return "📝";
        if (isText(file)) return "📋";
        if (isAudio(file)) return "🎵";
        return "📎";
    };

    return (
        <div className="w-full">
            {files.length > 0 && (
                <div className="flex gap-2 items-center flex-wrap mt-2 mb-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            onClick={() => !file.loading && setPreviewFile(file.file)}
                            className="relative flex items-center bg-gray-50 rounded-md overflow-hidden border border-gray-200 rounded-full min-w-[140px] max-w-[160px] hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden">
                                {file.loading ? (
                                    <div className="flex items-center justify-center w-full h-full">
                                        <Loader2 className="animate-spin text-[#019A5A] w-4 h-4" />
                                    </div>
                                ) : isImage(file.file) ? (
                                    <img
                                        src={URL.createObjectURL(file.file)}
                                        alt={file.file.name}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex items-center border border-gray-300 justify-center w-full h-full text-[#019A5A] text-lg">
                                        {getFileIcon(file.file)}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    className="absolute top-0 right-0 bg-[#019A5A] hover:bg-red-500 text-white rounded-full p-[2px] m-[2px] transition-colors"
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
                            className="w-12 h-12 rounded-md border border-dashed border-[#019A5A] flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <Plus className="text-[#019A5A]" size={20} />
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
                                    {getFileIcon(previewFile)} {previewFile.type}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatFileSize(previewFile.size)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <input
                type="file"
                accept=".pdf,.docx,.txt,.mp3,.wav,.png,.jpg,.jpeg"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                disabled={disabled}
            />
        </div>
    );
});

FileUpload.displayName = "FileUploader";
export default FileUpload;