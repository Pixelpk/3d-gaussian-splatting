/**
 * Client-side utility to extract video thumbnail
 * This should be used in the component
 */
export function extractVideoThumbnailClientSide(
  videoFile: File,
  timeInSeconds: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timeInSeconds, video.duration - 0.1);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create thumbnail blob"));
          }
          video.remove();
          canvas.remove();
        },
        "image/jpeg",
        0.9
      );
    };

    video.onerror = () => {
      reject(new Error("Failed to load video"));
      video.remove();
      canvas.remove();
    };

    video.src = URL.createObjectURL(videoFile);
  });
}
