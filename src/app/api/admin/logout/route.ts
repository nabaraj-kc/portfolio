import { NextResponse } from "next/server";
import { getCookieDomain } from "@/lib/cookie-utils";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  const domain = getCookieDomain(request);
  
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    domain,
  });
  return response;
}
