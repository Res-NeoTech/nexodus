import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL: string = process.env.NODE_ENV === "production" ? "https://nexapi.maksym.ch" : "http://localhost:5125";
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // FOR DEVELOPMENT ONLY, COMMENT IN PRODUCTION.

export async function PUT(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const body = await req.json();
        const id: string | null = searchParams.get("id");
        const role: string = body.role;
        const content: string = body.content;

        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 401 });
        }

        const request = await fetch(`${API_URL}/chats/append?id=${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-nexodus-token": `Nexodus ${token.value}`
            },
            body: JSON.stringify({ role, content })
        });

        if (request.status !== 200) {
            const result = await request.text();
            return NextResponse.json({ error: result }, { status: request.status });
        }

        return NextResponse.json({ result: "New message appended!" }, { status: 200 })

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}