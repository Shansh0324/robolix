import path from "path";
import fs from "fs/promises";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

export function isWithinSizeLimit(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE;
}

export function getUploadDir(): string {
  return path.join(process.cwd(), "temporary", "uploads");
}

export function getGeneratedDir(): string {
  return path.join(process.cwd(), "temporary", "generated");
}

export function getPreviewDir(): string {
  return path.join(process.cwd(), "temporary", "previews");
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export function generateUniqueFileName(extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${extension}`;
}
