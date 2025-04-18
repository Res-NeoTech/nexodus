import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Brave Search - GET Endpoint
 * @author NeoTech
 * @version 1.1.0
 * @returns Brave search results.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  let resultCount: number = 3;

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const API_KEY = process.env.SEARCH_API_KEY;
  const API_URL: string = `https://api.search.brave.com/res/v1/web/search`;

  if (!API_KEY) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (token) {
      const request = await fetch(`https://nexapi.maksym.ch/crud/user`, {
        method: "GET",
        headers: {
          "x-nexodus-token": `Nexodus ${token.value}`
        }
      })

      if(request.status === 200) {
        resultCount = 10;
      }
    }
  } catch {
    console.error("Something went wrong, proceeding with standard resultCount");
  }

  try {
    const braveRes = await fetch(`${API_URL}?q=${encodeURIComponent(query)}&count=${resultCount}`, {
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