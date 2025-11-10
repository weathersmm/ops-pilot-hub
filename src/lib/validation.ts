import { z } from "zod";

/**
 * Shared validation schemas and utilities for consistent input validation across the application.
 * 
 * Security best practices:
 * - Always validate on both client and server side
 * - Set reasonable length limits to prevent storage overflow
 * - Use proper type checking and format validation
 * - Sanitize inputs before processing
 */

// ============= Common Field Validations =============

/**
 * Vehicle Identification Number (VIN) validation
 * - Must be exactly 17 characters
 * - Only alphanumeric characters (excluding I, O, Q to avoid confusion)
 */
export const vinSchema = z
  .string()
  .trim()
  .length(17, "VIN must be exactly 17 characters")
  .regex(/^[A-HJ-NPR-Z0-9]+$/i, "VIN contains invalid characters (I, O, Q not allowed)");

/**
 * Year validation for vehicles
 * - Range: 1900 to 2100
 * - Must be a whole number
 */
export const yearSchema = z
  .number()
  .int("Year must be a whole number")
  .min(1900, "Year must be 1900 or later")
  .max(2100, "Year must be 2100 or earlier");

/**
 * Email validation with length limit
 */
export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

/**
 * Password validation with security requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid("Invalid ID format");

/**
 * Phone number validation (basic)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d\s\-()+]+$/, "Invalid phone number format")
  .min(10, "Phone number must be at least 10 digits")
  .max(20, "Phone number must be less than 20 characters");

// ============= Text Field Validations =============

/**
 * Short text field (e.g., names, IDs)
 */
export const shortTextField = (fieldName: string, maxLength = 50) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`);

/**
 * Medium text field (e.g., descriptions)
 */
export const mediumTextField = (fieldName: string, maxLength = 200) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`);

/**
 * Long text field (e.g., notes, comments)
 */
export const longTextField = (fieldName: string, maxLength = 1000) =>
  z
    .string()
    .trim()
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
    .optional();

// ============= Numeric Validations =============

/**
 * Positive integer validation
 */
export const positiveInteger = (fieldName: string, max?: number) => {
  let schema = z.number().int(`${fieldName} must be a whole number`).min(0, `${fieldName} must be positive`);
  if (max) {
    schema = schema.max(max, `${fieldName} must be less than ${max}`);
  }
  return schema;
};

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage must be at most 100");

// ============= Enum Validations =============

export const vehicleTypeEnum = z.enum(["ALS", "BLS", "CCT", "Supervisor", "Other"]);

export const vehicleStatusEnum = z.enum([
  "Draft",
  "Commissioning",
  "Ready",
  "Out-of-Service",
  "Decommissioned",
]);

export const taskStepCategoryEnum = z.enum([
  "Admin",
  "Safety",
  "Compliance",
  "Clinical",
  "Logistics",
  "IT",
  "Branding",
]);

export const taskStatusEnum = z.enum([
  "Not Started",
  "In Progress",
  "Blocked",
  "Completed",
  "Cancelled",
]);

export const inspectionResultEnum = z.enum(["Pending", "Pass", "Fail"]);

// ============= Complete Entity Schemas =============

/**
 * Vehicle form validation schema
 */
export const vehicleFormSchema = z.object({
  vehicle_id: shortTextField("Vehicle ID", 50),
  vin: vinSchema,
  plate: shortTextField("License plate", 20),
  make: shortTextField("Make", 100),
  model: shortTextField("Model", 100),
  year: yearSchema,
  type: vehicleTypeEnum,
  region_id: uuidSchema,
});

/**
 * User signup validation schema
 */
export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: shortTextField("Full name", 100),
});

/**
 * Login validation schema
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// ============= Utility Functions =============

/**
 * Sanitize CSV cell to prevent formula injection
 * Escapes cells that start with =, +, -, @
 */
export const sanitizeCsvCell = (value: string): string => {
  const trimmed = value.trim();
  if (
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@")
  ) {
    return "'" + trimmed;
  }
  return trimmed;
};

/**
 * Sanitize HTML to prevent XSS
 * Note: For complex HTML sanitization, use DOMPurify library
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};
