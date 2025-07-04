// XP calculation for multiplayer arena

export interface ArenaAnswer {
  questionId: string;
  type: string;
  isCorrect: boolean;
  timeTaken: number;
  answer: any;
}

export interface ArenaSessionMeta {
  duration: number;
  streak?: number;
  isFirstWinToday?: boolean;
  noMistakes?: boolean;
  repeatedQuiz?: boolean;
  skipped?: boolean;
  answerSpamming?: boolean;
  idleDetected?: boolean;
}

const BASE_XP: Record<string, (a: ArenaAnswer) => number> = {
  'mcq-single': () => 5,
  'mcq-multiple': (a) => a.isCorrect ? 10 : 0, // partial XP logic can be added
  'true-false': () => 3,
  'match': (a) => a.isCorrect ? 12 : 0,
  'matrix': (a) => a.isCorrect ? 15 : 0,
  'poll': () => 0,
  'fill-blanks': () => 8,
  'drag-drop': (a) => a.isCorrect ? 10 : 0,
  'image-based': (a) => a.isCorrect ? 12 : 0,
  'ordering': (a) => a.isCorrect ? 10 : 0,
};

export function calculateArenaXP(
  answers: ArenaAnswer[],
  meta: ArenaSessionMeta
): number {
  // 1. Base XP
  let baseXP = 0;
  let allCorrect = true;
  let fastSolve = true;
  let streak = meta.streak || 0;
  let repeatedQuiz = !!meta.repeatedQuiz;
  let skipped = !!meta.skipped;
  let answerSpamming = !!meta.answerSpamming;
  let idleDetected = !!meta.idleDetected;
  let isFirstWinToday = !!meta.isFirstWinToday;
  let noMistakes = answers.every(a => a.isCorrect);

  for (const ans of answers) {
    if (!ans.isCorrect) allCorrect = false;
    if (ans.timeTaken > 30) fastSolve = false;
    const getXP = BASE_XP[ans.type] || (() => 0);
    baseXP += getXP(ans);
  }

  // 2. Modifiers
  let bonus = 0;
  if (noMistakes) bonus += 10;
  if (allCorrect) bonus += 0.25 * baseXP;
  if (fastSolve) bonus += 0.15 * baseXP;
  if (isFirstWinToday) bonus += 50;
  if (streak > 2) bonus += Math.min(streak * 3, 15);

  // 3. Penalties
  let penalty = 0;
  if (repeatedQuiz) penalty += 0.5 * baseXP;
  if (skipped) penalty += 25;
  if (answerSpamming) return 0;
  if (idleDetected) return 0;

  // 4. Final XP
  let xp = Math.round(baseXP + bonus - penalty);
  if (xp < 0) xp = 0;
  return xp;
} 