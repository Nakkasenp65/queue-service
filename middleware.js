import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/employee", "/queueManagement/admin", "/queueManagement/profile"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/queueManagement/login", request.url);
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `auth_token=${token}`,
        },
      });

      // 4. ตรวจสอบคำตอบจาก Backend
      if (response.ok) {
        // ถ้า Backend ตอบกลับมาว่า OK (status 200-299) แสดงว่า Token ถูกต้อง
        // อนุญาตให้ไปต่อได้เลย
        return NextResponse.next();
      } else {
        // ถ้า Backend ตอบกลับมาเป็นอย่างอื่น (เช่น 401) แสดงว่า Token ไม่ถูกต้อง
        // ให้ Redirect ไปหน้า Login
        const loginUrl = new URL("/queueManagement/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // กรณีที่ Backend Server ล่ม หรือเชื่อมต่อไม่ได้
      console.error("Middleware fetch error:", error);
      // อาจจะ Redirect ไปหน้า Error หรือหน้า Login ก็ได้
      const loginUrl = new URL("/queueManagement/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ถ้าไม่ใช่ Protected Path ก็อนุญาตให้ไปต่อได้เลย
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
