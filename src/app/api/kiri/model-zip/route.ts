import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const API_KEY = process.env.KIRI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const serialize = searchParams.get("serialize");

    if (!serialize) {
      return NextResponse.json(
        { error: "Missing serialize parameter" },
        { status: 400 }
      );
    }

    // Forward the request to Kiri API with the auth header
    const response = await fetch(
      `https://api.kiriengine.app/api/v1/open/model/getModelZip?serialize=${serialize}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
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
    console.error("Kiri model zip proxy error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get model zip from Kiri API",
      },
      { status: 500 }
    );
  }
}
