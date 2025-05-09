/**
 * Encodes a string to base64.
 * @param input Raw string to encode.
 * @returns Base64 encoded string.
 */
export function encodeToBase64(input: string | undefined): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    return btoa(String.fromCharCode(...data));
}