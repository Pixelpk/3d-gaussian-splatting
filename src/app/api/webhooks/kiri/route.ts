import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Capture from "@/lib/models/Capture";
import { getModelZip } from "@/actions/uploadActions";
import { convertPlyWithLambda } from "@/actions/lambdaActions";

function validateSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const body = JSON.parse(rawBody);

    console.log("Kiri webhook received:", body);
    console.log("Webhook timestamp:", new Date().toISOString());

    // Extract data from webhook payload
    const { status, serialize } = body;

    if (!serialize) {
      return NextResponse.json(
        { success: false, error: "Missing serialize ID" },
        { status: 400 }
      );
    }

    // Connect to database and update the capture entry
    await connectDB();

    const updateData: { status: number; folderPath?: string } = { status };

    // If status is 2 (completed), get model and convert it
    if (status === 2) {
      console.log("Status is 2, fetching model and converting...");

      // Get the model zip URL
      const modelZipResult = await getModelZip(serialize);

      if (!modelZipResult.success || !modelZipResult.data) {
        console.error("Failed to get model zip:", modelZipResult.error);
        return NextResponse.json(
          { success: false, error: "Failed to get model zip" },
          { status: 500 }
        );
      }

      const modelUrl = modelZipResult.data?.modelUrl;
      console.log("Model URL:", modelUrl);

      // Convert PLY with Lambda
      const conversionResult = await convertPlyWithLambda(modelUrl);

      if (!conversionResult.success || !conversionResult.data) {
        console.error("Failed to convert model:", conversionResult.error);
        return NextResponse.json(
          { success: false, error: "Failed to convert model" },
          { status: 500 }
        );
      }

      const folderPath = conversionResult.data.folder_path;
      console.log("Conversion successful, folder path:", folderPath);

      // Add folder_path to update data
      updateData.folderPath = folderPath;
    }

    const updatedCapture = await Capture.findOneAndUpdate(
      { serialize: serialize },
      updateData,
      { new: true }
    );

    if (!updatedCapture) {
      console.error(`Capture not found with serialize: ${serialize}`);
      return NextResponse.json(
        { success: false, error: "Capture not found" },
        { status: 404 }
      );
    }

    console.log(`Updated capture ${updatedCapture._id} with status ${status}`);

    return NextResponse.json(
      {
        success: true,
        message: "Webhook received and processed",
        captureId: updatedCapture._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
