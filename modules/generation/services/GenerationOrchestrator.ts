import { prisma } from "@/lib/prisma";
import { aiService } from "./AiService";
import { modelGenerationService } from "./ModelGenerationService";
import { messageRepository } from "@/modules/chat/repositories/MessageRepository";
import { logger } from "@/lib/utils/logger";

export class GenerationOrchestrator {
  /**
   * Starts a generation flow. Since we don't have Redis in this beta,
   * this will run asynchronously in the Node.js process.
   */
  async startGeneration(
    projectId: string,
    conversationId: string,
    prompt: string,
    hasImage: boolean = false,
    imageUrl?: string
  ) {
    // 1. Create Generation Record
    const generation = await prisma.generation.create({
      data: {
        projectId,
        conversationId,
        prompt,
        status: "QUEUED",
        generationType: hasImage ? "IMAGE_TO_3D" : "TEXT_TO_3D",
      },
    });

    // 2. Start the async process without awaiting it
    this.runGenerationPipeline(generation.id, prompt, hasImage, imageUrl).catch((err) => {
      logger.error("Uncaught error in generation pipeline", { error: err });
    });

    return generation;
  }

  private async runGenerationPipeline(generationId: string, prompt: string, hasImage: boolean, imageUrl?: string) {
    try {
      // Update Status: ANALYZING
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: "ANALYZING" },
      });

      // AI Intent Analysis
      const intent = await aiService.determineIntent(prompt, hasImage);
      logger.info("AI Intent determined", { generationId, intent: intent.intent });

      // Update Status: GENERATING
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: "GENERATING" },
      });

      // 3D Model Generation
      // In a real app we'd fetch the actual image URL here
      const result = await modelGenerationService.generateModel(
        intent.instructions?.join(" ") || prompt,
        imageUrl // Pass the uploaded image URL
      );

      // Create ModelVersion
      const modelVersion = await prisma.modelVersion.create({
        data: {
          generationId,
          projectId: (await prisma.generation.findUnique({ where: { id: generationId } }))!.projectId,
          version: 1, // simplified
          filePath: result.url,
          format: result.format,
        },
      });

      // Update Status: COMPLETED
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: "COMPLETED" },
      });

      // Add a message from the assistant with the new model
      const generation = await prisma.generation.findUnique({ where: { id: generationId } });
      if (generation) {
        await messageRepository.create({
          conversationId: generation.conversationId,
          role: "ASSISTANT",
          content: `I've generated a 3D model based on your request.`,
          metadata: {
            modelVersionId: modelVersion.id,
            modelUrl: result.url,
            intent: intent.intent,
          },
        });
      }

    } catch (error) {
      logger.error("Generation pipeline failed", { generationId, error });
      await prisma.generation.update({
        where: { id: generationId },
        data: { 
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  async getStatus(generationId: string) {
    return prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        modelVersions: true,
      }
    });
  }
}

export const generationOrchestrator = new GenerationOrchestrator();
