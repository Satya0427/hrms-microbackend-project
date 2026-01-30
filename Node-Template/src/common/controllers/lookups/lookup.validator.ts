import { z } from 'zod';

/**
 * LOOKUP VALIDATION SCHEMAS (Zod)
 */

// Organizations Dropdown Schema (No pagination)
export const organizationsDropdownSchema = z.object({
    search_key: z.string().optional()
});

/**
 * TypeScript Types Exported from Zod Schemas
 */
export type OrganizationsDropdownInput = z.infer<typeof organizationsDropdownSchema>;
