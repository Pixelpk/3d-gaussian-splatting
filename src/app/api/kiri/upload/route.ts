import { NextRequest, NextResponse } from "next/server";

// Use Edge Runtime for higher body size limits (300MB vs 4.5MB)
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const API_KEY = process.env.KIRI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Parse formData (Edge runtime supports up to middlewareClientMaxBodySize)
    const formData = await request.formData();

    // Forward the request to Kiri API with the auth header
    const response = await fetch(
      "https://api.kiriengine.app/api/v1/open/3dgs/image",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.msg || `Kiri API error: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error("Kiri upload proxy error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload to Kiri API",
      },
      { status: 500 }
    );
  }
}
