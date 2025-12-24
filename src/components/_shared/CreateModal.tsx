"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CloudUpload, CircleHelp } from "lucide-react";
import { CreateModalProps } from "@/types";
import { useRef, useState } from "react";
import { UploadProgress } from "./UploadProgress";
import { createCapture } from "@/actions/captureActions";
import { uploadThumbnailBufferToS3 } from "@/actions/s3Actions";
import { extractVideoThumbnailClientSide } from "@/lib/videoThumbnail";

export function CreateModal({
  isOpen,
  onOpenChange,
  onUploadComplete,
}: CreateModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [serialize, setSerialize] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [captureId, setCaptureId] = useState<string | null>(null);

  const isVideoFile = (file: File) => {
    return file.type.startsWith("video/");
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
    if (files.length === 0) {
      return { valid: false, error: "No files selected" };
    }

    const videoFiles = files.filter(isVideoFile);
    const imageFiles = files.filter(isImageFile);

    // Check if mixing videos and images
    if (videoFiles.length > 0 && imageFiles.length > 0) {
      return {
        valid: false,
        error:
          "Cannot upload videos and images together. Please select either videos or images.",
      };
    }

    // Check if multiple videos
    if (videoFiles.length > 1) {
      return {
        valid: false,
        error: "Only one video can be uploaded at a time.",
      };
    }

    return { valid: true };
  };

  const handleFilesSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validation = validateFiles(fileArray);

    if (!validation.valid) {
      setError(validation.error || "Invalid file selection");
      setSelectedFiles([]);
      return;
    }

    setError(null);
    setSelectedFiles(fileArray);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelect(files);
    }
  };

  const handleNext = async () => {
    if (selectedFiles.length === 0) return;
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Generate and upload thumbnail
      let thumbnailUrl: string | undefined;
      const hasVideo = selectedFiles.some(isVideoFile);

      if (hasVideo) {
        // Extract video thumbnail
        setUploadProgress(10);
        const thumbnailBlob = await extractVideoThumbnailClientSide(
          selectedFiles[0]
        );
        const thumbnailBuffer = await thumbnailBlob.arrayBuffer();
        const thumbnailFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.jpg`;

        const uploadResult = await uploadThumbnailBufferToS3(
          thumbnailBuffer,
          thumbnailFileName
        );

        if (uploadResult.success && uploadResult.url) {
          thumbnailUrl = uploadResult.url;
        }
      } else {
        // Use first image as thumbnail
        setUploadProgress(10);
        const firstImage = selectedFiles[0];
        const thumbnailBuffer = await firstImage.arrayBuffer();
        const thumbnailFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.jpg`;

        const uploadResult = await uploadThumbnailBufferToS3(
          thumbnailBuffer,
          thumbnailFileName
        );

        if (uploadResult.success && uploadResult.url) {
          thumbnailUrl = uploadResult.url;
        }
      }

      // Step 2: Prepare and upload to Kiri API
      setUploadProgress(20);
      const formData = new FormData();

      if (hasVideo) {
        formData.append("videoFile", selectedFiles[0]);
      } else {
        selectedFiles.forEach((file) => {
          formData.append("imagesFiles", file);
        });
      }

      formData.append("isMesh", "0");
      formData.append("isMask", "0");

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 5;
        });
      }, 500);

      // Get API key from backend (with rate limiting and origin validation)
      const tokenResponse = await fetch("/api/kiri/token");

      if (!tokenResponse.ok) {
        clearInterval(progressInterval);
        const errorData = await tokenResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get upload token");
      }

      const { token } = await tokenResponse.json();

      // Upload directly to Kiri API from frontend (bypasses all Vercel limits)
      const kiriEndpoint = hasVideo
        ? "https://api.kiriengine.app/api/v1/open/3dgs/video"
        : "https://api.kiriengine.app/api/v1/open/3dgs/image";

      const response = await fetch(kiriEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || "Upload to Kiri API failed");
      }

      const result = await response.json();

      if (result.data) {
        setUploadProgress(85);

        // Step 3: Create database entry only after successful API response
        const captureResult = await createCapture({
          title: title.trim(),
          thumbnail: thumbnailUrl,
          serialize: result.data?.serialize,
        });

        if (!captureResult.success || !captureResult.data) {
          throw new Error(captureResult.error || "Failed to create capture");
        }

        setCaptureId(captureResult.data._id);
        if (result.data?.serialize) {
          setSerialize(result.data.serialize);
        }
        setUploadProgress(100);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during upload"
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadComplete = () => {
    // Don't auto-close, let user close manually
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsUploading(false);
    setSelectedFiles([]);
    setSerialize(null);
    setUploadProgress(0);
    setTitle("");
    setCaptureId(null);
    setError(null);
    // Trigger refetch on parent
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 bg-card border-border p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Create</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-8">
          {isUploading ? (
            <UploadProgress
              fileName={
                selectedFiles.length === 1
                  ? selectedFiles[0].name
                  : `${selectedFiles.length} files`
              }
              captureId={captureId}
              onComplete={handleUploadComplete}
              onClose={handleClose}
            />
          ) : (
            <>
              {/* Title Input */}
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2"
                >
                  Title
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter capture title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Upload Area */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="video/mp4,video/quicktime,image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/tiff"
                multiple
              />
              <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-16 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer group ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className="rounded-full p-4 bg-background/50 group-hover:bg-background transition-colors">
                  <CloudUpload className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                  {error ? (
                    <div className="text-destructive">
                      <p className="text-sm font-medium mb-1">Upload Error</p>
                      <p className="text-xs">{error}</p>
                    </div>
                  ) : selectedFiles.length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-foreground mb-2">
                        {selectedFiles.length} file
                        {selectedFiles.length > 1 ? "s" : ""} selected
                      </p>
                      <div className="max-h-24 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <p
                            key={index}
                            className="text-xs text-muted-foreground truncate"
                          >
                            {file.name}
                          </p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Drop files in this area or click to select
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        1 Video (MP4, MOV) OR Multiple Images (JPG, PNG, GIF,
                        BMP, TIFF)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Help and FAQ Links */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <CircleHelp className="h-4 w-4" />
                  Help
                </button>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <CircleHelp className="h-4 w-4" />
                  FAQ
                </button>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          {!isUploading && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {selectedFiles.length > 0 && (
                <Button onClick={handleNext}>Next</Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
