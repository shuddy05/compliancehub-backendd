/**
 * Convert string to URL-friendly slug
 * e.g., "Understanding PAYE Tax" -> "understanding-paye-tax"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 255); // Limit to 255 characters (database column length)
}
