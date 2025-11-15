// AI Provider Factory

import { BaseAIProvider } from "./base";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { DeepSeekProvider } from "./deepseek";

export type ProviderType =
  | "openai-gpt4o"
  | "openai-gpt4o-mini"
  | "openai-gpt35-turbo"
  | "anthropic-opus"
  | "anthropic-sonnet"
  | "anthropic-haiku"
  | "gemini-pro"
  | "gemini-flash"
  | "deepseek";

export function getProvider(providerId: string): BaseAIProvider {
  // Validate provider ID format
  if (!providerId || typeof providerId !== "string") {
    throw new Error("Invalid provider ID");
  }

  // Sanitize provider ID (prevent injection)
  const sanitizedId = providerId.toLowerCase().trim();

  switch (sanitizedId) {
    case "openai-gpt4o":
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }
      return new OpenAIProvider("gpt-4o");
    case "openai-gpt4o-mini":
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }
      return new OpenAIProvider("gpt-4o-mini");
    case "openai-gpt35-turbo":
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }
      return new OpenAIProvider("gpt-3.5-turbo");
    case "anthropic-opus":
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Anthropic API key not configured");
      }
      return new AnthropicProvider("claude-opus-4-1-20250805");
    case "anthropic-sonnet":
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Anthropic API key not configured");
      }
      return new AnthropicProvider("claude-sonnet-4-5-20250929");
    case "anthropic-haiku":
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("Anthropic API key not configured");
      }
      return new AnthropicProvider("claude-haiku-4-5-20251001");
    case "gemini-pro":
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured");
      }
      return new GeminiProvider("gemini-2.5-pro");
    case "gemini-flash":
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured");
      }
      return new GeminiProvider("gemini-2.5-flash");
    case "deepseek":
      if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error("DeepSeek API key not configured");
      }
      return new DeepSeekProvider("deepseek-chat");
    default:
      throw new Error(`Unknown provider: ${sanitizedId}`);
  }
}

export function isProviderAvailable(providerId: string): boolean {
  try {
    const sanitizedId = providerId.toLowerCase().trim();

    // Check if required API key is configured
    if (sanitizedId.startsWith("openai-")) {
      return process.env.OPENAI_API_KEY !== undefined;
    } else if (sanitizedId.startsWith("anthropic-")) {
      return process.env.ANTHROPIC_API_KEY !== undefined;
    } else if (sanitizedId.startsWith("gemini-")) {
      return process.env.GEMINI_API_KEY !== undefined;
    } else if (sanitizedId === "deepseek") {
      return process.env.DEEPSEEK_API_KEY !== undefined;
    }

    return false;
  } catch {
    return false;
  }
}

export async function validateProvider(providerId: string): Promise<boolean> {
  try {
    const provider = getProvider(providerId);
    return await provider.validateApiKey();
  } catch {
    return false;
  }
}
