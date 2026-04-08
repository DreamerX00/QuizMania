// NVIDIA LLaMA Provider Implementation
// Uses the OpenAI-compatible NVIDIA NIM API with meta/llama-3.3-70b-instruct

import OpenAI from "openai";
import { BaseAIProvider } from "./base";
import {
  QuizConfig,
  GeneratedQuiz,
  ProviderCapabilities,
} from "@/types/ai-quiz";
import { getBaselineXP, getMaxPossibleXP } from "../difficulty-mapper";

const NVIDIA_MODEL = "meta/llama-3.3-70b-instruct";

export class NvidiaProvider extends BaseAIProvider {
  name = "NVIDIA";
  type = "NVIDIA";
  private client: OpenAI;

  constructor() {
    super();

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error("NVIDIA_API_KEY environment variable is not set");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
  }

  async generateQuestions(config: QuizConfig): Promise<GeneratedQuiz> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(config);

    try {
      const completion = await this.client.chat.completions.create({
        model: NVIDIA_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert quiz creator. Always return valid JSON without markdown formatting. Return ONLY the JSON object, no explanatory text before or after.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 4000,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("No response from NVIDIA API");
      }

      if (responseText.trim().length === 0) {
        throw new Error("Empty response from NVIDIA API");
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
      const tokensUsed = completion.usage?.total_tokens || 0;

      const baseXP = getBaselineXP(
        config.difficultyLevel,
        config.questionCount
      );
      const maxXP = getMaxPossibleXP(
        config.difficultyLevel,
        config.questionCount
      );

      const estimatedTime = config.questionCount * 90;

      return {
        id: `nvidia-${Date.now()}`,
        title: quizData.title,
        description:
          quizData.description || `AI-generated quiz on ${config.subject}`,
        questions: quizData.questions,
        totalQuestions: quizData.questions.length,
        estimatedTime,
        baseXP,
        maxXP,
        metadata: {
          model: NVIDIA_MODEL,
          tokensUsed,
          generationTime,
          provider: "NVIDIA",
        },
      } as GeneratedQuiz;
    } catch (error) {
      console.error("NVIDIA generation error:", error);

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          throw new Error(
            "Invalid NVIDIA API key. Please check your configuration."
          );
        }
        if (error.message.includes("rate limit")) {
          throw new Error(
            "NVIDIA rate limit exceeded. Please try again in a few moments."
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
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxTokens: 4000,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: false,
      supportsCode: true,
      supportedLanguages: [
        "en",
        "es",
        "fr",
        "de",
        "it",
        "pt",
        "zh",
        "ja",
        "ko",
      ],
    };
  }

  estimateCost(questionCount: number): number {
    // LLaMA 3.3 70B via NVIDIA NIM
    // Approximate cost per quiz generation
    return (questionCount / 10) * 0.002;
  }
}
