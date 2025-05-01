import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_KEY = process.env.MISTRAL_API_KEY;
const API_URL: string = "https://api.mistral.ai/v1/chat/completions";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token not found" }, { status: 401 });
        }

        const body = await req.json();

        if(!body.messages) {
            return NextResponse.json({ error: "Request body must contain messages" }, { status: 400 });
        }

        body.messages.push({ role: "user", content: "Generate a concise title (max 50 characters) for this conversation, in the same language as the conversation. Use only the messages before this prompt. Return only the title." });

        const aiReqBody = JSON.stringify({
            model: "mistral-small-latest",
            messages: body.messages,
        });

        const getNameRequest = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: aiReqBody
        });

        if (getNameRequest.status !== 200) {
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        const data = await getNameRequest.json();
        const aiResponse = data.choices[0].message.content;

        return NextResponse.json({ chatName: aiResponse }, { status: 200 })
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}