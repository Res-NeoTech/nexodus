export const config = {
    runtime: "edge", // for ReadableStream
};

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const API_KEY = process.env.MISTRAL_API_KEY;

export async function POST(req: Request): Promise<Response> {
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "API Key is not set" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const body = await req.json();
    const { messages, model = "mistral-small-latest" } = body;

    try {
        const mistralRes = await fetch(MISTRAL_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ model, messages, stream: true }),
        });

        if (!mistralRes.body) {
            return new Response(JSON.stringify({ error: "No response body from Mistral" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const reader = mistralRes.body.getReader();

        const stream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (value) {
                        controller.enqueue(value);
                    }
                }
                controller.close();
            },
        });

        return new Response(stream, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Proxy stream error:", error);
        return new Response(JSON.stringify({ error: "Failed to stream from Mistral API" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}  