// Google Gemini AI Provider

import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseAIProvider } from "./base";
import {
  QuizConfig,
  GeneratedQuiz,
  ProviderCapabilities,
} from "@/types/ai-quiz";
import {
  getBaselineXP,
  getMaxPossibleXP,
} from "@/lib/ai-quiz/difficulty-mapper";

export class GeminiProvider extends BaseAIProvider {
  name = "Google Gemini";
  type = "GEMINI";

  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(modelName: string) {
    super();
    this.modelName = modelName;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateQuestions(config: QuizConfig): Promise<GeneratedQuiz> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(config);

    try {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192, // Increased from 4096 to handle larger quiz responses
          responseMimeType: "application/json", // Ensure JSON response format
        },
      });

      const systemPrompt = `You are an expert quiz creator that outputs STRICTLY valid JSON.

CRITICAL: All newlines, tabs, and special characters in string values MUST be properly escaped.
- Use \\n for newlines (not actual line breaks)
- Use \\t for tabs
- Use \\" for quotes within strings
- For code snippets: "text": "Code example:\\nint x = 5;\\nreturn x;"

Return ONLY a single valid JSON object. No markdown, no commentary, no text outside the JSON.

${prompt}`;

      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      const responseText = response.text();

      if (!responseText) {
        throw new Error("No response from Gemini API");
      }

      // Validate response is not empty
      if (responseText.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }

      const cleanedResponse = this.cleanJsonResponse(responseText);

      let quizData;
      try {
        quizData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response text:", cleanedResponse);
        throw new Error(
          "Failed to parse AI response as JSON. The AI may have returned invalid data."
        );
      }

      if (!this.validateQuizStructure(quizData)) {
        throw new Error("Invalid quiz structure returned from AI");
      }

      const generationTime = Date.now() - startTime;

      // Gemini doesn't directly provide token counts in the same way
      // Estimate based on response length
      const estimatedTokens = Math.ceil(responseText.length / 4);

      // Calculate XP
      const baseXP = getBaselineXP(
        config.difficultyLevel,
        config.questionCount
      );
      const maxXP = getMaxPossibleXP(
        config.difficultyLevel,
        config.questionCount
      );

      // Estimate time (1.5 minutes per question on average)
      const estimatedTime = config.questionCount * 90;

      return {
        title: quizData.title,
        description:
          quizData.description || `AI-generated quiz on ${config.subject}`,
        questions: quizData.questions,
        totalQuestions: quizData.questions.length,
        estimatedTime,
        baseXP,
        maxXP,
        metadata: {
          model: this.modelName,
          tokensUsed: estimatedTokens,
          generationTime,
          provider: "Google",
        },
      } as GeneratedQuiz;
    } catch (error) {
      console.error("Gemini generation error:", error);

      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (
          error.message.includes("API key") ||
          error.message.includes("API_KEY")
        ) {
          throw new Error(
            "Invalid Gemini API key. Please check your configuration."
          );
        }
        if (
          error.message.includes("quota") ||
          error.message.includes("RESOURCE_EXHAUSTED")
        ) {
          throw new Error(
            "Gemini quota exceeded. Please check your API usage limits."
          );
        }
        if (error.message.includes("rate") || error.message.includes("429")) {
          throw new Error(
            "Gemini rate limit exceeded. Please try again in a few moments."
          );
        }
        if (error.message.includes("timeout")) {
          throw new Error(
            "Request timed out. Please try generating a smaller quiz."
          );
        }
      }

      throw new Error(
        `Failed to generate quiz: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.modelName });
      await model.generateContent("test");
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxTokens: 8192,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: this.modelName.includes("vision"), // Only vision models
      supportsCode: true,
      supportedLanguages: [
        "en",
        "es",
        "fr",
        "de",
        "it",
        "pt",
        "ja",
        "ko",
        "zh",
        "hi",
        "ar",
      ],
    };
  }

  estimateCost(questionCount: number): number {
    // Gemini pricing: Pro ($0.00025/1K tokens), Flash ($0.000125/1K tokens)
    const tokensPerQuestion = 250; // Estimated
    const totalTokens = questionCount * tokensPerQuestion;
    const costPer1KTokens = this.modelName.includes("pro") ? 0.00025 : 0.000125;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}
