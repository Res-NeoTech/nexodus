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

        const request = await fetch(`${API_URL}/crud/user`, {
            method: "GET",
            headers: {
                "x-nexodus-token": `Nexodus ${token.value}`,
                "x-nexodus-proxy": encodeToBase64(PROXY_TOKEN)
            }
        })

        if (request.status !== 200) {
            const result = await request.text();
            console.error(result)
            return NextResponse.json({ error: result }, { status: request.status });
        }

        const result = await request.json();

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name: string = body.name;
        const email: string = body.email;
        const password: string = body.password;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const request = await fetch(`${API_URL}/crud/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-nexodus-proxy": encodeToBase64(PROXY_TOKEN)
            },
            body: JSON.stringify({ name, email, password }),
          });

        if (request.status !== 201) {
            const result = await request.text();
            return NextResponse.json({ error: result }, { status: request.status });
        }

        const result = await request.json();
        const token = result.token;

        if (!token) {
            return NextResponse.json({ error: "Token not provided by API" }, { status: 500 });
        }

        // Setting a token into a cookie
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days cookie
        });

        return NextResponse.json({ result }, { status: 201 });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}