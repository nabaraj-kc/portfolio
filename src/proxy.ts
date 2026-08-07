import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_session";

// Allowed CORS origins for API requests
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://labs.localhost:3000",
  "http://research.localhost:3000",
  "http://articles.localhost:3000",
  "http://krrishmay.localhost:3000",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) return true;
  const configured = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map(s => s.trim()) : [];
  if (configured.includes(origin)) return true;
  if (process.env.NEXT_PUBLIC_BASE_URL && origin.startsWith(process.env.NEXT_PUBLIC_BASE_URL)) return true;
  if (origin.endsWith(".vercel.app") || origin.includes("nabarajkc.com")) return true;
  return false;
}

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  const origin = request.headers.get("origin");
  const pathname = request.nextUrl.pathname;

  // 1. CORS Validation for API endpoints
  let corsHeaders: Record<string, string> = {};
  if (origin && isAllowedOrigin(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
    corsHeaders["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    corsHeaders["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // 2. Strict Subdomain Rewrite Routing
  // Subdomain: krrishmay.localhost
  if (host.startsWith("krrishmay.") || host.startsWith("krishmay.")) {
    if (pathname === "/" || pathname === "") {
      const response = NextResponse.rewrite(new URL("/krrishmay", request.url));
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }
  }

  // Subdomain: research.localhost
  if (host.startsWith("research.")) {
    if (pathname === "/" || pathname === "") {
      const response = NextResponse.rewrite(new URL("/research", request.url));
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }
  }

  // Subdomain: lab.localhost or labs.localhost
  if (host.startsWith("labs.") || host.startsWith("lab.")) {
    if (pathname === "/" || pathname === "") {
      const response = NextResponse.rewrite(new URL("/lab", request.url));
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }
  }

  // Subdomain: articles.localhost
  if (host.startsWith("articles.") || host.startsWith("article.")) {
    if (pathname === "/" || pathname === "") {
      const response = NextResponse.rewrite(new URL("/articles", request.url));
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }
  }

  // 3. Admin Authentication & Session Isolation
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin" || pathname === "/admin/";
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginApi) return NextResponse.next({ headers: corsHeaders });

  const session = request.cookies.get(ADMIN_COOKIE);
  const requiredToken = process.env.ADMIN_SESSION_TOKEN || "nkc-admin-secret-2026";
  const cronSecret = process.env.CRON_SECRET || "nkc-cron-secret-2026";
  
  const isAuthenticated = session?.value === requiredToken;
  const authHeader = request.headers.get("authorization");
  const isCronAuthenticated = authHeader === `Bearer ${cronSecret}`;

  if (isAdminApi && !isAuthenticated && !isCronAuthenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401, headers: corsHeaders });
  }

  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    const loginUrl = new URL("/admin", request.url);
    const response = NextResponse.redirect(loginUrl);
    Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  if (isLoginPage && isAuthenticated) {
    const dashUrl = new URL("/admin/dashboard", request.url);
    const response = NextResponse.redirect(dashUrl);
    Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|images|favicon.ico).*)"],
};
