/**
 * Date utility functions shared across pages.
 */

/**
 * Formats a date value to a locale string.
 * @param {string | Date} value - The date value to format
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

/**
 * Converts a date value to local datetime input format (YYYY-MM-DDTHH:mm).
 * @param {string | Date} value - The date value to convert
 * @returns {string} String in format suitable for a datetime-local input
 */
export const toLocalDateTimeInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

/**
 * Gets the current date/time in local datetime input format.
 * @returns {string} Current time in format suitable for a datetime-local input
 */
export const getNowLocalInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

/**
 * Checks if a date value is in the future.
 * @param {string | Date} value - The date value to check
 * @returns {boolean} True if date is in the future, false otherwise
 */
export const isFutureDateValue = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
};
