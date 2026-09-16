export type ErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "PROJECT_NOT_FOUND"
  | "CONVERSATION_NOT_FOUND"
  | "GENERATION_NOT_FOUND"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE"
  | "AI_SERVICE_UNAVAILABLE"
  | "MODEL_SERVICE_UNAVAILABLE"
  | "GENERATION_FAILED"
  | "MODEL_NOT_SUPPORTED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function badRequest(message: string, code: ErrorCode = "INVALID_REQUEST") {
  return new AppError(code, message, 400);
}

export function unauthorized(message: string = "Unauthorized") {
  return new AppError("UNAUTHORIZED", message, 401);
}

export function notFound(code: ErrorCode, message: string) {
  return new AppError(code, message, 404);
}

export function internalError(message: string = "Internal server error") {
  return new AppError("INTERNAL_ERROR", message, 500);
}

export function serviceUnavailable(code: ErrorCode, message: string) {
  return new AppError(code, message, 503);
}
