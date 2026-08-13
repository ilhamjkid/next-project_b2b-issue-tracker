import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user.role;

  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!nextUrl.pathname.startsWith("/sign")) {
    const isAgentRoute = nextUrl.pathname.startsWith("/agent");
    const isClientRoute = nextUrl.pathname.startsWith("/client");

    if (isAgentRoute || isClientRoute) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/signin", nextUrl));
      }

      if (isAgentRoute && userRole === "CLIENT") {
        return NextResponse.redirect(new URL("/client", nextUrl));
      }

      return NextResponse.next();
    }

    return NextResponse.next();
  }

  if (isLoggedIn) {
    return NextResponse.redirect(new URL("/client", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
