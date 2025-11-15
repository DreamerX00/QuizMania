// DeepSeek Provider Implementation

import { BaseAIProvider } from "./base";
import {
  QuizConfig,
  GeneratedQuiz,
  ProviderCapabilities,
} from "@/types/ai-quiz";
import { getBaselineXP, getMaxPossibleXP } from "../difficulty-mapper";

export class DeepSeekProvider extends BaseAIProvider {
  name = "DeepSeek";
  type = "DEEPSEEK";
  private apiKey: string;
  private modelName: string;
  private apiEndpoint: string;

  constructor(modelName: string = "deepseek-chat") {
    super();
    this.modelName = modelName;
    this.apiEndpoint = "https://api.deepseek.com/v1/chat/completions";

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is required");
    }

    this.apiKey = apiKey;
  }

  async generateQuestions(config: QuizConfig): Promise<GeneratedQuiz> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(config);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
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
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DeepSeek API error (${response.status}):`, errorText);
        throw new Error(
          `DeepSeek API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response structure from DeepSeek API");
      }

      const content = data.choices[0].message.content;
      let quizData;

      try {
        quizData = JSON.parse(content);
      } catch {
        console.error("Failed to parse DeepSeek response:", content);
        throw new Error("Invalid JSON response from DeepSeek API");
      }

      // Validate the quiz structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        console.error("Invalid quiz structure:", quizData);
        throw new Error("Invalid quiz structure in DeepSeek response");
      }

      if (!this.validateQuizStructure(quizData)) {
        throw new Error("Invalid quiz structure returned from AI");
      }

      const generationTime = Date.now() - startTime;

      // Calculate XP values
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
        id: `deepseek-${Date.now()}`,
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
          generationTime,
          provider: "DeepSeek",
        },
      } as GeneratedQuiz;
    } catch (error) {
      console.error("Error generating quiz with DeepSeek:", error);
      throw error;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: false,
      supportsCode: true,
      supportedLanguages: ["en", "zh", "es", "fr", "de", "ja", "ko"],
    };
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: "user",
              content: "Hello",
            },
          ],
          max_tokens: 5,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("DeepSeek API key validation failed:", error);
      return false;
    }
  }

  estimateCost(questionCount: number): number {
    // DeepSeek pricing is very competitive
    // Approximate: $0.14 per 1M input tokens, $0.28 per 1M output tokens
    // Average quiz generation uses ~1000 input tokens and ~2000 output tokens
    const inputTokens = questionCount * 200; // Rough estimate
    const outputTokens = questionCount * 400; // Rough estimate

    const inputCost = (inputTokens / 1_000_000) * 0.14;
    const outputCost = (outputTokens / 1_000_000) * 0.28;

    return inputCost + outputCost;
  }
}
