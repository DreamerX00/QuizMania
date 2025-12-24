import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the adapter
const adapter = new PrismaPg({ pool });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding AI providers...");

  // Create OpenAI provider
  const openai = await prisma.aIProvider.upsert({
    where: { name: "OpenAI" },
    update: {
      isActive: false,
      isRecommended: false,
      description: "OpenAI GPT-4o - Currently unavailable (quota exceeded)",
    },
    create: {
      name: "OpenAI",
      type: "OPENAI",
      apiKeyEnvVar: "OPENAI_API_KEY",
      apiEndpoint: "https://api.openai.com/v1",
      modelName: "gpt-4o",
      modelVersion: "gpt-4o-2024-05-13",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      supportedLanguages: ["en", "es", "fr", "de", "ja", "zh"],
      avgResponseTime: 15,
      costPerRequest: 0.05,
      tokensPerQuestion: 500,
      successRate: 0.98,
      isActive: false,
      isRecommended: false,
      isPremiumOnly: false,
      description: "OpenAI GPT-4o - Currently unavailable (quota exceeded)",
    },
  });
  console.log("✓ Created/updated OpenAI provider:", openai.id);

  // Create Anthropic provider
  const anthropic = await prisma.aIProvider.upsert({
    where: { name: "Anthropic" },
    update: {
      isActive: false,
      isRecommended: false,
      description:
        "Anthropic Claude - Currently unavailable (insufficient credits)",
    },
    create: {
      name: "Anthropic",
      type: "ANTHROPIC",
      apiKeyEnvVar: "ANTHROPIC_API_KEY",
      apiEndpoint: "https://api.anthropic.com/v1",
      modelName: "claude-3-5-sonnet-20241022",
      modelVersion: "claude-3-5-sonnet-20241022",
      maxTokens: 8192,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      supportedLanguages: ["en", "es", "fr", "de", "ja", "zh"],
      avgResponseTime: 12,
      costPerRequest: 0.03,
      tokensPerQuestion: 400,
      successRate: 0.97,
      isActive: false,
      isRecommended: false,
      isPremiumOnly: false,
      description:
        "Anthropic Claude - Currently unavailable (insufficient credits)",
    },
  });
  console.log("✓ Created/updated Anthropic provider:", anthropic.id);

  // Create Gemini provider
  const gemini = await prisma.aIProvider.upsert({
    where: { name: "Google Gemini" },
    update: {
      isActive: true,
      isRecommended: true,
      description: "Google Gemini 1.5 Pro - Recommended, fast and reliable",
    },
    create: {
      name: "Google Gemini",
      type: "GOOGLE_GEMINI",
      apiKeyEnvVar: "GEMINI_API_KEY",
      apiEndpoint: "https://generativelanguage.googleapis.com/v1",
      modelName: "gemini-1.5-pro",
      modelVersion: "gemini-1.5-pro-latest",
      maxTokens: 8192,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: true,
      supportsCode: true,
      supportedLanguages: ["en", "es", "fr", "de", "ja", "zh", "hi"],
      avgResponseTime: 10,
      costPerRequest: 0.02,
      tokensPerQuestion: 350,
      successRate: 0.96,
      isActive: true,
      isRecommended: true,
      isPremiumOnly: false,
      description: "Google Gemini 1.5 Pro - Recommended, fast and reliable",
    },
  });
  console.log("✓ Created/updated Gemini provider:", gemini.id);

  // Create DeepSeek provider
  const deepseek = await prisma.aIProvider.upsert({
    where: { name: "DeepSeek" },
    update: {
      isActive: true,
      description: "DeepSeek - Fast and cost-effective alternative",
    },
    create: {
      name: "DeepSeek",
      type: "DEEPSEEK",
      apiKeyEnvVar: "DEEPSEEK_API_KEY",
      apiEndpoint: "https://api.deepseek.com/v1",
      modelName: "deepseek-chat",
      modelVersion: "deepseek-chat",
      maxTokens: 4096,
      maxQuestionsPerCall: 50,
      supportsStreaming: true,
      supportsImages: false,
      supportsCode: true,
      supportedLanguages: ["en", "zh"],
      avgResponseTime: 8,
      costPerRequest: 0.01,
      tokensPerQuestion: 300,
      successRate: 0.95,
      isActive: true,
      isRecommended: false,
      isPremiumOnly: false,
      description: "DeepSeek - Fast and cost-effective alternative",
    },
  });
  console.log("✓ Created/updated DeepSeek provider:", deepseek.id);

  console.log("\n✅ Seeding completed successfully!");
  console.log(`Created/updated ${4} AI providers`);
}

main()
  .catch((e) => {
    console.error("Error seeding AI providers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
