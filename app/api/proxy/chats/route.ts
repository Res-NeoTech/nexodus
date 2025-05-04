import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encodeToBase64 } from "@/app/utils/cryptography";

const PROXY_TOKEN: string | undefined = process.env.PROXY_TOKEN;
const API_URL: string = process.env.NODE_ENV === "production" ? "https://nexapi.maksym.ch" : "http://localhost:5125";

if(process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // FOR DEVELOPMENT ONLY
}

export async function GET(req :Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id: string | null = searchParams.get("id");

        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 401 });
        }

        const request = await fetch(`${API_URL}/chats/chat?id=${id}`, {
            method: "GET",
            headers: {
                "x-nexodus-token": `Nexodus ${token.value}`,
                "x-nexodus-proxy": encodeToBase64(PROXY_TOKEN)
            }
        })

        if(request.status !== 200) {
            const result = await request.text();
            return NextResponse.json({ error: result }, { status: request.status });
        }

        const result = await request.json();

        return NextResponse.json({ result }, { status: 200 })
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const role: string = body.role;
        const content: string = body.content;

        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 401 });
        }

        const request = await fetch(`${API_URL}/chats/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-nexodus-token": `Nexodus ${token.value}`,
                "x-nexodus-proxy": encodeToBase64(PROXY_TOKEN)
            },
            body: JSON.stringify({ role, content })
        });

        if (request.status !== 201) {
            const result = await request.text();
            return NextResponse.json({ error: result }, { status: request.status });
        }

        const result = await request.json();
        const id: string = result.id;

        if (!id) {
            return NextResponse.json({ error: "ChatId is not provided by API" }, { status: 500 });
        }

        return NextResponse.json({ result }, { status: 201 })

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const id: string = body.id;
        const title: string = body.title;

        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 401 });
        }

        const request = await fetch(`${API_URL}/chats/chat`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-nexodus-token": `Nexodus ${token.value}`,
                "x-nexodus-proxy": encodeToBase64(PROXY_TOKEN)
            },
            body: JSON.stringify({ id, title })
        });

        if (request.status !== 200) {
            const result = await request.text();
            return NextResponse.json({ error: result }, { status: request.status });
        }

        return NextResponse.json({ result: "Chat title was changed successfully!" }, { status: 200 })
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id: string | null = searchParams.get("id");

        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 401 });
        }

        const request = await fetch(`${API_URL}/chats/chat?id=${id}`, {
            method: "DELETE",
            headers: {
                "x-nexodus-token": `Nexodus ${token.value}`,
                "x-nexodus-proxy": encodeToBase64(PROXY_TOKEN)
            }
        })

        if(request.status !== 200) {
            const result = await request.text();
            return NextResponse.json({ error: result }, { status: request.status });
        }

        return NextResponse.json({ result: "Chat was successfully deleted!" }, { status: 200 })
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}