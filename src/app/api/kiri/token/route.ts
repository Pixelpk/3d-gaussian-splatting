import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 10; // Max requests per window
const WINDOW_MS = 60000; // 1 minute window

// Token cache to minimize key exposure (cleared every 5 minutes)
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_CACHE_MS = 5 * 60 * 1000; // 5 minutes

function getClientIP(request: NextRequest): string {
  // Get IP from various headers (Vercel provides x-forwarded-for)
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validate origin (only allow requests from your domain)
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000",
      "http://localhost:3001",
    ].filter(Boolean);

    const isValidOrigin = allowedOrigins.some(
      (allowed) => origin === allowed || referer?.startsWith(allowed || "")
    );

    if (!isValidOrigin && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized origin" },
        { status: 403 }
      );
    }

    // Return cached token if still valid
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
      return NextResponse.json({ token: cachedToken.token });
    }

    // Generate new token
    const API_KEY = process.env.KIRI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Cache the token
    cachedToken = {
      token: API_KEY,
      expiresAt: Date.now() + TOKEN_CACHE_MS,
    };

    return NextResponse.json({ token: API_KEY });
  } catch (error) {
    console.error("Token fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 500 }
    );
  }
}
