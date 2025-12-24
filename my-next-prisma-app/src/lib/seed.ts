import { PrismaClient, AIProviderType } from "@/generated/prisma/client";
import { seedAchievements } from "./achievements";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function seedAIProviders() {
  console.log("Seeding AI Providers...");

  const providers = [
    {
      id: "openai-gpt4o",
      name: "OpenAI GPT-4o",
      type: AIProviderType.OPENAI,
      apiKeyEnvVar: "OPENAI_API_KEY",
      apiEndpoint: "https://api.openai.com/v1",
      modelName: "gpt-4o",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      avgResponseTime: 20,
      costPerRequest: 0.01,
      isActive: true,
      isRecommended: true,
      isPremiumOnly: false,
    },
    {
      id: "openai-gpt4o-mini",
      name: "OpenAI GPT-4o Mini",
      type: AIProviderType.OPENAI,
      apiKeyEnvVar: "OPENAI_API_KEY",
      apiEndpoint: "https://api.openai.com/v1",
      modelName: "gpt-4o-mini",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      avgResponseTime: 15,
      costPerRequest: 0.005,
      isActive: true,
      isRecommended: false,
      isPremiumOnly: false,
    },
    {
      id: "anthropic-sonnet",
      name: "Anthropic Claude 4.5 Sonnet",
      type: AIProviderType.ANTHROPIC,
      apiKeyEnvVar: "ANTHROPIC_API_KEY",
      apiEndpoint: "https://api.anthropic.com/v1",
      modelName: "claude-sonnet-4-5-20250929",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      avgResponseTime: 24,
      costPerRequest: 0.009,
      isActive: true,
      isRecommended: true,
      isPremiumOnly: false,
    },
    {
      id: "anthropic-opus",
      name: "Anthropic Claude 4.1 Opus",
      type: AIProviderType.ANTHROPIC,
      apiKeyEnvVar: "ANTHROPIC_API_KEY",
      apiEndpoint: "https://api.anthropic.com/v1",
      modelName: "claude-opus-4-1-20250805",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      avgResponseTime: 32,
      costPerRequest: 0.042,
      isActive: true,
      isRecommended: true,
      isPremiumOnly: false,
    },
    {
      id: "anthropic-haiku",
      name: "Anthropic Claude 4.5 Haiku",
      type: AIProviderType.ANTHROPIC,
      apiKeyEnvVar: "ANTHROPIC_API_KEY",
      apiEndpoint: "https://api.anthropic.com/v1",
      modelName: "claude-haiku-4-5-20251001",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: false,
      supportsCode: true,
      avgResponseTime: 14,
      costPerRequest: 0.00065,
      isActive: true,
      isRecommended: false,
      isPremiumOnly: false,
    },
    {
      id: "gemini-pro",
      name: "Google Gemini 2.5 Pro",
      type: AIProviderType.GOOGLE_GEMINI,
      apiKeyEnvVar: "GEMINI_API_KEY",
      apiEndpoint: "https://generativelanguage.googleapis.com/v1beta",
      modelName: "gemini-2.5-pro",
      maxTokens: 8192,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      avgResponseTime: 30,
      costPerRequest: 0.0,
      isActive: true,
      isRecommended: false,
      isPremiumOnly: false,
    },
    {
      id: "gemini-flash",
      name: "Google Gemini 2.5 Flash",
      type: AIProviderType.GOOGLE_GEMINI,
      apiKeyEnvVar: "GEMINI_API_KEY",
      apiEndpoint: "https://generativelanguage.googleapis.com/v1beta",
      modelName: "gemini-2.5-flash",
      maxTokens: 8192,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      avgResponseTime: 15,
      costPerRequest: 0.0,
      isActive: true,
      isRecommended: true,
      isPremiumOnly: false,
    },
    {
      id: "deepseek",
      name: "DeepSeek Chat",
      type: AIProviderType.DEEPSEEK,
      apiKeyEnvVar: "DEEPSEEK_API_KEY",
      apiEndpoint: "https://api.deepseek.com/v1",
      modelName: "deepseek-chat",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: false,
      supportsCode: true,
      avgResponseTime: 20,
      costPerRequest: 0.001,
      isActive: true,
      isRecommended: false,
      isPremiumOnly: false,
    },
  ];

  for (const provider of providers) {
    await prisma.aIProvider.upsert({
      where: { id: provider.id },
      update: provider,
      create: provider,
    });
  }

  console.log(`✅ Seeded ${providers.length} AI providers`);
}

async function main() {
  console.log("Starting database seeding...");
  await seedAIProviders();
  await seedAchievements();
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
