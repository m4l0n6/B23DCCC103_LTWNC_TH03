import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { can } from "@/lib/permissions"

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  // Read and verify the JWT without rotating cookies on speculative prefetch requests.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie:
      request.nextUrl.protocol === "https:" ||
      Boolean(process.env.AUTH_URL?.startsWith("https:")),
  })
  if (!token?.sub) {
    const login = new URL("/login", request.url)
    login.searchParams.set("callbackUrl", pathname + search)
    return NextResponse.redirect(login)
  }
  if (
    pathname.startsWith("/admin") &&
    !can(token.role === "admin" ? "admin" : "user", "create")
  ) {
    return NextResponse.redirect(new URL("/403", request.url))
  }
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] }
