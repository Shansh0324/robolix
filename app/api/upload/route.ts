import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { getAuthUser } from "@/lib/http/auth-middleware";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { badRequest } from "@/lib/http/errors";

export async function POST(request: NextRequest) {
  try {
    await getAuthUser(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw badRequest("No file uploaded");
    }

    // Basic validation
    if (!file.type.startsWith("image/")) {
      throw badRequest("Only image files are allowed");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw badRequest("File exceeds 10MB limit");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return the URL
    const url = `/uploads/${filename}`;

    return successResponse({ url, name: file.name, size: file.size, type: file.type }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
