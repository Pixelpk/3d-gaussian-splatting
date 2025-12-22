"use server";

import { uploadToS3, uploadBufferToS3 } from "@/lib/s3";

export async function uploadThumbnailToS3(formData: FormData) {
  try {
    const thumbnailFile = formData.get("thumbnail") as File;
    if (!thumbnailFile) {
      return { success: false, error: "No thumbnail file provided" };
    }

    const result = await uploadToS3(thumbnailFile, "thumbnails");
    return result;
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload thumbnail",
    };
  }
}

export async function uploadThumbnailBufferToS3(
  buffer: ArrayBuffer,
  fileName: string
) {
  try {
    const nodeBuffer = Buffer.from(buffer);
    const result = await uploadBufferToS3(
      nodeBuffer,
      fileName,
      "image/jpeg",
      "thumbnails"
    );
    return result;
  } catch (error) {
    console.error("Error uploading thumbnail buffer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload thumbnail",
    };
  }
}
