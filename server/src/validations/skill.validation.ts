import { z } from "zod";

export const createSkillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skill must be at least 2 characters")
    .max(50, "Skill cannot exceed 50 characters"),
});

export const updateSkillSchema = createSkillSchema.partial();

export const getSkillSchema = z.object({
  skillId: z.string().min(1, "Skill ID is required"),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
