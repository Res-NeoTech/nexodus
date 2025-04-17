import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function GET() {
    try {
        const cookieStore: ReadonlyRequestCookies = await cookies();
        cookieStore.delete("token");

        return NextResponse.json({status: "Successfully logged out."}, { status: 200 });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}