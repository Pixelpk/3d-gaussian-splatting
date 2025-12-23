"use server";

// These functions now call our API routes instead of directly calling Kiri
// This keeps the API key secure while allowing direct uploads from the client

export async function getModelStatus(serialize: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || ""
      }/api/kiri/status?serialize=${serialize}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to get status",
      };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getModelZip(serialize: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || ""
      }/api/kiri/model-zip?serialize=${serialize}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || "Failed to get model zip",
      };
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
