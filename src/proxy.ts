import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user.role;

  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!nextUrl.pathname.startsWith("/signin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/signin", nextUrl));
    }

    if (userRole === "AGENT") {
      if (nextUrl.pathname.startsWith("/agent")) {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL("/agent", nextUrl));
    }

    if (nextUrl.pathname.startsWith("/client")) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/client", nextUrl));
  }

  if (isLoggedIn) {
    const targetRoute = userRole === "CLIENT" ? "/client" : "/agent";
    return NextResponse.redirect(new URL(targetRoute, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
