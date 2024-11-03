import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("access_token")?.value;

  if (token) {
    try {
      const { payload: decoded } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET)
      );

      if (decoded.is_teacher) {
        if (req.nextUrl.pathname === "/") {
          return NextResponse.redirect(new URL("/ogretmen", req.url));
        }
      } else {
        if (req.nextUrl.pathname === "/") {
          return NextResponse.redirect(new URL("/ogrenci", req.url));
        }
      }

      if (
        decoded.is_teacher === true &&
        req.nextUrl.pathname.startsWith("/ogrenci")
      ) {
        return NextResponse.redirect(new URL("/ogretmen", req.url));
      }

      if (
        decoded.is_teacher === false &&
        req.nextUrl.pathname.startsWith("/ogretmen")
      ) {
        return NextResponse.redirect(new URL("/ogrenci", req.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else {
    if (req.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/ogretmen/:path*", "/ogrenci/:path*"],
};
