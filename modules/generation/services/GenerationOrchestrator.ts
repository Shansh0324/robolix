import { prisma } from "@/lib/prisma";
import { aiService } from "./AiService";
import { modelGenerationService } from "./ModelGenerationService";
import { messageRepository } from "@/modules/chat/repositories/MessageRepository";
import { logger } from "@/lib/utils/logger";

export class GenerationOrchestrator {
  /**
   * Starts a generation flow. Since we don't have Redis in this beta,
   * this will run asynchronously in the Node.js process.
   * Returns the generation ID immediately so the frontend can poll status.
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

    // 2. Post initial status message so the user sees something immediately
    await messageRepository.create({
      conversationId,
      role: "ASSISTANT",
      content: "🔍 Analyzing your request...",
      metadata: {
        type: "STATUS",
        generationId: generation.id,
        step: "QUEUED",
      },
    });

    // 3. Start the async pipeline (fire and forget)
    this.runGenerationPipeline(generation.id, conversationId, prompt, hasImage, imageUrl).catch(
      (err) => {
        logger.error("Uncaught error in generation pipeline", { error: err });
      }
    );

    return generation;
  }

  private async updateStatus(
    conversationId: string,
    generationId: string,
    step: string,
    content: string
  ) {
    // Post a status update message to the conversation
    await messageRepository.create({
      conversationId,
      role: "ASSISTANT",
      content,
      metadata: {
        type: "STATUS",
        generationId,
        step,
      },
    });
  }

  private async runGenerationPipeline(
    generationId: string,
    conversationId: string,
    prompt: string,
    hasImage: boolean,
    imageUrl?: string
  ) {
    try {
      // ── Step 1: AI Intent Analysis ──
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: "ANALYZING" },
      });
      await this.updateStatus(
        conversationId,
        generationId,
        "ANALYZING",
        "🧠 Understanding your intent and analyzing the request..."
      );

      const intent = await aiService.determineIntent(prompt, hasImage);
      logger.info("AI Intent determined", { generationId, intent: intent.intent });

      await this.updateStatus(
        conversationId,
        generationId,
        "INTENT_RESOLVED",
        `✅ Intent: **${intent.intent}**\n📝 ${intent.description || prompt}`
      );

      // ── Step 2: 3D Model Generation ──
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: "GENERATING" },
      });

      const onStep = async (step: string, detail?: string) => {
        if (detail) {
          const icons: Record<string, string> = {
            READING_IMAGE: "📷",
            GENERATING_IMAGE: "🎨",
            GENERATING_3D: "🔮",
            COMPLETED: "✅",
          };
          await this.updateStatus(
            conversationId,
            generationId,
            step,
            `${icons[step] || "⏳"} ${detail}`
          );
        }
      };

      const result = await modelGenerationService.generateModel(
        intent.description || intent.instructions?.join(" ") || prompt,
        imageUrl,
        onStep
      );

      // ── Step 3: Save Model ──
      const generation = await prisma.generation.findUnique({
        where: { id: generationId },
      });
      if (!generation) throw new Error("Generation record not found");

      const modelVersion = await prisma.modelVersion.create({
        data: {
          generationId,
          projectId: generation.projectId,
          version: 1,
          filePath: result.url,
          format: result.format,
        },
      });

      // ── Step 4: Mark completed ──
      await prisma.generation.update({
        where: { id: generationId },
        data: { status: "COMPLETED" },
      });

      // Post the final model message
      await messageRepository.create({
        conversationId,
        role: "ASSISTANT",
        content: `🎉 Your 3D model is ready! You can rotate, zoom, and download it.`,
        metadata: {
          type: "MODEL",
          modelVersionId: modelVersion.id,
          modelUrl: result.url,
          intent: intent.intent,
          generationId,
        },
      });
    } catch (error) {
      logger.error("Generation pipeline failed", { generationId, error });

      // Mark generation as failed
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      // Post failure message in chat so the user sees it
      await messageRepository.create({
        conversationId,
        role: "ASSISTANT",
        content: `❌ Generation failed: ${error instanceof Error ? error.message : "An unexpected error occurred."}\n\nPlease try again or upload a different image.`,
        metadata: {
          type: "ERROR",
          generationId,
          step: "FAILED",
        },
      });
    }
  }

  async getStatus(generationId: string) {
    return prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        modelVersions: true,
      },
    });
  }
}

export const generationOrchestrator = new GenerationOrchestrator();
