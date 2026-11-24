/**
 * textFormat.js — Section F
 * Shared text formatting utilities for admission fields.
 * Applied: (1) in React onChange handlers, (2) in Mongoose pre-save middleware.
 */

/** Fields that must NOT be uppercased (exclusion list) */
const EXCLUDED_FIELDS = new Set([
  'emailAddress', 'email', 'address', 'otherInfo',
  'url', 'password', 'referralCode', 'apaarId', 'aadharNo',
  'contactNumber', 'alternateContactNumber', 'guardianContactNumber',
  'dob', 'month', 'pinCode', 'yearOfPassing',
  'feePercentage', 'discountPercent', 'discountAmount',
  // Dropdown stored values
  'gender', 'religion', 'category', 'maritalStatus', 'exServiceman',
  'isHandicapped', 'preferredModeOfLearning', 'status', 'lifecycleStatus',
  'guardianCategory', 'fathersOccupation'
]);

/**
 * Returns true if the field name should be excluded from uppercasing.
 * @param {string} fieldName
 */
export const isExcluded = (fieldName) => EXCLUDED_FIELDS.has(fieldName);

/**
 * Convert to UPPERCASE — for most text fields (names, cities, etc.)
 * @param {string} val
 */
export const toUpper = (val) =>
  typeof val === 'string' ? val.toUpperCase() : val;

/**
 * Convert to Title Case — for address textarea.
 * @param {string} val
 */
export const toTitleCase = (val) => {
  if (typeof val !== 'string') return val;
  return val.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

/**
 * Lowercase — for email fields.
 * @param {string} val
 */
export const toLower = (val) =>
  typeof val === 'string' ? val.toLowerCase() : val;

/**
 * Apply correct formatting for a named field.
 * @param {string} fieldName
 * @param {*} value
 */
export const formatField = (fieldName, value) => {
  if (typeof value !== 'string') return value;
  if (['emailAddress', 'email'].includes(fieldName)) return toLower(value);
  if (['address'].includes(fieldName)) return toTitleCase(value);
  if (isExcluded(fieldName)) return value;
  return toUpper(value);
};

