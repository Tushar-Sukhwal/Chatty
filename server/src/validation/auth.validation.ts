import { z } from "zod";

/**
 * Zod validation schema(s) for the Auth module.
 *
 * Exports `emailSchema` – a trimmed string constrained to a valid email of
 * length 1…255 characters.
 */

export const emailSchema = z.string().trim().email("Invalid email address").min(1).max(255);
