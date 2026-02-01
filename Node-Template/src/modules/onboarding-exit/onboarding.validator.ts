import { z } from 'zod';

/**
 * ================= EMPLOYMENT PROFILE VALIDATION =================
 */

// Main Employment Profile Schema
export const createEmploymentProfileSchema = z.object({
  body: z.object({
    user_id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),

    organization_id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid organization ID format"),

    // Employment Profile
    employee_code: z
      .string()
      .min(1, "Employee code is required")
      .max(50, "Employee code cannot exceed 50 characters")
      .trim(),

    joining_date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), "Invalid joining date"),

    employment_type: z
      .enum(["PERMANENT", "CONTRACT", "INTERN"])
      .default("PERMANENT"),

    work_mode: z
      .enum(["WFH", "WFO", "HYBRID"])
      .default("WFO"),

    status: z
      .enum(["ACTIVE", "ON_NOTICE", "RESIGNED", "TERMINATED"])
      .default("ACTIVE"),

    // Personal Details
    personal_email: z
      .string()
      .email("Invalid email format")
      .max(254, "Email cannot exceed 254 characters")
      .toLowerCase()
      .trim()
      .optional()
      .or(z.literal("")),

    date_of_birth: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), "Invalid date of birth"),

    gender: z
      .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),

    // Job Assignment
    manager_id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid manager ID format")
      .optional()
      .or(z.literal("")),

    grade: z
      .string()
      .max(100, "Grade cannot exceed 100 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    cost_center: z
      .string()
      .max(100, "Cost center cannot exceed 100 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    // Payroll & Bank Details
    annual_ctc: z
      .number()
      .min(0, "Annual CTC cannot be negative")
      .or(
        z
          .string()
          .transform((val) => parseFloat(val))
          .pipe(z.number().min(0, "Annual CTC cannot be negative"))
      ),

    bank_name: z
      .string()
      .max(100, "Bank name cannot exceed 100 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    account_number: z
      .string()
      .max(20, "Account number cannot exceed 20 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    ifsc_code: z
      .string()
      .max(11, "IFSC code cannot exceed 11 characters")
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
      .trim()
      .toUpperCase()
      .optional()
      .or(z.literal("")),

    // Compliance
    pan_number: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
      .trim()
      .toUpperCase()
      .optional()
      .or(z.literal("")),

    aadhaar_number: z
      .string()
      .regex(/^[0-9]{12}$/, "Aadhaar must be 12 digits")
      .trim()
      .optional()
      .or(z.literal("")),

    uan_number: z
      .string()
      .regex(/^[0-9]{12}$/, "UAN must be 12 digits")
      .trim()
      .optional()
      .or(z.literal(""))
  })
});

// Update Employment Profile Schema (all fields optional)
export const updateEmploymentProfileSchema = z.object({
  body: z.object({
    employment_type: z
      .enum(["PERMANENT", "CONTRACT", "INTERN"])
      .optional(),

    work_mode: z
      .enum(["WFH", "WFO", "HYBRID"])
      .optional(),

    status: z
      .enum(["ACTIVE", "ON_NOTICE", "RESIGNED", "TERMINATED"])
      .optional(),

    personal_email: z
      .string()
      .email("Invalid email format")
      .toLowerCase()
      .trim()
      .optional(),

    date_of_birth: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), "Invalid date of birth")
      .optional(),

    gender: z
      .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
      .optional(),

    manager_id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid manager ID format")
      .optional(),

    grade: z
      .string()
      .max(100, "Grade cannot exceed 100 characters")
      .trim()
      .optional(),

    cost_center: z
      .string()
      .max(100, "Cost center cannot exceed 100 characters")
      .trim()
      .optional(),

    annual_ctc: z
      .number()
      .min(0, "Annual CTC cannot be negative")
      .or(
        z
          .string()
          .transform((val) => parseFloat(val))
          .pipe(z.number().min(0, "Annual CTC cannot be negative"))
      )
      .optional(),

    bank_name: z
      .string()
      .max(100, "Bank name cannot exceed 100 characters")
      .trim()
      .optional(),

    account_number: z
      .string()
      .max(20, "Account number cannot exceed 20 characters")
      .trim()
      .optional(),

    ifsc_code: z
      .string()
      .max(11, "IFSC code cannot exceed 11 characters")
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
      .trim()
      .toUpperCase()
      .optional(),

    pan_number: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
      .trim()
      .toUpperCase()
      .optional(),

    aadhaar_number: z
      .string()
      .regex(/^[0-9]{12}$/, "Aadhaar must be 12 digits")
      .trim()
      .optional(),

    uan_number: z
      .string()
      .regex(/^[0-9]{12}$/, "UAN must be 12 digits")
      .trim()
      .optional()
  })
});

// Get by ID Schema
export const getEmploymentProfileByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid employment profile ID")
  })
});

// Delete Schema
export const deleteEmploymentProfileSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid employment profile ID")
  })
});

// List/Fetch Schema with pagination and filters
export const listEmploymentProfilesSchema = z.object({
  body: z.object({
    organization_id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid organization ID format"),

    page: z
      .number()
      .min(1, "Page must be at least 1")
      .default(1)
      .optional(),

    limit: z
      .number()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10)
      .optional(),

    status: z
      .enum(["ACTIVE", "ON_NOTICE", "RESIGNED", "TERMINATED"])
      .optional(),

    employment_type: z
      .enum(["PERMANENT", "CONTRACT", "INTERN"])
      .optional(),

    search: z
      .string()
      .max(100, "Search string cannot exceed 100 characters")
      .trim()
      .optional()
  })
});
