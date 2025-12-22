"use server";

import connectDB from "@/lib/db";
import Capture from "@/lib/models/Capture";

export async function createCapture(data: {
  title: string;
  thumbnail?: string;
  file?: string;
  serialize?: string;
}) {
  try {
    await connectDB();

    const capture = await Capture.create({
      title: data.title,
      status: 0, // 0 = processing
      thumbnail: data.thumbnail,
      file: data.file,
      serialize: data.serialize,
    });

    return { success: true, data: JSON.parse(JSON.stringify(capture)) };
  } catch (error) {
    console.error("Error creating capture:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create capture",
    };
  }
}

export async function updateCapture(
  id: string,
  data: {
    status?: number;
    thumbnail?: string;
    file?: string;
    serialize?: string;
  }
) {
  try {
    await connectDB();

    const capture = await Capture.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!capture) {
      return { success: false, error: "Capture not found" };
    }

    return { success: true, data: JSON.parse(JSON.stringify(capture)) };
  } catch (error) {
    console.error("Error updating capture:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update capture",
    };
  }
}

export async function getCapture(id: string) {
  try {
    await connectDB();

    const capture = await Capture.findById(id);

    if (!capture) {
      return { success: false, error: "Capture not found" };
    }

    return { success: true, data: JSON.parse(JSON.stringify(capture)) };
  } catch (error) {
    console.error("Error getting capture:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get capture",
    };
  }
}

export async function getAllCaptures() {
  try {
    await connectDB();

    const captures = await Capture.find({}).sort({ createdAt: -1 });

    return { success: true, data: JSON.parse(JSON.stringify(captures)) };
  } catch (error) {
    console.error("Error getting captures:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get captures",
    };
  }
}
