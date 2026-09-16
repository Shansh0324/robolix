type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  requestId?: string;
  generationId?: string;
  projectId?: string;
  conversationId?: string;
  [key: string]: unknown;
}

function formatContext(context?: LogContext): string {
  if (!context) return "";
  const parts: string[] = [];
  if (context.generationId) parts.push(`[${context.generationId}]`);
  if (context.projectId) parts.push(`[${context.projectId}]`);
  if (context.requestId) parts.push(`[${context.requestId}]`);
  if (context.conversationId) parts.push(`[${context.conversationId}]`);
  return parts.length > 0 ? parts.join(" ") + " " : "";
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const prefix = formatContext(context);
  const line = `[${timestamp}] [${level.toUpperCase()}] ${prefix}${message}`;

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(line);
      }
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
  debug: (message: string, context?: LogContext) => log("debug", message, context),
};
