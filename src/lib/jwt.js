import crypto from "crypto";

// ฟังก์ชันสำหรับเข้ารหัสข้อมูลเป็น base64 URL-safe
function base64UrlDecode(str) {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

// ฟังก์ชันสำหรับตรวจสอบ JWT token ด้วย HMAC-SHA256
export function verifyJwt(token, secret) {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) {
      throw new Error("Invalid JWT format");
    }

    // Verify signature
    const expectedSignature = crypto.createHmac("sha256", secret).update(`${headerB64}.${payloadB64}`).digest("hex");
    const providedSignature = base64UrlDecode(signatureB64);

    if (expectedSignature !== providedSignature) {
      throw new Error("Invalid signature");
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(payloadB64));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token expired");
    }

    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}
