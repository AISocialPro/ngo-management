import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // ⭐ Completely bypass all authentication
  return NextResponse.next();
}

// ⭐ Disable matcher so middleware does nothing
export const config = {
  matcher: [],
};
