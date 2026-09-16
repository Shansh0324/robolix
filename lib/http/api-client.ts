import { NextResponse } from "next/server";
import { AppError } from "./errors";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error("Unhandled error:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    },
    { status: 500 }
  );
}
