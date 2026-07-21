import { z } from "zod";

// Helper preprocessor for URLs that auto-prepends https:// if missing, and allows empty string
const optionalUrlSchema = z.preprocess((val) => {
  if (typeof val !== "string" || !val.trim()) return undefined;
  if (!/^https?:\/\//i.test(val)) return `https://${val}`;
  return val;
}, z.string().trim().url("Invalid URL format").optional().or(z.literal("")));

export const registerCompanySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(3, "Company name must be at least 3 characters")
    .max(50, "Company name must not exceed 50 characters"),

  industry: z
    .string()
    .trim()
    .min(2, "Industry is required")
    .max(50, "Industry must not exceed 50 characters"),
});

export const updateCompanySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(3, "Company name must be at least 3 characters")
    .max(100, "Company name cannot exceed 100 characters")
    .optional(),
  industry: z
    .string()
    .trim()
    .min(2, "Industry must be at least 2 characters")
    .max(50, "Industry cannot exceed 50 characters")
    .optional(),
  companySize: z
    .string()
    .trim()
    .max(50, "Company size cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  website: optionalUrlSchema,
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format. Must contain 10-15 digits, optionally starting with '+'")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  foundedYear: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z
      .number()
      .int("Founded year must be an integer")
      .min(1800, "Founded year must be 1800 or later")
      .max(new Date().getFullYear() + 1, "Founded year cannot be in the future")
      .optional()
  ),
  headquarters: z
    .string()
    .trim()
    .max(100, "Headquarters location cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Address details cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  linkedin: optionalUrlSchema,
  twitter: optionalUrlSchema,
  facebook: optionalUrlSchema,
});

export type CreateCompanyInput = z.infer<typeof registerCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
