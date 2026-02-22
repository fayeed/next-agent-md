/**
 * Estimates the number of LLM tokens in a piece of text.
 *
 * Uses the standard approximation of 1 token ≈ 4 characters for English text.
 * This avoids WASM-based tokenizers (like tiktoken) that are incompatible with
 * the Next.js Edge Runtime.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
