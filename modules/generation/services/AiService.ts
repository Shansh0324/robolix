import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/utils/logger";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AiIntentResponse {
  intent: string;
  object?: string;
  description?: string;
  style?: string;
  materials?: string[];
  colors?: string[];
  instructions?: string[];
}

export class AiService {
  async determineIntent(prompt: string, hasImage: boolean): Promise<AiIntentResponse> {
    if (!genAI) {
      logger.warn("GEMINI_API_KEY is not set. Using mock AI response.");
      return this.getMockIntent(prompt);
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemInstruction = `
      You are an AI assistant for a 3D generation platform. 
      Your job is to analyze the user's prompt and determine their intent.
      Return a JSON object with the following structure:
      {
        "intent": "GENERATE_MODEL" | "REGENERATE_MODEL" | "MODIFY_MODEL" | "CHANGE_COLOR" | "CHANGE_MATERIAL" | "CHANGE_STYLE",
        "object": "The main object requested (e.g., gaming chair)",
        "description": "Detailed visual description",
        "style": "Style if any (e.g., futuristic, low poly)",
        "materials": ["list", "of", "materials"],
        "colors": ["list", "of", "colors"],
        "instructions": ["specific", "instructions", "for", "the", "3d", "generator"]
      }
      Respond ONLY with valid JSON.
      `;

      const result = await model.generateContent([
        { text: systemInstruction },
        { text: `User Prompt: ${prompt}` },
        { text: `Has Reference Image: ${hasImage}` },
      ]);

      const responseText = result.response.text();
      // Extract JSON from response (handling potential markdown blocks)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      
      return JSON.parse(jsonStr) as AiIntentResponse;
    } catch (error) {
      logger.error("AI intent determination failed", { error });
      return this.getMockIntent(prompt); // Fallback
    }
  }

  private getMockIntent(prompt: string): AiIntentResponse {
    const lower = prompt.toLowerCase();
    const intent = lower.includes("modify") || lower.includes("change") ? "MODIFY_MODEL" : "GENERATE_MODEL";
    
    return {
      intent,
      object: "object",
      description: prompt,
      instructions: ["Preserve shape", "Follow prompt instructions closely"],
    };
  }
}

export const aiService = new AiService();
