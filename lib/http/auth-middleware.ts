import { NextRequest } from "next/server";
import { authService } from "@/modules/auth";
import { unauthorized } from "@/lib/http/errors";
import type { AuthUser } from "@/modules/auth";

/**
 * Extract and verify the auth token from request cookies or Authorization header.
 * Returns the authenticated user.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser> {
  // Try cookie first (preferred for security)
  const tokenFromCookie = request.cookies.get("auth-token")?.value;

  // Fall back to Authorization header
  const authHeader = request.headers.get("Authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    throw unauthorized("Authentication required");
  }

  const user = await authService.getUserFromToken(token);
  if (!user) {
    throw unauthorized("Invalid or expired token");
  }

  return user;
}
