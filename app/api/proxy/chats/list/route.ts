import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encodeToBase64 } from "@/app/utils/cryptography";

const PROXY_TOKEN: string | undefined = process.env.PROXY_TOKEN;
const API_URL: string = process.env.NODE_ENV === "production" ? "https://nexapi.maksym.ch" : "http://localhost:5125";

if(process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // FOR DEVELOPMENT ONLY
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 401 });
        }

        const request = await fetch(`${API_URL}/chats/list`, {
            method: "GET",
            headers: {
                "x-nexodus-token": `Nexodus ${token.value}`,
                "x-nexodus-proxy": encodeToBase64(PROXY_TOKEN)
            }
        })

        if (request.status !== 200) {
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