import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith("https://res.cloudinary.com/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // Use basic auth with Cloudinary API key/secret for authenticated delivery
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      // Try without auth for public files
      const publicResponse = await fetch(url);
      if (!publicResponse.ok) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      const buffer = await publicResponse.arrayBuffer();
      const contentType = url.endsWith(".pdf") ? "application/pdf" : (publicResponse.headers.get("content-type") || "application/octet-stream");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": "inline",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType = url.endsWith(".pdf") ? "application/pdf" : (response.headers.get("content-type") || "application/octet-stream");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
