import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { CaptureCardProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCapture } from "@/actions/captureActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadProgress } from "@/components/_shared/UploadProgress";

export function CaptureCard({
  id,
  title,
  thumbnail,
  status: initialStatus,
  folderPath: initialFolderPath,
}: CaptureCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [folderPath, setFolderPath] = useState(initialFolderPath);
  const [thumbnail_, setThumbnail] = useState(thumbnail);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Poll for updates if status is not completed (status !== 2)
  useEffect(() => {
    if (status === 2 && folderPath) {
      // Already completed, no need to poll
      return;
    }

    const pollCapture = async () => {
      try {
        const result = await getCapture(id);
        if (result.success && result.data) {
          console.log("Polling capture:", id, result.data);
          setStatus(result.data.status);
          // Handle both folderPath and folder_path
          setFolderPath(result.data.folderPath || result.data.folder_path);
          if (result.data.thumbnail) {
            setThumbnail(result.data.thumbnail);
          }

          // Stop polling if completed with folderPath
          if (
            result.data.status === 2 &&
            (result.data.folderPath || result.data.folder_path)
          ) {
            clearInterval(pollingInterval);
          }
        }
      } catch (error) {
        console.error("Error polling capture:", error);
      }
    };

    // Poll every 5 seconds
    const pollingInterval = setInterval(pollCapture, 5000);
    pollCapture(); // Call immediately

    return () => clearInterval(pollingInterval);
  }, [id, status, folderPath]);
  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return "Processing";
      case 1:
        return "Failed";
      case 2:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const statusLabel = getStatusLabel(status);

  // Use proxy for external URLs to avoid CORS and configuration issues
  const getImageSrc = (url: string | undefined) => {
    if (!url) return "";
    // If it's an external URL (S3), use our proxy
    if (url.startsWith("http")) {
      return `/api/proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Only make card clickable if completed and has folderPath
  const isClickable = status === 2 && folderPath;
  const isProcessing = status === 0 || (status === 2 && !folderPath);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isClickable && isProcessing) {
      e.preventDefault();
      setShowProgressModal(true);
    }
  };

  const handleProgressComplete = () => {
    // Modal will be closed manually by user
  };

  const handleCloseModal = () => {
    setShowProgressModal(false);
  };

  const cardContent = (
    <>
      <Card
        className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-ring transition-all"
        onClick={handleCardClick}
      >
        <div className="relative aspect-square bg-muted">
          {thumbnail_ ? (
            <Image
              src={getImageSrc(thumbnail_)}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Status overlay - show for non-completed or completed without folderPath */}
          {(status !== 2 || !folderPath) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex items-center gap-2">
                {status === 0 && (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                )}
                <span className="text-white text-sm font-medium">
                  {statusLabel}
                </span>
              </div>
            </div>
          )}

          {/* Image icon in corner */}
          <div className="absolute bottom-2 right-2 h-6 w-6 bg-muted/80 backdrop-blur-sm rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-foreground/60" />
          </div>
        </div>

        <div className="p-3 bg-card">
          <p className="text-sm font-medium text-foreground truncate">
            {title}
          </p>
        </div>
      </Card>

      {/* Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent className="sm:max-w-150 bg-card border-border p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-lg font-semibold">
              Processing Status
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-8">
            <UploadProgress
              fileName={title}
              captureId={id}
              onComplete={handleProgressComplete}
              onClose={handleCloseModal}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (isClickable) {
    return (
      <Link
        href={`/iframe-viewer?url=${encodeURIComponent(
          folderPath + "/output.splat"
        )}`}
      >
        {cardContent}
      </Link>
    );
  }

  return <div>{cardContent}</div>;
}
