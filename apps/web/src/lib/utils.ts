/**
 * Standardizes currency formatting for the application.
 * Defaults to Indian Rupee (INR) for consistency with the backend pricing logic.
 * 
 * @param amount - The numeric value to format
 * @returns A formatted currency string (e.g., "₹1,299.00")
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '₹0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Standardizes date formatting across the platform.
 * 
 * @param date - Date string, number, or Date object
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns A localized date string
 */
export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-IN', options).format(d);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Utility for conditionally joining CSS class names.
 * Especially useful for managing dynamic styles in a vanilla CSS environment.
 * 
 * @param classes - Array of strings or conditional expressions
 * @returns A space-separated string of valid classes
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
