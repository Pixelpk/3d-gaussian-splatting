"use client";
import * as SPLAT from "gsplat";

export async function convertPlyToSplat(
  plyBuffer: ArrayBuffer,
  filename: string = "model.splat"
) {
  console.log("Converting PLY to SPLAT format...");

  try {
    // 1. Convert ArrayBuffer to Uint8Array for gsplat.js
    const uint8Array = new Uint8Array(plyBuffer);

    // 2. Load the PLY data into a Scene
    const scene = new SPLAT.Scene();

    // Create a data URL for server-side processing (no browser APIs needed)
    const base64 = Buffer.from(uint8Array).toString("base64");
    const dataUrl = `data:application/octet-stream;base64,${base64}`;

    await SPLAT.PLYLoader.LoadAsync(dataUrl, scene);

    console.log("File parsed successfully. Converting to .splat format...");

    // 3. Serialize the scene to the .splat format

    console.log("Conversion complete!");
    scene.saveToFile(filename);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Conversion failed:", errorMessage);
    throw new Error(`PLY to SPLAT conversion failed: ${errorMessage}`);
  }
}
