import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL: string = "http://localhost:5125";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // FOR DEVELOPMENT ONLY, COMMENT IN PRODUCTION.

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
            headers: { "Content-Type": "application/json" },
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

        // Устанавливаем токен в куки
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 дней
        });

        return NextResponse.json({ result }, { status: 201 });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}