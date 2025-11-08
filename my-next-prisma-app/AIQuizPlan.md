# 🤖 AI-Generated Quiz System - Detailed Implementation Plan

> **Premium Feature**: AI Quiz Generation (5 quizzes/day limit)  
> **Launch Date**: TBD  
> **Status**: Planning Phase

---

## 📋 Executive Summary

A premium-only feature allowing users to generate custom quizzes using multiple AI providers (OpenAI, Anthropic, Google Gemini, Cohere, Mistral, etc.). Users can configure subject, topics, difficulty, and question count. The system is standalone but integrates with existing XP and rank progression. Free users are redirected to premium plan page.

---

## 🎯 Core Features

### ✅ **Access Control**

- **Premium Only**: Feature locked behind premium subscription
- **Daily Limit**: 5 quiz generations per day (resets at midnight UTC)
- **Free User Flow**: Redirect to `/premium` or `/pricing` page with feature highlight
- **Premium Tiers**:
  - Basic Premium: 5 quizzes/day
  - Premium Plus: 15 quizzes/day
  - Lifetime: Unlimited quizzes

### ✅ **Multi-AI Provider Support**

Integrate ALL available AI providers that support text generation:

1. **OpenAI** (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
2. **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)
3. **Google Gemini** (Gemini 1.5 Pro, Gemini 1.5 Flash)
4. **Cohere** (Command R+, Command R)
5. **Mistral AI** (Mistral Large, Mistral Medium)
6. **Meta Llama** (via Groq/Together AI)
7. **Perplexity AI**
8. **AI21 Labs** (Jurassic-2)
9. **Anthropic** (Claude Instant)
10. **HuggingFace** (Open models via Inference API)

**Provider Selection Criteria**:

- Must support API access
- Reliable JSON output formatting
- Cost-effective for quiz generation
- Good at following complex instructions

### ✅ **Standalone Architecture**

- Separate from existing quiz system
- Own database tables and logic
- Independent leaderboard
- Unique URL structure: `/generate-random-quiz/*`
- Own achievement system
- Dedicated analytics

---

## 🗄️ Database Schema

```prisma
// Add to schema.prisma

// ==========================================
// AI QUIZ GENERATION SYSTEM
// ==========================================

enum AIProviderType {
  OPENAI
  ANTHROPIC
  GOOGLE_GEMINI
  COHERE
  MISTRAL
  META_LLAMA
  PERPLEXITY
  AI21
  HUGGINGFACE
  OTHER
}

enum AIQuizStatus {
  DRAFT
  GENERATING
  READY
  ACTIVE
  COMPLETED
  FAILED
  ARCHIVED
}

enum DifficultyTier {
  NOVICE        // Level 1 - 🌱
  BEGINNER      // Level 2 - 📘
  ELEMENTARY    // Level 3 - 🔍
  INTERMEDIATE  // Level 4 - 🧠
  ADVANCED      // Level 5 - 📜
  EXPERT        // Level 6 - ⚡
  MASTER        // Level 7 - 🧩
  VIRTUOSO      // Level 8 - 🎯
  LEGENDARY     // Level 9 - 🔥
  GOD_LEVEL     // Level 10 - 👑
}

// AI Provider Configuration (Admin Only)
model AIProvider {
  id                String          @id @default(cuid())
  name              String          @unique // "OpenAI", "Anthropic", etc.
  type              AIProviderType
  apiKey            String?         // Encrypted, stored in env
  apiEndpoint       String
  modelName         String          // "gpt-4o", "claude-3-5-sonnet-20241022"
  modelVersion      String?

  // Capabilities
  maxTokens         Int             @default(4096)
  maxQuestionsPerCall Int           @default(50)
  supportsStreaming Boolean         @default(false)
  supportsImages    Boolean         @default(false)
  supportsCode      Boolean         @default(true)
  supportedLanguages String[]       @default(["en"])

  // Performance & Cost
  avgResponseTime   Int             @default(30) // seconds
  costPerRequest    Float           @default(0.0) // USD
  tokensPerQuestion Int             @default(500) // estimated
  successRate       Float           @default(0.95)

  // Status
  isActive          Boolean         @default(true)
  isRecommended     Boolean         @default(false)
  isPremiumOnly     Boolean         @default(false)

  // Metadata
  description       String?         @db.Text
  icon              String?
  websiteUrl        String?

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  generatedQuizzes  AIGeneratedQuiz[]

  @@index([isActive, isRecommended])
}

// AI Generated Quiz
model AIGeneratedQuiz {
  id                String          @id @default(cuid())
  slug              String          @unique
  userId            String
  providerId        String

  // Quiz Configuration
  title             String          @default("AI Generated Quiz")
  description       String?         @db.Text

  subject           String          // "Mathematics", "Science", "History", etc.
  className         String?         // "10th Grade", "Undergraduate", "Professional"
  domain            String?         // "Algebra", "Physics", "World History"
  topics            String[]        // ["Quadratic Equations", "Polynomials"]

  difficultyLevel   Int             // 1-10
  difficultyTier    DifficultyTier
  questionCount     Int

  // AI Generation Details
  aiPrompt          String          @db.Text
  aiResponse        String?         @db.Text
  generationTime    Int             // milliseconds
  tokensUsed        Int             @default(0)
  modelUsed         String
  generatedAt       DateTime?

  // Quiz Content (JSON Structure)
  questions         Json            // Array of QuestionObject
  // QuestionObject Structure:
  // {
  //   id: string,
  //   question: string,
  //   options: [{id: string, text: string}],
  //   correctAnswer: string,
  //   explanation: string,
  //   difficulty: number,
  //   topic: string,
  //   estimatedTime: number,
  //   imageUrl?: string,
  //   codeSnippet?: string,
  //   points: number
  // }

  // Quiz Settings
  timeLimit         Int?            // seconds (null = unlimited)
  allowSkip         Boolean         @default(true)
  showExplanations  Boolean         @default(true)
  shuffleQuestions  Boolean         @default(true)
  shuffleOptions    Boolean         @default(true)
  isAdaptive        Boolean         @default(false) // Adaptive difficulty

  // Access Control
  status            AIQuizStatus    @default(DRAFT)
  isPublic          Boolean         @default(false)
  allowReplay       Boolean         @default(true)
  requiresPremium   Boolean         @default(true)

  // XP & Rewards
  baseXP            Int             // Based on difficulty
  bonusXPMultiplier Float           @default(1.0)
  perfectScoreBonus Int             @default(0)
  speedBonusEnabled Boolean         @default(true)

  // Statistics
  viewCount         Int             @default(0)
  attemptCount      Int             @default(0)
  averageScore      Float           @default(0)
  completionRate    Float           @default(0)

  // Metadata
  tags              String[]        @default([])
  isArchived        Boolean         @default(false)
  isFeatured        Boolean         @default(false)

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider          AIProvider      @relation(fields: [providerId], references: [id])
  attempts          AIQuizAttempt[]

  @@index([userId, status])
  @@index([subject, difficultyLevel])
  @@index([isPublic, isFeatured])
  @@index([createdAt])
}

// User's Quiz Attempt
model AIQuizAttempt {
  id                String          @id @default(cuid())
  quizId            String
  userId            String
  attemptNumber     Int             @default(1)

  // Attempt Status
  status            String          @default("in-progress") // in-progress, completed, abandoned

  // Answers (JSON Structure)
  answers           Json            // {questionId: {selected: string, timeSpent: number, skipped: boolean}}

  // Scoring
  totalQuestions    Int
  correctCount      Int             @default(0)
  wrongCount        Int             @default(0)
  skippedCount      Int             @default(0)
  score             Int             @default(0) // Out of 100
  percentage        Float           @default(0)

  // Timing
  startedAt         DateTime        @default(now())
  completedAt       DateTime?
  totalTimeSpent    Int             @default(0) // seconds
  averageTimePerQ   Int             @default(0) // seconds

  // Performance Metrics
  accuracy          Float           @default(0) // Percentage
  streak            Int             @default(0) // Longest correct streak
  fastestAnswer     Int?            // seconds
  slowestAnswer     Int?            // seconds

  // XP & Rewards
  xpEarned          Int             @default(0)
  baseXP            Int             @default(0)
  accuracyBonus     Int             @default(0)
  speedBonus        Int             @default(0)
  streakBonus       Int             @default(0)
  perfectBonus      Int             @default(0)

  // Additional Data
  deviceType        String?         // "mobile", "tablet", "desktop"
  userAgent         String?
  ipAddress         String?

  // Review Status
  hasReviewed       Boolean         @default(false)
  reviewedAt        DateTime?

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  quiz              AIGeneratedQuiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([quizId])
  @@index([createdAt])
  @@unique([quizId, userId, attemptNumber])
}

// Quiz Generation Quota Tracking
model AIQuizGenerationQuota {
  id                String          @id @default(cuid())
  userId            String

  // Daily Quota
  dailyLimit        Int             // Based on plan: Basic=5, Plus=15, Lifetime=999
  dailyUsed         Int             @default(0)
  lastResetDate     DateTime        @default(now())

  // Lifetime Stats
  totalGenerated    Int             @default(0)
  totalAttempts     Int             @default(0)
  totalXPEarned     Int             @default(0)

  // Current Session
  currentStreak     Int             @default(0)
  longestStreak     Int             @default(0)

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
  @@index([userId, lastResetDate])
}

// Pre-made Quiz Templates
model AIQuizTemplate {
  id                String          @id @default(cuid())
  name              String          // "SAT Math Practice Level 1"
  description       String          @db.Text
  icon              String          @default("📝")
  category          String          // "Exam Prep", "Study Guide", "Practice Test"

  // Pre-configured Settings
  subject           String
  className         String?
  domain            String?
  topics            String[]
  difficultyLevel   Int
  difficultyTier    DifficultyTier
  questionCount     Int
  timeLimit         Int?

  // AI Instructions
  customPrompt      String?         @db.Text
  focusAreas        String[]        @default([])
  excludeTopics     String[]        @default([])

  // Template Settings
  isPopular         Boolean         @default(false)
  isFeatured        Boolean         @default(false)
  isPremiumOnly     Boolean         @default(false)

  // Usage Stats
  usageCount        Int             @default(0)
  averageRating     Float           @default(0)

  // Metadata
  tags              String[]        @default([])
  createdBy         String?         // userId or "system"

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([isPopular, isFeatured])
  @@index([category, subject])
}

// User's AI Quiz Achievements
model AIQuizAchievement {
  id                String          @id @default(cuid())
  userId            String

  achievementKey    String          // "first_ai_quiz", "perfectionist", "speed_demon"
  achievementName   String
  description       String
  icon              String

  unlockedAt        DateTime        @default(now())

  // Stats at unlock time
  totalQuizzes      Int             @default(0)
  totalScore        Int             @default(0)

  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementKey])
  @@index([userId])
}

// Add relations to User model (append to existing User model)
// model User {
//   ...existing fields...
//
//   // AI Quiz Relations
//   aiGeneratedQuizzes    AIGeneratedQuiz[]
//   aiQuizAttempts        AIQuizAttempt[]
//   aiQuizGenerationQuota AIQuizGenerationQuota?
//   aiQuizAchievements    AIQuizAchievement[]
// }
```

---

## 🏗️ File Structure

```
src/
├── app/
│   ├── generate-random-quiz/
│   │   ├── page.tsx                          # Main landing/selection page
│   │   ├── layout.tsx                        # Premium check wrapper
│   │   ├── configure/
│   │   │   └── page.tsx                      # Step 2: Configuration wizard
│   │   ├── generating/
│   │   │   └── [quizId]/
│   │   │       └── page.tsx                  # Step 3: Generation progress
│   │   ├── preview/
│   │   │   └── [quizId]/
│   │   │       └── page.tsx                  # Step 4: Quiz preview
│   │   ├── play/
│   │   │   └── [quizId]/
│   │   │       └── page.tsx                  # Step 5: Playing interface
│   │   └── results/
│   │       └── [attemptId]/
│   │           └── page.tsx                  # Step 6: Results & review
│   │
│   ├── api/
│   │   └── ai-quiz/
│   │       ├── providers/
│   │       │   ├── route.ts                  # GET: List providers
│   │       │   └── [id]/
│   │       │       └── route.ts              # GET: Provider details
│   │       ├── quota/
│   │       │   └── route.ts                  # GET: User's quota status
│   │       ├── generate/
│   │       │   ├── route.ts                  # POST: Start generation
│   │       │   └── stream/
│   │       │       └── route.ts              # GET: SSE streaming
│   │       ├── quiz/
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts              # GET, PATCH, DELETE
│   │       │   │   └── preview/
│   │       │   │       └── route.ts          # GET: Preview data
│   │       │   └── list/
│   │       │       └── route.ts              # GET: User's quizzes
│   │       ├── attempt/
│   │       │   ├── start/
│   │       │   │   └── route.ts              # POST: Start attempt
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts              # GET, PATCH
│   │       │   │   ├── save/
│   │       │   │   │   └── route.ts          # POST: Save progress
│   │       │   │   └── submit/
│   │       │   │       └── route.ts          # POST: Submit final
│   │       │   └── review/
│   │       │       └── [id]/
│   │       │           └── route.ts          # GET: Review data
│   │       ├── templates/
│   │       │   ├── route.ts                  # GET: List templates
│   │       │   └── [id]/
│   │       │       └── use/
│   │       │           └── route.ts          # POST: Use template
│   │       ├── leaderboard/
│   │       │   └── route.ts                  # GET: AI quiz rankings
│   │       └── achievements/
│   │           └── route.ts                  # GET: User achievements
│
├── components/
│   └── ai-quiz/
│       ├── ProviderCard.tsx                  # AI provider selection card
│       ├── ProviderComparison.tsx            # Comparison table
│       ├── QuotaDisplay.tsx                  # Shows remaining generations
│       ├── PremiumGate.tsx                   # Redirect gate component
│       ├── ConfigurationWizard.tsx           # Multi-step form
│       │   ├── SubjectSelector.tsx
│       │   ├── TopicSelector.tsx
│       │   ├── DifficultySlider.tsx
│       │   ├── AdvancedOptions.tsx
│       │   └── ConfigSummary.tsx
│       ├── GenerationProgress.tsx            # Real-time progress
│       ├── QuizPreview.tsx                   # Preview before start
│       ├── QuizPlayer.tsx                    # Playing interface
│       │   ├── QuestionCard.tsx
│       │   ├── OptionsList.tsx
│       │   ├── ProgressBar.tsx
│       │   ├── Timer.tsx
│       │   └── Navigation.tsx
│       ├── ResultsDashboard.tsx              # Results display
│       │   ├── ScoreCard.tsx
│       │   ├── XPBreakdown.tsx
│       │   ├── PerformanceMetrics.tsx
│       │   └── AIInsights.tsx
│       ├── QuestionReview.tsx                # Review interface
│       │   ├── ReviewCard.tsx
│       │   └── ExplanationPanel.tsx
│       ├── TemplateCard.tsx                  # Template selection
│       ├── AIQuizCard.tsx                    # Quiz card in list
│       └── LeaderboardWidget.tsx             # Mini leaderboard
│
├── lib/
│   └── ai-quiz/
│       ├── providers/
│       │   ├── index.ts                      # Provider factory
│       │   ├── openai.ts                     # OpenAI integration
│       │   ├── anthropic.ts                  # Anthropic integration
│       │   ├── gemini.ts                     # Google Gemini
│       │   ├── cohere.ts                     # Cohere
│       │   ├── mistral.ts                    # Mistral AI
│       │   ├── llama.ts                      # Meta Llama (via Groq)
│       │   └── base.ts                       # Base provider class
│       ├── prompt-engineering.ts             # Prompt templates
│       ├── quiz-parser.ts                    # Parse AI responses
│       ├── quiz-validator.ts                 # Validate questions
│       ├── xp-calculator.ts                  # XP calculation logic
│       ├── quota-manager.ts                  # Quota tracking
│       ├── difficulty-mapper.ts              # Map levels to tiers
│       └── analytics.ts                      # Track metrics
│
├── services/
│   └── aiQuizService.ts                      # Business logic layer
│
├── types/
│   └── ai-quiz.ts                            # TypeScript types
│
└── constants/
    └── ai-quiz.ts                            # Constants & configs
```

---

## 🎨 User Journey Flow

### **Landing Page** (`/generate-random-quiz`)

**For Premium Users:**

1. Hero section with feature highlights
2. Daily quota display (e.g., "3/5 quizzes remaining today")
3. Two main sections:
   - **Quick Templates** (SAT Math, GRE Verbal, GCSE Biology, etc.)
   - **AI Provider Selection** (Grid of provider cards)

**For Free Users:**

1. Hero section with blurred features
2. Premium benefits list
3. Large "Upgrade to Premium" CTA button
4. Feature highlights with locked badges
5. Redirect to `/premium` or `/pricing`

---

### **Step 1: AI Provider Selection**

**UI Components:**

- Grid layout (2-3 columns on desktop, 1 on mobile)
- Each provider card shows:
  - Logo/Icon
  - Provider name
  - Model name
  - Recommended badge (if applicable)
  - Key features (supports code, images, etc.)
  - Generation speed estimate
  - Success rate badge
  - "Select" button

**Provider Card Example:**

```tsx
┌─────────────────────────────┐
│  [OpenAI Logo]              │
│  GPT-4o                     │
│  ⭐ Recommended             │
│                             │
│  ✓ Best for all subjects   │
│  ✓ Code support            │
│  ✓ Fast generation (20s)   │
│  📊 98% accuracy           │
│                             │
│  [Select Provider →]        │
└─────────────────────────────┘
```

**Additional Features:**

- "Compare All" button → Opens comparison modal
- Filter: "Show free models only" (if applicable)
- Sort by: Speed, Accuracy, Popularity
- Quick info tooltips

---

### **Step 2: Configuration Wizard**

**Multi-step Form with Progress Indicator:**

```
[1. Subject] → [2. Topics] → [3. Difficulty] → [4. Settings] → [5. Review]
```

**2.1 Subject & Domain Selection**

- Search-enabled dropdown
- Popular subjects as chips
- Visual cards with icons
- Examples: Mathematics, Science, History, Programming, Languages, etc.

**2.2 Class/Grade Level (Optional)**

- Dropdown or slider
- Options: Elementary, Middle School, High School, Undergraduate, Graduate, Professional, General

**2.3 Topics Selection**

- Multi-select with checkboxes
- Search functionality
- "Select All" / "Deselect All"
- AI-suggested topics based on subject
- "Surprise me!" for random selection

**2.4 Difficulty Configuration**

- Visual slider with 10 levels
- Each level displays:
  - Emoji icon
  - Difficulty name
  - Sample question preview (hover)
  - Estimated XP reward
  - Historical pass rate

**Difficulty Scale:**

```
1. 🌱 Novice       →  50 XP  (95% pass rate)
2. 📘 Beginner     →  75 XP  (88% pass rate)
3. 🔍 Elementary   → 100 XP  (80% pass rate)
4. 🧠 Intermediate → 150 XP  (70% pass rate)
5. 📜 Advanced     → 200 XP  (60% pass rate)
6. ⚡ Expert       → 300 XP  (45% pass rate)
7. 🧩 Master       → 450 XP  (30% pass rate)
8. 🎯 Virtuoso     → 650 XP  (20% pass rate)
9. 🔥 Legendary    → 900 XP  (10% pass rate)
10. 👑 God Level   → 1200 XP (5% pass rate)
```

**2.5 Quiz Settings**

- Question count: Slider (5-50 questions)
  - Default: 10
  - Premium Plus/Lifetime can go up to 100
- Time limit: Toggle + Duration picker
  - Options: No limit, 30s/question, 1min/question, 2min/question, Custom
- Question types: MCQ only (for MVP)
- Show explanations: Toggle (default: ON)
- Allow skip: Toggle (default: ON)
- Shuffle questions: Toggle (default: ON)
- Shuffle options: Toggle (default: ON)

**2.6 Advanced Options (Collapsible)**

- Custom instructions: Text area
  - Placeholder: "Focus on practical applications..."
  - Max 500 characters
- Focus areas: Multi-select tags
- Exclude topics: Multi-select
- Include code snippets: Toggle (for programming subjects)
- Include diagrams: Toggle (coming soon)

**2.7 Configuration Summary**

- Review all selections
- Estimated generation time
- XP potential calculation
- Edit buttons for each section
- "Generate Quiz" CTA button

---

### **Step 3: Generation Progress** (`/generating/[quizId]`)

**Real-time Progress Display:**

```
┌─────────────────────────────────────────┐
│                                         │
│  [Animated AI thinking icon]           │
│                                         │
│  Generating your quiz...                │
│                                         │
│  ████████████░░░░ 75%                  │
│                                         │
│  Current step: Crafting questions...    │
│                                         │
│  Questions generated: 8/10              │
│  Tokens used: 3,245                     │
│  Time elapsed: 22s                      │
│  Estimated remaining: 8s                │
│                                         │
│  ⚡ Using: GPT-4o                       │
│                                         │
│  [Cancel Generation]                    │
└─────────────────────────────────────────┘
```

**Progress Steps:**

1. Connecting to AI provider...
2. Constructing prompt...
3. Generating questions...
4. Validating content...
5. Calculating XP...
6. Finalizing quiz...

**Features:**

- Real-time progress bar
- Live token counter
- Cancel button (redirects back to config)
- Auto-redirect to preview on completion
- Error handling with retry option

---

### **Step 4: Quiz Preview** (`/preview/[quizId]`)

**Preview Components:**

- Quiz metadata card
- Question count and distribution
- Estimated completion time
- XP potential display
- Scrollable question list (collapsed view)
- Expand individual questions to see full content

**Quiz Metadata Card:**

```
┌─────────────────────────────────────────┐
│  📝 AI Generated Quiz                   │
│  Mathematics → Algebra → Quadratics     │
│  Difficulty: 🧠 Intermediate (Level 4) │
│                                         │
│  10 Questions  |  ~20 minutes           │
│  Base XP: 150  |  Max XP: 450          │
│                                         │
│  Created with: GPT-4o                   │
│  Generated: Just now                    │
└─────────────────────────────────────────┘
```

**Actions:**

- Start Quiz (Primary CTA)
- Save for Later
- Delete Quiz
- Regenerate (costs 1 quota)
- Share (if public)

---

### **Step 5: Quiz Playing Interface** (`/play/[quizId]`)

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  [Header: Progress, Timer, Score Preview]       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Question 3/10                                  │
│                                                 │
│  What is the solution to x² - 5x + 6 = 0?     │
│                                                 │
│  ⚪ A) x = 1 or x = 6                          │
│  ⚪ B) x = 2 or x = 3                          │
│  ⚪ C) x = -2 or x = -3                        │
│  ⚪ D) x = 0 or x = 5                          │
│                                                 │
│  [Skip Question]                                │
│                                                 │
├─────────────────────────────────────────────────┤
│  [← Previous]              [Next Question →]    │
└─────────────────────────────────────────────────┘
```

**Header Components:**

- Progress bar: Visual indicator of completion
- Timer: Countdown (if enabled)
- Current score preview: "8/10 correct so far"
- Streak indicator: "🔥 5 streak!"
- Pause button

**Question Display:**

- Large, readable text
- Syntax highlighting for code blocks
- Image support (if available)
- Option selection with hover effects
- Selected option highlighted
- Clear visual feedback

**Navigation:**

- Previous/Next buttons
- Question number grid (bottom sheet on mobile)
- Skip button (if enabled)
- Auto-advance option
- Submit button (appears on last question)

**Interaction Features:**

- Keyboard shortcuts:
  - 1-4: Select options A-D
  - N: Next question
  - P: Previous question
  - S: Skip question
  - Enter: Confirm and next
- Auto-save progress every 10 seconds
- Confirmation modal before submitting
- Warning before closing tab (if quiz in progress)

---

### **Step 6: Results & Review** (`/results/[attemptId]`)

**Results Dashboard Layout:**

```
┌─────────────────────────────────────────────────┐
│  🎉 Quiz Completed!                             │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Score     │  │    Grade    │             │
│  │   85/100    │  │      A      │             │
│  └─────────────┘  └─────────────┘             │
│                                                 │
│  🏆 Rank: Expert                               │
│  ⚡ XP Earned: +425                            │
│  🔥 Streak: 7                                  │
│  ⏱️  Time: 18m 32s                             │
└─────────────────────────────────────────────────┘
```

**Performance Metrics:**

- Correct: 8/10 (80%)
- Wrong: 2/10 (20%)
- Skipped: 0/10 (0%)
- Average time per question: 1m 51s
- Fastest answer: 24s
- Slowest answer: 3m 12s
- Accuracy: 80%

**XP Breakdown:**

```
Base XP (Difficulty Level 4):       150
Accuracy Bonus (80%):               +120
Speed Bonus (Under time):            +50
Streak Bonus (7 in a row):           +75
Perfect Sections:                    +30
──────────────────────────────────────
Total XP Earned:                     425 ⚡
```

**Rank Progression:**

- Visual progress bar showing rank advancement
- "Next rank in 575 XP!" motivational text
- Celebratory animation if rank increased

**Question Review Tabs:**

- All Questions (10)
- Correct Answers (8) ✅
- Wrong Answers (2) ❌
- Skipped (0) ⏭️

**Review Card Example:**

```
┌─────────────────────────────────────────────────┐
│  Question 3/10  ❌ Wrong                        │
│                                                 │
│  What is the solution to x² - 5x + 6 = 0?     │
│                                                 │
│  Your Answer:   ⚪ A) x = 1 or x = 6   ❌      │
│  Correct Answer: ⚪ B) x = 2 or x = 3   ✅      │
│                                                 │
│  📖 Explanation:                               │
│  To solve this quadratic equation, we can      │
│  factor it: (x-2)(x-3) = 0                     │
│  Therefore x = 2 or x = 3                      │
│                                                 │
│  ⏱️  Time spent: 1m 45s                         │
│  📊 Difficulty: Intermediate                    │
│  🏷️  Topic: Quadratic Equations               │
└─────────────────────────────────────────────────┘
```

**AI Insights Section:**

```
📊 Performance Analysis

✅ Strengths:
  • Excellent at basic algebraic manipulation
  • Strong grasp of factoring techniques
  • Fast response time on conceptual questions

⚠️ Areas for Improvement:
  • Need more practice with complex equations
  • Review quadratic formula applications
  • Work on word problem interpretation

📚 Recommended Topics:
  • Advanced Factoring Methods
  • Completing the Square
  • Real-world Quadratic Applications

🎯 Suggested Next Difficulty: Level 5 (Advanced)
```

**Action Buttons:**

- Retake Quiz (new attempt)
- Generate Similar Quiz (uses 1 quota)
- View AI Quiz Leaderboard
- Share Results (social share)
- Download Report (PDF export)
- Return to Dashboard

---

## 🔐 Access Control & Quota System

### **Premium Gate Implementation**

**Middleware Check** (`/generate-random-quiz/layout.tsx`):

```typescript
async function checkPremiumAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountType: true },
  });

  const isPremium = ["PREMIUM", "PREMIUM_PLUS", "LIFETIME"].includes(
    user.accountType
  );

  return isPremium;
}
```

**Free User Redirect:**

```typescript
if (!isPremium) {
  redirect("/premium?feature=ai-quiz-generation");
}
```

### **Daily Quota Management**

**Quota Calculation:**

```typescript
const DAILY_LIMITS = {
  FREE: 0, // No access
  PREMIUM: 5, // 5 quizzes/day
  PREMIUM_PLUS: 15, // 15 quizzes/day
  LIFETIME: 999, // Unlimited (practical limit)
};

async function checkQuota(userId: string): Promise<{
  hasQuota: boolean;
  remaining: number;
  resetAt: Date;
}> {
  let quota = await prisma.aiQuizGenerationQuota.findUnique({
    where: { userId },
    include: { user: { select: { accountType: true } } },
  });

  // Create if doesn't exist
  if (!quota) {
    quota = await prisma.aiQuizGenerationQuota.create({
      data: {
        userId,
        dailyLimit: DAILY_LIMITS.PREMIUM,
        dailyUsed: 0,
        lastResetDate: new Date(),
      },
    });
  }

  // Check if needs reset (new day)
  const now = new Date();
  const lastReset = new Date(quota.lastResetDate);
  const isNewDay = now.toDateString() !== lastReset.toDateString();

  if (isNewDay) {
    quota = await prisma.aiQuizGenerationQuota.update({
      where: { userId },
      data: {
        dailyUsed: 0,
        lastResetDate: now,
      },
    });
  }

  // Update daily limit based on current account type
  const currentLimit = DAILY_LIMITS[quota.user.accountType] || 0;
  if (quota.dailyLimit !== currentLimit) {
    await prisma.aiQuizGenerationQuota.update({
      where: { userId },
      data: { dailyLimit: currentLimit },
    });
  }

  const remaining = currentLimit - quota.dailyUsed;
  const hasQuota = remaining > 0;

  // Reset time is midnight UTC of next day
  const resetAt = new Date(now);
  resetAt.setUTCHours(24, 0, 0, 0);

  return { hasQuota, remaining, resetAt };
}
```

**Quota Display Component:**

```tsx
function QuotaDisplay({ remaining, total, resetAt }) {
  const percentage = (remaining / total) * 100;

  return (
    <div className="quota-display">
      <div className="quota-bar">
        <div className="quota-fill" style={{ width: `${percentage}%` }} />
      </div>
      <p>
        {remaining}/{total} AI quizzes remaining today
      </p>
      <p className="text-sm text-gray-500">
        Resets in {formatDistanceToNow(resetAt)}
      </p>
    </div>
  );
}
```

---

## 🤖 AI Provider Integration

### **Provider Factory Pattern**

**Base Provider Interface:**

```typescript
interface AIQuizProvider {
  name: string;
  type: AIProviderType;

  // Generate quiz questions
  generateQuestions(config: QuizConfig): Promise<GeneratedQuiz>;

  // Stream generation (optional)
  streamGeneration?(config: QuizConfig): AsyncGenerator<GenerationProgress>;

  // Validate API key
  validateApiKey(): Promise<boolean>;

  // Get provider capabilities
  getCapabilities(): ProviderCapabilities;

  // Estimate cost
  estimateCost(questionCount: number): number;
}
```

### **Individual Provider Implementations**

**1. OpenAI (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)**

- SDK: `openai` npm package
- Models: gpt-4o, gpt-4o-mini, gpt-3.5-turbo
- Best for: All subjects, high accuracy
- Streaming: Yes
- Cost: Medium

**2. Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)**

- SDK: `@anthropic-ai/sdk`
- Models: claude-3-5-sonnet-20241022, claude-3-opus-20240229
- Best for: Complex reasoning, detailed explanations
- Streaming: Yes
- Cost: Medium-High

**3. Google Gemini (Gemini 1.5 Pro, Flash)**

- SDK: `@google/generative-ai`
- Models: gemini-1.5-pro, gemini-1.5-flash
- Best for: Fast generation, multi-modal (future)
- Streaming: Yes
- Cost: Low-Medium

**4. Cohere (Command R+, Command R)**

- SDK: `cohere-ai`
- Models: command-r-plus, command-r
- Best for: Structured outputs, RAG
- Streaming: Yes
- Cost: Medium

**5. Mistral AI (Mistral Large, Medium)**

- SDK: `@mistralai/mistralai`
- Models: mistral-large-latest, mistral-medium-latest
- Best for: Multilingual, European languages
- Streaming: Yes
- Cost: Low

**6. Meta Llama (via Groq)**

- SDK: `groq-sdk`
- Models: llama-3.1-70b-versatile, llama-3.1-8b-instant
- Best for: Fast inference, open models
- Streaming: Yes
- Cost: Very Low

**7. Perplexity AI**

- SDK: Custom API client
- Models: pplx-7b-online, pplx-70b-online
- Best for: Current events, web-connected
- Streaming: Yes
- Cost: Medium

**8. AI21 Labs (Jurassic-2)**

- SDK: `ai21`
- Models: j2-ultra, j2-mid
- Best for: Specific domains, customization
- Streaming: No
- Cost: Medium

**9. HuggingFace (Open Models)**

- SDK: `@huggingface/inference`
- Models: Various open-source models
- Best for: Free tier, experimentation
- Streaming: Limited
- Cost: Free-Low

---

## 🧮 XP Calculation System

### **Comprehensive XP Formula**

```typescript
interface XPCalculationParams {
  // Quiz Configuration
  difficultyLevel: number; // 1-10
  questionCount: number;

  // Performance
  correctCount: number;
  wrongCount: number;
  skippedCount: number;

  // Timing
  timeSpent: number; // seconds
  timeLimitSeconds?: number;

  // Streaks & Bonuses
  longestStreak: number;
  perfectScore: boolean;

  // Quiz Settings
  bonusMultiplier: number; // From quiz config
}

function calculateAIQuizXP(params: XPCalculationParams): XPBreakdown {
  // Base XP per difficulty level
  const BASE_XP_TABLE = [
    50, // Level 1: Novice
    75, // Level 2: Beginner
    100, // Level 3: Elementary
    150, // Level 4: Intermediate
    200, // Level 5: Advanced
    300, // Level 6: Expert
    450, // Level 7: Master
    650, // Level 8: Virtuoso
    900, // Level 9: Legendary
    1200, // Level 10: God Level
  ];

  const baseXPPerQuestion = BASE_XP_TABLE[params.difficultyLevel - 1];
  const baseXP = baseXPPerQuestion * (params.questionCount / 10);

  // 1. Accuracy Bonus (0-100% of base)
  const accuracy = params.correctCount / params.questionCount;
  const accuracyBonus = Math.round(baseXP * accuracy);

  // 2. Speed Bonus (up to 30% of base)
  let speedBonus = 0;
  if (params.timeLimitSeconds) {
    const timeRatio = params.timeSpent / params.timeLimitSeconds;
    // Bonus if completed in less than 75% of time
    if (timeRatio < 0.75) {
      const speedFactor = 1 - timeRatio;
      speedBonus = Math.round(baseXP * 0.3 * speedFactor);
    }
  }

  // 3. Streak Bonus (5+ correct in a row)
  let streakBonus = 0;
  if (params.longestStreak >= 5) {
    const streakMultiplier = Math.min(params.longestStreak / 10, 0.5);
    streakBonus = Math.round(baseXP * streakMultiplier);
  }

  // 4. Perfect Score Bonus (25% of base)
  const perfectBonus = params.perfectScore ? Math.round(baseXP * 0.25) : 0;

  // 5. No Wrong Answer Bonus (if all answered are correct)
  const noWrongBonus =
    params.wrongCount === 0 && params.correctCount > 0
      ? Math.round(baseXP * 0.15)
      : 0;

  // 6. Quick Answer Bonus (average < 30s per question)
  const avgTimePerQ = params.timeSpent / params.questionCount;
  const quickBonus = avgTimePerQ < 30 ? Math.round(baseXP * 0.1) : 0;

  // Calculate total before multiplier
  const subtotal = Math.round(
    baseXP +
      accuracyBonus +
      speedBonus +
      streakBonus +
      perfectBonus +
      noWrongBonus +
      quickBonus
  );

  // Apply bonus multiplier from quiz config
  const totalXP = Math.round(subtotal * params.bonusMultiplier);

  return {
    baseXP,
    accuracyBonus,
    speedBonus,
    streakBonus,
    perfectBonus,
    noWrongBonus,
    quickBonus,
    subtotal,
    bonusMultiplier: params.bonusMultiplier,
    totalXP,
    breakdown: {
      accuracy: accuracy * 100,
      avgTimePerQuestion: avgTimePerQ,
      longestStreak: params.longestStreak,
    },
  };
}

interface XPBreakdown {
  baseXP: number;
  accuracyBonus: number;
  speedBonus: number;
  streakBonus: number;
  perfectBonus: number;
  noWrongBonus: number;
  quickBonus: number;
  subtotal: number;
  bonusMultiplier: number;
  totalXP: number;
  breakdown: {
    accuracy: number;
    avgTimePerQuestion: number;
    longestStreak: number;
  };
}
```

### **XP Application to User**

```typescript
async function applyXPToUser(userId: string, xpEarned: number) {
  // Update user's total XP
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpEarned },
    },
    include: { rank: true },
  });

  // Check for rank progression
  const newRank = getRankByXP(updatedUser.xp);

  if (newRank.current.tier !== updatedUser.rank?.tier) {
    // User ranked up!
    await prisma.rankHistory.create({
      data: {
        userId,
        oldRank: updatedUser.rank?.tier,
        newRank: newRank.current.tier,
        xpAtChange: updatedUser.xp,
      },
    });

    // Award rank up bonus
    await awardRankUpBonus(userId, newRank.current.tier);
  }

  return {
    updatedUser,
    newRank,
    rankedUp: newRank.current.tier !== updatedUser.rank?.tier,
  };
}
```

---

## 🎯 Achievement System

### **AI Quiz Specific Achievements**

```typescript
const AI_QUIZ_ACHIEVEMENTS = {
  // Generation Achievements
  FIRST_AI_QUIZ: {
    key: "first_ai_quiz",
    name: "AI Pioneer",
    description: "Generate your first AI quiz",
    icon: "🤖",
    xpReward: 50,
  },

  TEN_AI_QUIZZES: {
    key: "ten_ai_quizzes",
    name: "AI Enthusiast",
    description: "Generate 10 AI quizzes",
    icon: "⚡",
    xpReward: 200,
  },

  HUNDRED_AI_QUIZZES: {
    key: "hundred_ai_quizzes",
    name: "AI Master",
    description: "Generate 100 AI quizzes",
    icon: "🏆",
    xpReward: 1000,
  },

  // Performance Achievements
  PERFECT_SCORE_AI: {
    key: "perfect_score_ai",
    name: "Perfectionist",
    description: "Score 100% on an AI-generated quiz",
    icon: "🎯",
    xpReward: 100,
  },

  GOD_LEVEL_COMPLETE: {
    key: "god_level_complete",
    name: "Deity",
    description: "Complete a God Level (10) AI quiz with 80%+",
    icon: "👑",
    xpReward: 500,
  },

  SPEED_DEMON: {
    key: "speed_demon",
    name: "Speed Demon",
    description: "Complete a quiz in under 50% of time limit",
    icon: "⚡",
    xpReward: 150,
  },

  TEN_STREAK: {
    key: "ten_streak",
    name: "Streak Master",
    description: "Get 10 correct answers in a row",
    icon: "🔥",
    xpReward: 200,
  },

  // Consistency Achievements
  DAILY_AI_QUIZ_7: {
    key: "daily_ai_quiz_7",
    name: "Dedicated Learner",
    description: "Complete an AI quiz every day for 7 days",
    icon: "📅",
    xpReward: 300,
  },

  DAILY_AI_QUIZ_30: {
    key: "daily_ai_quiz_30",
    name: "Unstoppable",
    description: "Complete an AI quiz every day for 30 days",
    icon: "💪",
    xpReward: 1500,
  },

  // Diversity Achievements
  ALL_PROVIDERS: {
    key: "all_providers",
    name: "AI Explorer",
    description: "Generate quizzes with all AI providers",
    icon: "🌐",
    xpReward: 500,
  },

  ALL_DIFFICULTIES: {
    key: "all_difficulties",
    name: "Challenge Seeker",
    description: "Complete quizzes at all difficulty levels",
    icon: "🎚️",
    xpReward: 750,
  },

  MULTI_SUBJECT: {
    key: "multi_subject",
    name: "Renaissance Mind",
    description: "Complete AI quizzes in 10 different subjects",
    icon: "🧠",
    xpReward: 600,
  },
};
```

---

## 📊 Analytics & Tracking

### **Events to Track**

```typescript
// Generation Events
trackEvent("ai_quiz_generated", {
  userId,
  providerId,
  subject,
  difficultyLevel,
  questionCount,
  generationTime,
  tokensUsed,
});

// Attempt Events
trackEvent("ai_quiz_started", { userId, quizId });
trackEvent("ai_quiz_completed", { userId, quizId, score, xpEarned });
trackEvent("ai_quiz_abandoned", { userId, quizId, questionsAnswered });

// Interaction Events
trackEvent("ai_provider_selected", { userId, providerId });
trackEvent("difficulty_changed", { userId, oldLevel, newLevel });
trackEvent("template_used", { userId, templateId });

// Performance Events
trackEvent("perfect_score", { userId, quizId, difficultyLevel });
trackEvent("achievement_unlocked", { userId, achievementKey });
```

### **Metrics Dashboard**

Track key metrics for admin dashboard:

- Total AI quizzes generated
- Most popular AI providers
- Average generation time
- Success/failure rates
- Most popular subjects
- Average difficulty level
- XP distribution
- Daily active users
- Quota utilization
- Revenue impact (premium upgrades)

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**

- [ ] Database schema creation and migration
- [ ] AI provider integrations (OpenAI, Anthropic, Gemini)
- [ ] Basic prompt engineering
- [ ] Premium access gate
- [ ] Quota management system
- [ ] Basic XP calculation

### **Phase 2: Core Features (Week 3-4)**

- [ ] Landing page with provider selection
- [ ] Configuration wizard (all 6 steps)
- [ ] Generation progress UI with SSE
- [ ] Quiz preview page
- [ ] Basic playing interface
- [ ] Results page with review

### **Phase 3: Polish & Features (Week 5-6)**

- [ ] Template system
- [ ] Advanced playing features (keyboard shortcuts, auto-save)
- [ ] Enhanced results with AI insights
- [ ] Achievement system
- [ ] Leaderboard integration
- [ ] Mobile optimization

### **Phase 4: Additional Providers (Week 7)**

- [ ] Cohere integration
- [ ] Mistral AI integration
- [ ] Llama via Groq
- [ ] Perplexity AI
- [ ] AI21 Labs
- [ ] HuggingFace

### **Phase 5: Testing & Launch (Week 8)**

- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Beta testing with selected users
- [ ] Full launch

---

## 🔒 Security Considerations

1. **API Key Management**:

   - Store all API keys in environment variables
   - Encrypt sensitive data in database
   - Rotate keys regularly
   - Monitor usage for anomalies

2. **Rate Limiting**:

   - Daily quota per user
   - API rate limits per provider
   - Concurrent generation limits
   - Cooldown periods

3. **Content Validation**:

   - Validate AI responses
   - Filter inappropriate content
   - Profanity checks
   - Plagiarism detection (future)

4. **Data Privacy**:

   - Don't send user PII to AI providers
   - Anonymize data in analytics
   - GDPR compliance
   - User data export/deletion

5. **Cost Control**:
   - Set maximum tokens per request
   - Monitor spending per provider
   - Implement circuit breakers
   - Fallback to cheaper providers

---

## 💰 Cost Estimation & Optimization

### **Provider Cost Comparison** (Approximate)

| Provider  | Model             | Cost per 1M tokens | Est. Cost per Quiz (10Q) |
| --------- | ----------------- | ------------------ | ------------------------ |
| OpenAI    | GPT-4o            | $5.00              | $0.025                   |
| OpenAI    | GPT-4o-mini       | $0.15              | $0.001                   |
| Anthropic | Claude 3.5 Sonnet | $3.00              | $0.015                   |
| Google    | Gemini 1.5 Flash  | $0.075             | $0.0004                  |
| Mistral   | Mistral Large     | $2.00              | $0.010                   |
| Groq      | Llama 3.1 70B     | $0.59              | $0.003                   |

### **Optimization Strategies**

1. **Smart Provider Selection**:

   - Route simple quizzes to cheaper models
   - Use premium models for complex subjects
   - A/B test quality vs cost

2. **Caching**:

   - Cache similar quiz requests
   - Store common question patterns
   - Reuse templates

3. **Batch Processing**:

   - Generate multiple questions in one call
   - Combine similar requests

4. **Token Optimization**:
   - Compress prompts
   - Remove unnecessary instructions
   - Optimize JSON parsing

---

## 🎯 Success Metrics & KPIs

### **User Engagement**

- Quiz completion rate > 75%
- Average quizzes per user per week > 3
- Return rate (7-day) > 60%
- Time spent per session > 15 minutes

### **Quality Metrics**

- Question validity rate > 95%
- User satisfaction rating > 4.5/5
- Error rate < 2%
- Average generation time < 30 seconds

### **Business Metrics**

- Premium conversion from feature > 10%
- Daily quota utilization > 70%
- Feature retention (30-day) > 50%
- Revenue per user increase > 20%

---

## 📝 Next Steps

1. **Validate this plan** with stakeholder review
2. **Set up development environment** with all AI provider accounts
3. **Create database migration** files
4. **Start with Phase 1** implementation
5. **Set up monitoring** and analytics from day 1

---

## ❓ Open Questions

1. Should we support multiple languages for quiz generation?
2. Do we want to allow users to share their generated quizzes publicly?
3. Should there be a marketplace for quiz templates?
4. Do we want to implement collaborative quiz building?
5. Should lifetime users have truly unlimited generations or a high cap?
6. Do we want to show AI provider costs to users?

---

## 🎉 Expected Impact

- **User Engagement**: +40% increase in daily active users
- **Premium Upgrades**: +25% conversion rate
- **Retention**: +35% 30-day retention
- **XP Distribution**: AI quizzes contribute 30% of total XP earned
- **User Satisfaction**: 4.8/5 rating on new feature
- **Content Creation**: 10,000+ AI quizzes generated in first month

---

**Status**: Ready for approval and implementation 🚀  
**Estimated Launch**: 8 weeks from approval  
**Required Resources**: 1 full-stack developer, AI API credits  
**Budget**: ~$500/month for AI API costs (scales with usage)
