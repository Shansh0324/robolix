import { fal } from "@fal-ai/client";
import { logger } from "@/lib/utils/logger";
import { readFile } from "fs/promises";
import { join } from "path";

export interface ModelGenerationResult {
  format: string;
  url: string;
}

export type GenerationStepCallback = (step: string, detail?: string) => Promise<void>;

export class ModelGenerationService {
  private configured = false;

  private ensureConfigured() {
    if (!this.configured) {
      const key = process.env.FAL_KEY;
      if (key) {
        fal.config({ credentials: key });
        this.configured = true;
      }
    }
  }

  async generateModel(
    prompt: string,
    imageUrl?: string,
    onStep?: GenerationStepCallback
  ): Promise<ModelGenerationResult> {
    const falKey = process.env.FAL_KEY;

    if (!falKey) {
      logger.warn("FAL_KEY is not set. Using mock generation response.");
      return this.mockGenerate();
    }

    this.ensureConfigured();

    try {
      let finalImageUrl = imageUrl;

      // Step 1: If local file, read and convert to data URI
      if (finalImageUrl && finalImageUrl.startsWith("/uploads/")) {
        await onStep?.("READING_IMAGE", "Reading your uploaded image...");
        const filepath = join(process.cwd(), "public", finalImageUrl);
        try {
          const fileBuffer = await readFile(filepath);
          const ext = finalImageUrl.split(".").pop() || "png";
          const mimeMap: Record<string, string> = {
            jpg: "image/jpeg", jpeg: "image/jpeg",
            png: "image/png", webp: "image/webp",
          };
          const mime = mimeMap[ext.toLowerCase()] || "image/png";
          finalImageUrl = `data:${mime};base64,${fileBuffer.toString("base64")}`;
          logger.info("Converted local image to data URI", { size: fileBuffer.length });
        } catch (e) {
          logger.error("Failed to read local image", { error: e });
          throw new Error("Could not read the attached image.");
        }
      }

      // Step 2: If no image, generate one from text first
      if (!finalImageUrl) {
        await onStep?.("GENERATING_IMAGE", "Creating a reference image from your description...");
        logger.info("No image provided. Generating reference image from text via Flux.");

        const t2iResult = await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt: `High quality product render of: ${prompt}. Clean white studio background, 3D asset, centered, single object, no text.`,
            image_size: "square_hd",
            num_images: 1,
            num_inference_steps: 4,
          } as any,
          logs: true,
        });

        // @ts-expect-error dynamic fal result
        finalImageUrl = t2iResult.images?.[0]?.url;

        if (!finalImageUrl) {
          throw new Error("Failed to generate a reference image from your text prompt.");
        }
        logger.info("Reference image generated", { url: finalImageUrl });
      }

      // Step 3: Generate 3D model from image
      await onStep?.("GENERATING_3D", "Generating 3D model from image...");
      logger.info("Sending image to TripoSR for 3D generation");

      const result = await fal.subscribe("fal-ai/triposr", {
        input: { image_url: finalImageUrl } as any,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_QUEUE") {
            logger.info("TripoSR: waiting in queue...");
          }
        },
      });

      logger.info("TripoSR result received", { resultKeys: Object.keys(result.data) });

      // Extract model URL from response - TripoSR returns different structures
      const data = result.data as any;
      const modelUrl =
        data?.model_mesh?.url ||
        data?.model_file?.url ||
        data?.mesh?.url ||
        data?.glb?.url ||
        data?.output?.url;

      if (!modelUrl) {
        logger.error("Unexpected TripoSR response structure", { data: JSON.stringify(data).slice(0, 500) });
        throw new Error("3D model was generated but the file URL could not be extracted.");
      }

      await onStep?.("COMPLETED", "3D model generated successfully!");

      return { format: "glb", url: modelUrl };
    } catch (error) {
      logger.error("Model generation failed", { error });
      throw error;
    }
  }

  private async mockGenerate(): Promise<ModelGenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      format: "glb",
      url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    };
  }
}

export const modelGenerationService = new ModelGenerationService();
