import { NextResponse } from "next/server";

/**
 * Brave Search - GET Endpoint
 * @author NeoTech
 * @version 1.0.0
 * @returns Brave search results.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const API_KEY = process.env.SEARCH_API_KEY;
  const API_URL = `https://api.search.brave.com/res/v1/web/search`;

  if (!API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const braveRes = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&count=3`, {
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": API_KEY!,
      },
    });

    if (!braveRes.ok) {
      return NextResponse.json({ error: "Brave API error" }, { status: braveRes.status });
    }

    const data = await braveRes.json();
    return NextResponse.json(data.web || []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}