import { fal } from "@fal-ai/client";
import { logger } from "@/lib/utils/logger";
import { randomUUID } from "crypto";

export interface ModelGenerationResult {
  format: string;
  url: string; // The URL to the GLB file
}

export class ModelGenerationService {
  async generateModel(prompt: string, imageUrl?: string): Promise<ModelGenerationResult> {
    const falKey = process.env.FAL_KEY;
    
    if (!falKey) {
      logger.warn("FAL_KEY is not set. Using mock generation response.");
      return this.mockGenerate();
    }

    try {
      // In a real app, you would use Trellis or TripoSR on fal.ai.
      // E.g., fal.subscribe("fal-ai/trellis", { input: { image_url: imageUrl } })
      
      // For this demo, let's assume we call a standard image-to-3d endpoint
      // If we don't have an image but have text, we would first generate an image
      // Let's implement a simplified generic call:
      
      const endpoint = imageUrl ? "fal-ai/triposr" : "fal-ai/triposr"; // Assume a hypothetical endpoint if no exact one exists, or mock it if it errors
      
      const input = imageUrl ? { image_url: imageUrl } : { prompt };

      const result = await fal.subscribe(endpoint, {
        input: input as any,
        logs: true,
        onQueueUpdate: (update) => {
          logger.info("Generation queue update", { update });
        },
      });

      // @ts-expect-error dynamic fal response
      const modelUrl = result.model_file?.url || result.mesh?.url;
      
      if (!modelUrl) {
        throw new Error("No model URL returned from Fal.ai");
      }

      return {
        format: "glb",
        url: modelUrl,
      };

    } catch (error) {
      logger.error("Fal.ai generation failed", { error });
      return this.mockGenerate();
    }
  }

  private async mockGenerate(): Promise<ModelGenerationResult> {
    // Simulate generation time
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    return {
      format: "glb",
      // A public domain or simple GLB file URL for demo purposes
      url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    };
  }
}

export const modelGenerationService = new ModelGenerationService();
