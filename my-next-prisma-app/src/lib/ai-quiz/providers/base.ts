// Base AI Provider Class

import {
  QuizConfig,
  GeneratedQuiz,
  ProviderCapabilities,
} from "@/types/ai-quiz";

export abstract class BaseAIProvider {
  abstract name: string;
  abstract type: string;

  abstract generateQuestions(config: QuizConfig): Promise<GeneratedQuiz>;

  abstract validateApiKey(): Promise<boolean>;

  abstract getCapabilities(): ProviderCapabilities;

  abstract estimateCost(questionCount: number): number;

  protected buildPrompt(config: QuizConfig): string {
    const {
      subject,
      className,
      domain,
      topics,
      difficultyLevel,
      questionCount,
      customInstructions,
      focusAreas,
      excludeTopics,
      includeCode,
    } = config;

    const difficultyDescriptions = [
      "", // 0 - not used
      "very basic and simple, suitable for absolute beginners",
      "easy questions for those just starting to learn",
      "elementary level requiring basic understanding",
      "intermediate difficulty for average learners",
      "advanced questions requiring solid knowledge",
      "expert level for experienced learners",
      "master level with complex problem-solving",
      "virtuoso level requiring deep expertise",
      "legendary difficulty for elite learners",
      "god level - the ultimate challenge",
    ];

    const prompt = `You are an expert quiz creator. Generate ${questionCount} high-quality multiple-choice questions (MCQs) for the following requirements:

**Subject**: ${subject}
${className ? `**Grade/Level**: ${className}` : ""}
${domain ? `**Domain**: ${domain}` : ""}
**Topics**: ${topics.join(", ")}
**Difficulty**: Level ${difficultyLevel}/10 (${
      difficultyDescriptions[difficultyLevel]
    })

${customInstructions ? `**Special Instructions**: ${customInstructions}\n` : ""}
${
  focusAreas && focusAreas.length > 0
    ? `**Focus Areas**: ${focusAreas.join(", ")}\n`
    : ""
}
${
  excludeTopics && excludeTopics.length > 0
    ? `**Exclude Topics**: ${excludeTopics.join(", ")}\n`
    : ""
}
${includeCode ? "**Include**: Code snippets where relevant\n" : ""}

**Requirements**:
1. Each question must have exactly 4 options (A, B, C, D)
2. Only one correct answer per question
3. Provide detailed explanations for correct answers
4. Questions should be clear, unambiguous, and well-structured
5. Avoid trick questions or ambiguous wording
6. Progressively increase difficulty within the set
7. Cover different aspects of the topics
8. Make distractors (wrong answers) plausible but clearly incorrect

**Output Format** (JSON):
Return a valid JSON object with this exact structure:
{
  "title": "Brief quiz title",
  "description": "One sentence description",
  "questions": [
    {
      "id": "q1",
      "text": "Question text here?",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"},
        {"id": "d", "text": "Option D"}
      ],
      "correctAnswer": "a",
      "explanation": "Detailed explanation why this is correct",
      "difficulty": ${difficultyLevel},
      "topic": "Specific topic",
      "estimatedTime": 60,
      "points": ${10 + difficultyLevel * 5}
    }
  ]
}

**CRITICAL JSON FORMATTING RULES**:
- Use ONLY escaped newlines (\\n) for line breaks within text strings
- Do NOT include actual newline characters in JSON string values
- For code snippets, use \\n for new lines and escape all special characters
- Example: "text": "Code:\\nint x = 5;\\nreturn x;"
- Do NOT include commentary or notes outside the JSON structure
- Return ONLY the JSON object, no markdown code blocks or additional text

Generate the quiz now. Return ONLY valid JSON.`;

    return prompt;
  }

  protected validateQuizStructure(data: unknown): boolean {
    if (!data || typeof data !== "object") return false;
    const quiz = data as { title?: string; questions?: unknown[] };
    if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions))
      return false;

    for (const q of quiz.questions) {
      // Type guard: ensure q is an object
      if (!q || typeof q !== "object") return false;

      const question = q as {
        id?: string;
        text?: string;
        question?: string;
        options?: unknown[];
        correctAnswer?: string;
        explanation?: string;
      };

      // Accept either 'text' or 'question' field for backward compatibility
      const questionText = question.text || question.question;

      if (
        !question.id ||
        !questionText ||
        !question.options ||
        !question.correctAnswer ||
        !question.explanation
      ) {
        return false;
      }

      if (!Array.isArray(question.options) || question.options.length !== 4) {
        return false;
      }

      const validAnswers = ["a", "b", "c", "d"];
      if (!validAnswers.includes(question.correctAnswer.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  protected cleanJsonResponse(text: string): string {
    // Remove markdown code blocks (triple backticks)
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // Remove any leading/trailing whitespace
    text = text.trim();

    // Remove any trailing single backticks that sometimes get added
    text = text.replace(/`+\s*$/g, "");

    // Remove any leading single backticks
    text = text.replace(/^`+\s*/g, "");

    return text;
  }
}
