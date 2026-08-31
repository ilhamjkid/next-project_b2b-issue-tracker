import { NextURL } from "next/dist/server/web/next-url";
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
        return sanitizeSearchParams(nextUrl);
      }

      return NextResponse.redirect(new URL("/agent", nextUrl));
    }

    if (nextUrl.pathname.startsWith("/client")) {
      return sanitizeSearchParams(nextUrl);
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

function sanitizeSearchParams(nextUrl: NextURL) {
  const status = nextUrl.searchParams.get("status");
  const priority = nextUrl.searchParams.get("priority");

  const isStatusInvalid =
    status !== null && !["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status);
  const isPriorityInvalid = priority !== null && !["LOW", "MEDIUM", "HIGH"].includes(priority);

  if (isStatusInvalid || isPriorityInvalid) {
    const redirectUrl = nextUrl.clone();
    if (isStatusInvalid) redirectUrl.searchParams.delete("status");
    if (isPriorityInvalid) redirectUrl.searchParams.delete("priority");

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}
