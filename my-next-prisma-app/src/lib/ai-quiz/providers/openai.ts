// OpenAI Provider Implementation

import OpenAI from "openai";
import { BaseAIProvider } from "./base";
import {
  QuizConfig,
  GeneratedQuiz,
  ProviderCapabilities,
} from "@/types/ai-quiz";
import { getBaselineXP, getMaxPossibleXP } from "../difficulty-mapper";

export class OpenAIProvider extends BaseAIProvider {
  name = "OpenAI";
  type = "OPENAI";
  private client: OpenAI;
  private modelName: string;

  constructor(modelName: string = "gpt-4o-mini") {
    super();
    this.modelName = modelName;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    this.client = new OpenAI({ apiKey });
  }

  async generateQuestions(config: QuizConfig): Promise<GeneratedQuiz> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(config);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content:
              "You are an expert quiz creator. Always return valid JSON without markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("No response from OpenAI API");
      }

      // Validate response is not empty or error message
      if (responseText.trim().length === 0) {
        throw new Error("Empty response from OpenAI API");
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
        id: `openai-${Date.now()}`,
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
          provider: "OpenAI",
        },
      } as GeneratedQuiz;
    } catch (error) {
      console.error("OpenAI generation error:", error);

      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          throw new Error(
            "Invalid OpenAI API key. Please check your configuration."
          );
        }
        if (error.message.includes("rate limit")) {
          throw new Error(
            "OpenAI rate limit exceeded. Please try again in a few moments."
          );
        }
        if (error.message.includes("quota")) {
          throw new Error(
            "OpenAI quota exceeded. Please check your billing settings."
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
      maxTokens: 4096,
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
    // GPT-4o-mini: ~$0.001 per 10 questions
    // GPT-4o: ~$0.025 per 10 questions
    const costPer10 = this.modelName.includes("mini") ? 0.001 : 0.025;
    return (questionCount / 10) * costPer10;
  }
}
