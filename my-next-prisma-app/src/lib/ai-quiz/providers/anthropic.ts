// Anthropic (Claude) AI Provider

import Anthropic from "@anthropic-ai/sdk";
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

export class AnthropicProvider extends BaseAIProvider {
  name = "Anthropic Claude";
  type = "ANTHROPIC";
  private client: Anthropic;
  private modelName: string;

  constructor(modelName: string) {
    super();
    this.modelName = modelName;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required");
    }

    this.client = new Anthropic({ apiKey });
  }

  async generateQuestions(config: QuizConfig): Promise<GeneratedQuiz> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(config);

    try {
      const message = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 4096,
        temperature: 0.7,
        system:
          "You are an expert quiz creator. Always return valid JSON without markdown formatting. Return ONLY the JSON object, no explanatory text before or after.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract text from content blocks
      const responseText = message.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("");

      if (!responseText) {
        throw new Error("No response from Anthropic API");
      }

      // Validate response is not empty
      if (responseText.trim().length === 0) {
        throw new Error("Empty response from Anthropic API");
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
      const tokensUsed =
        (message.usage?.input_tokens || 0) +
        (message.usage?.output_tokens || 0);

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
          tokensUsed,
          generationTime,
          provider: "Anthropic",
        },
      } as GeneratedQuiz;
    } catch (error) {
      console.error("Anthropic generation error:", error);

      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (
          error.message.includes("API key") ||
          error.message.includes("authentication")
        ) {
          throw new Error(
            "Invalid Anthropic API key. Please check your configuration."
          );
        }
        if (
          error.message.includes("rate limit") ||
          error.message.includes("429")
        ) {
          throw new Error(
            "Anthropic rate limit exceeded. Please try again in a few moments."
          );
        }
        if (
          error.message.includes("quota") ||
          error.message.includes("insufficient")
        ) {
          throw new Error(
            "Anthropic quota exceeded. Please check your billing settings."
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
      // Try a minimal API call to validate the key
      await this.client.messages.create({
        model: this.modelName,
        max_tokens: 10,
        messages: [{ role: "user", content: "test" }],
      });
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true, // Claude supports image analysis
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
      ],
    };
  }

  estimateCost(questionCount: number): number {
    // Anthropic pricing per 1K tokens
    const tokensPerQuestion = 250; // Estimated
    const totalTokens = questionCount * tokensPerQuestion;
    const costPer1KTokens = this.modelName.includes("opus")
      ? 0.015 // Opus: $15/1M tokens
      : this.modelName.includes("sonnet")
      ? 0.003 // Sonnet: $3/1M tokens
      : 0.00025; // Haiku: $0.25/1M tokens
    return (totalTokens / 1000) * costPer1KTokens;
  }
}
