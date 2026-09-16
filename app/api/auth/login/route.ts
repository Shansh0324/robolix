import { NextRequest } from "next/server";
import { authService, LoginSchema } from "@/modules/auth";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { badRequest } from "@/lib/http/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message || "Invalid request");
    }

    const result = await authService.login(parsed.data);

    const response = successResponse(result);

    // Set HTTP-only cookie
    response.cookies.set("auth-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
