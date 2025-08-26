import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

function signHmac(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function base64UrlEncode(str) {
  return Buffer.from(str).toString("base64url");
}

function createJwt(payloadObj, secret, expiresInSeconds = 60 * 60) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + expiresInSeconds, ...payloadObj };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = signHmac(`${headerB64}.${payloadB64}`, secret);
  const sigB64 = base64UrlEncode(signature);
  return `${headerB64}.${payloadB64}.${sigB64}`;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const token = body.token || url.searchParams.get("token");
    const sig = body.sig || url.searchParams.get("sig");

    if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

    const magic = await prisma.magicLink.findUnique({ where: { token } });
    if (!magic) return NextResponse.json({ error: "invalid token" }, { status: 404 });

    // validate signature if present
    const secret = process.env.MAGIC_LINK_SECRET || "";
    if (secret) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(token + "|" + magic.employeeId)
        .digest("hex");
      if (!sig || sig !== expected) {
        return NextResponse.json({ error: "invalid signature" }, { status: 400 });
      }
    }

    if (magic.used) return NextResponse.json({ error: "token already used" }, { status: 400 });
    if (new Date() > new Date(magic.expiresAt)) return NextResponse.json({ error: "token expired" }, { status: 400 });

    // fetch employee
    const employee = await prisma.employee.findUnique({ where: { id: magic.employeeId } });
    if (!employee) return NextResponse.json({ error: "employee not found" }, { status: 404 });

    // mark used
    await prisma.magicLink.update({ where: { id: magic.id }, data: { used: true } });

    // create JWT (HMAC-SHA256) including employee basics
    const jwtSecret = process.env.MAGIC_LINK_JWT_SECRET || process.env.MAGIC_LINK_SECRET || "secret-demo";
    const jwt = createJwt(
      { employee: { id: employee.id, email: employee.email, fullname: employee.fullname, role: employee.role } },
      jwtSecret,
      60 * 60 * 24
    );

    return NextResponse.json({ ok: true, jwt, employeeId: magic.employeeId });
  } catch (error) {
    console.error("POST /api/auth/verify", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
