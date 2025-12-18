import { useEffect, useState } from "react";
import { Check, Loader2, X, Clock } from "lucide-react";
import { getModelStatus, getModelZip } from "@/actions/uploadActions";

interface UploadProgressProps {
  fileName: string;
  serialize: string | null;
  onComplete?: () => void;
}

const STATUS_MESSAGES: Record<string, string> = {
  "-1": "Uploading files...",
  "0": "Processing your model...",
  "1": "Processing failed",
  "2": "Successfully completed!",
  "3": "Queued for processing...",
  "4": "Upload expired",
};

export function UploadProgress({
  fileName,
  serialize,
  onComplete,
}: UploadProgressProps) {
  const [status, setStatus] = useState<number>(-1);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serialize) return;

    const pollStatus = async () => {
      try {
        const response = await getModelStatus(serialize);

        if (response.success && response.data) {
          const newStatus = response.data.status;
          setStatus(newStatus);

          // If successful, get the model URL
          if (newStatus === 2) {
            clearInterval(pollingInterval);
            const zipResponse = await getModelZip(serialize);

            if (zipResponse.success && zipResponse.data) {
              const url = zipResponse.data.modelUrl;
              setModelUrl(url);
              console.log("Model URL:", url);

              // Trigger download
              if (url) {
                const link = document.createElement("a");
                link.href = url;
                link.download = `model_${serialize}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }

              if (onComplete) {
                setTimeout(onComplete, 500);
              }
            }
          } else if (newStatus === 1 || newStatus === 4) {
            // Failed or Expired
            clearInterval(pollingInterval);
            setError(STATUS_MESSAGES[String(newStatus)]);
          }
        } else {
          setError(response.error || "Failed to get status");
        }
      } catch (err) {
        console.error("Polling error:", err);
        setError("Failed to check status");
      }
    };

    // Start polling every 3 seconds
    const pollingInterval = setInterval(pollStatus, 3000);
    pollStatus(); // Call immediately

    return () => {
      clearInterval(pollingInterval);
    };
  }, [serialize, onComplete]);

  const getProgressPercentage = () => {
    switch (status) {
      case -1:
        return 10; // Uploading
      case 0:
        return 50; // Processing
      case 1:
        return 100; // Failed (show as complete but with error)
      case 2:
        return 100; // Successful
      case 3:
        return 25; // Queuing
      case 4:
        return 100; // Expired (show as complete but with error)
      default:
        return 0;
    }
  };

  const progress = getProgressPercentage();
  const statusMessage = STATUS_MESSAGES[String(status)] || "Processing...";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{statusMessage}</p>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* File Info */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        {error || status === 1 || status === 4 ? (
          <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <X className="h-4 w-4 text-red-500" />
          </div>
        ) : status === 2 ? (
          <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        ) : status === 3 ? (
          <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {error || statusMessage}
          </p>
        </div>
      </div>

      {modelUrl && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-xs text-green-600 dark:text-green-400">
            Model downloaded successfully! Check your downloads folder.
          </p>
        </div>
      )}
    </div>
  );
}
