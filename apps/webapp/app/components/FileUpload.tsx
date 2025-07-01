import { useState } from "react";
import { Button } from "@justchat/ui/components/button";

interface FileUploadProps {
  onUploadComplete?: (result: {
    success: boolean;
    fileId?: string;
    metadata?: any;
    error?: string;
  }) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
}

export function FileUpload({
  onUploadComplete,
  disabled = false,
  acceptedTypes,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/files/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadProgress(100);
        onUploadComplete?.(result);
      } else {
        onUploadComplete?.(result);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      onUploadComplete?.({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset the input
      event.target.value = "";
    }
  };

  const acceptString = acceptedTypes
    ? acceptedTypes.join(",")
    : ".pdf,.docx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp";

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          id="file-upload"
          onChange={handleFileUpload}
          disabled={disabled || isUploading}
          accept={acceptString}
          className="hidden"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            disabled={disabled || isUploading}
            className="cursor-pointer"
            asChild
          >
            <span>{isUploading ? "Uploading..." : "Upload File"}</span>
          </Button>
        </label>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Uploading and processing file... This may take a moment for larger
            files.
          </p>
        </div>
      )}
    </div>
  );
}
