import { NextRequest, NextResponse } from "next/server";

export function isAdminAuthorized(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${adminSecret}`) return true;

  return request.cookies.get("admin_token")?.value === adminSecret;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
