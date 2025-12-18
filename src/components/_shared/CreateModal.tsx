"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CloudUpload, CircleHelp } from "lucide-react";
import { CreateModalProps } from "@/types";
import { useRef, useState } from "react";
import { UploadProgress } from "./UploadProgress";
import { uploadImagesToKiri } from "@/actions/uploadActions";

export function CreateModal({ isOpen, onOpenChange }: CreateModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [serialize, setSerialize] = useState<string | null>(null);

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
    console.log(
      "Files selected:",
      fileArray.map((f) => f.name)
    );
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

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();

    // Check if it's a video or images
    const hasVideo = selectedFiles.some(isVideoFile);

    if (hasVideo) {
      // Send single video as videoFile
      formData.append("videoFile", selectedFiles[0]);
    } else {
      // Send multiple images as imagesFiles
      selectedFiles.forEach((file) => {
        formData.append("imagesFiles", file);
      });
    }

    // Append standard 3DGS settings
    formData.append("isMesh", "0");
    formData.append("isMask", "1");

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await uploadImagesToKiri(formData);
      clearInterval(progressInterval);
      console.log("Upload result: ", response);

      if (response.success) {
        console.log("Upload successful:", response.data);
        // Extract serialize from response
        if (response.data?.serialize) {
          setSerialize(response.data.serialize);
        }
      } else {
        console.error("Upload failed:", response.error);
        setIsUploading(false);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  const handleUploadComplete = () => {
    setTimeout(() => {
      onOpenChange(false);
      setIsUploading(false);
      setSelectedFiles([]);
      setSerialize(null);
      setUploadProgress(0);
    }, 5000);
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
              serialize={serialize}
              onComplete={handleUploadComplete}
            />
          ) : (
            <>
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!isUploading && selectedFiles.length > 0 && (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
