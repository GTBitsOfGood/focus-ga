import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Counts the number of non-markdown characters in a given string, i.e. all characters excluding:
 * - Formatting symbols for bold, italic, underline, and strikethrough
 * - List symbols
 * - URLs
 * - Escaped characters
 * - Whitespace characters
 * @param content The string to process
 * @returns The number of non-markdown characters
 */
export function countNonMarkdownCharacters(content: string): number {
  // Remove markdown-related characters such as formatting symbols for bold/italic/underline and lists
  const cleanedContent = content.replace(/(\*\*|__|\*|_|~~|`|\[.*?\]\(.*?\)|<.*?>|#|>|-|\+|\d+\.)/g, '')
              .replace(/\s+/g, '');
  return cleanedContent.length;
}
