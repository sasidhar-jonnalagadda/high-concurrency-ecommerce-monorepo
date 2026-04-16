/**
 * Standardizes a string into a URL-friendly slug.
 * Example: "Airpods Pro 2nd Gen" -> "airpods-pro-2nd-gen"
 * 
 * @param name - The input string to slugify
 * @returns A normalized slug string
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
