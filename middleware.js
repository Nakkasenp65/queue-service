import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value || request.headers.get("Authorization")?.split(" ")[1];

  // Protected paths: Require JWT for employee, queue-management, and api/employees
  if (
    pathname.startsWith("/employee") ||
    pathname.startsWith("/queue-management") ||
    pathname.startsWith("/api/employees")
  ) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    try {
      jwt.verify(token, process.env.MAGIC_LINK_JWT_SECRET || "secret-demo");
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
