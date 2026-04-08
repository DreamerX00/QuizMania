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
              "You are an expert quiz creator. You MUST return ONLY a valid JSON object with no markdown, no code fences, no explanatory text before or after. Do NOT include real newline characters inside JSON string values — use \\n instead.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 8192,
        // Force JSON output mode — prevents LLaMA from adding preamble text
        response_format: { type: "json_object" },
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
      maxTokens: 8192,
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

  /**
   * Override base cleaning with LLaMA-specific sanitisation.
   * LLaMA can still emit literal newline / tab / control characters inside
   * JSON string values even when response_format json_object is set.  A
   * character-level parser walks the text and escapes any bare control
   * characters found inside quoted strings so that JSON.parse succeeds.
   */
  protected cleanJsonResponse(text: string): string {
    // Apply base cleaning first (strip markdown fences, extract JSON object)
    text = super.cleanJsonResponse(text);

    // Fix literal control characters inside JSON string values
    text = this.fixControlCharsInStrings(text);

    return text;
  }

  /**
   * Walk the JSON text character by character, tracking whether we are
   * inside a quoted string.  Any bare control character (newline, carriage
   * return, tab, or other char < 0x20) found inside a string is replaced
   * with its proper JSON escape sequence so that JSON.parse does not throw.
   */
  private fixControlCharsInStrings(text: string): string {
    let result = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === undefined) continue;
      const code = char.charCodeAt(0);

      if (escaped) {
        result += char;
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        result += char;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }

      if (inString && code < 0x20) {
        // Replace bare control characters with their JSON escape sequences
        if (char === "\n") {
          result += "\\n";
        } else if (char === "\r") {
          result += "\\r";
        } else if (char === "\t") {
          result += "\\t";
        } else {
          // Other control characters are not legal in JSON strings; drop them
          result += " ";
        }
        continue;
      }

      result += char;
    }

    return result;
  }
}
