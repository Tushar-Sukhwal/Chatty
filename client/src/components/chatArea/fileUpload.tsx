import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Upload,
  File,
  X,
  Image,
  Video,
  FileText,
  Music,
  Send,
} from "lucide-react";
import { MessageApi, FileUploadResponse } from "@/api/messageApi";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (fileData: FileUploadResponse["data"]) => void;
  onCancel: () => void;
  isOpen: boolean;
  preSelectedFile?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onCancel,
  isOpen,
  preSelectedFile,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set up preview when pre-selected file is provided
  useEffect(() => {
    if (preSelectedFile && isOpen) {
      setPreviewFile(preSelectedFile);

      // Create preview URL for images
      if (preSelectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(preSelectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [preSelectedFile, isOpen]);

  // Clean up preview URL when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviewFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, previewUrl]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-8 w-8" />;
    if (mimeType.startsWith("video/")) return <Video className="h-8 w-8" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const response = await MessageApi.uploadFile(file);
      onFileSelect(response.data);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSendFile = () => {
    if (previewFile) {
      handleFileUpload(previewFile);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setPreviewFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setPreviewFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {previewFile ? "Send File" : "Upload File"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {previewFile ? (
          // File Preview Mode
          <div className="space-y-4">
            {previewUrl && previewFile.type.startsWith("image/") ? (
              // Image Preview
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            ) : (
              // Non-image file preview
              <div className="border-2 border-dashed border-gray-300 dark:border-border rounded-lg p-6 text-center">
                {getFileIcon(previewFile.type)}
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-foreground">
                  {previewFile.name}
                </p>
              </div>
            )}

            {/* File Info */}
            <div className="bg-gray-50 dark:bg-muted p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                <span className="font-medium">Name:</span> {previewFile.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                <span className="font-medium">Size:</span>{" "}
                {formatFileSize(previewFile.size)}
              </p>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                <span className="font-medium">Type:</span> {previewFile.type}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendFile}
                disabled={uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90"
              >
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // File Selection Mode
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-muted-foreground mb-4">
                Drag and drop your file here, or
              </p>
              <Button
                onClick={handleBrowseClick}
                disabled={uploading}
                className="mb-4"
              >
                Browse Files
              </Button>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">
                Maximum file size: 10MB
                <br />
                Supported: Images, Videos, Documents, Audio
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        />
      </div>
    </div>
  );
};

export default FileUpload;
