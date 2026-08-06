export async function signRequest(body: object): Promise<string> {
  const salt = import.meta.env.VITE_REQUEST_SALT;
  const payload = JSON.stringify(body) + salt;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
