import Filter from "bad-words";
import { logger } from "../config/logger";

/**
 * Profanity Filter Service
 *
 * Uses the 'bad-words' package to filter inappropriate content from chat messages.
 * Includes additional custom words and support for multiple languages.
 */

// Initialize the filter with default English word list
const filter = new Filter();

// Add custom words that might not be in the default list
const customProfanityWords = [
  // Add any custom words specific to your platform
  "scam",
  "cheater",
  "hacker",
  // Leet speak variations
  "f4ck",
  "sh1t",
  "b1tch",
  // Common evasions
  "fvck",
  "fcuk",
  "phuck",
];

// Add Hindi/Indian language profanity (common in Indian gaming)
const hindiProfanityWords = [
  "bc",
  "mc",
  "bhenchod",
  "madarchod",
  "chutiya",
  "gaandu",
  "randi",
  "harami",
  "bhosdike",
  "lodu",
  "lauda",
  "lavde",
  "chodu",
];

// Add all custom words to the filter
filter.addWords(...customProfanityWords, ...hindiProfanityWords);

// Placeholder character for censored words
const PLACEHOLDER = "*";

/**
 * Check if a message contains profanity
 * @param message - The message to check
 * @returns true if profanity is detected
 */
export function containsProfanity(message: string): boolean {
  try {
    return filter.isProfane(message);
  } catch (error) {
    logger.error("Error checking profanity", { error, message });
    return false; // Fail open to not block legitimate messages
  }
}

/**
 * Clean a message by replacing profane words with asterisks
 * @param message - The message to clean
 * @returns The cleaned message
 */
export function cleanMessage(message: string): string {
  try {
    return filter.clean(message);
  } catch (error) {
    logger.error("Error cleaning message", { error, message });
    return message; // Return original if cleaning fails
  }
}

/**
 * Get a list of profane words found in a message
 * @param message - The message to analyze
 * @returns Array of profane words found
 */
export function getProfaneWords(message: string): string[] {
  try {
    const words = message.toLowerCase().split(/\s+/);
    return words.filter((word) => filter.isProfane(word));
  } catch (error) {
    logger.error("Error getting profane words", { error, message });
    return [];
  }
}

/**
 * Add words to the filter dynamically (for admin use)
 * @param words - Words to add to the filter
 */
export function addProfanityWords(...words: string[]): void {
  try {
    filter.addWords(...words);
    logger.info("Added words to profanity filter", { count: words.length });
  } catch (error) {
    logger.error("Error adding profanity words", { error });
  }
}

/**
 * Remove words from the filter (for admin use)
 * @param words - Words to remove from the filter
 */
export function removeProfanityWords(...words: string[]): void {
  try {
    filter.removeWords(...words);
    logger.info("Removed words from profanity filter", { count: words.length });
  } catch (error) {
    logger.error("Error removing profanity words", { error });
  }
}

/**
 * Check and clean message in one operation
 * Returns the cleaned message if profanity was detected, or original message if clean
 * @param message - The message to process
 * @returns Object containing cleaned message and whether profanity was detected
 */
export function processMessage(message: string): {
  message: string;
  wasProfane: boolean;
  profaneWords: string[];
} {
  const isProfane = containsProfanity(message);
  const profaneWords = isProfane ? getProfaneWords(message) : [];

  return {
    message: isProfane ? cleanMessage(message) : message,
    wasProfane: isProfane,
    profaneWords,
  };
}

// Export the filter instance for advanced usage
export { filter as profanityFilterInstance };
