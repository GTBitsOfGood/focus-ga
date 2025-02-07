import { z } from "zod";

export const ProfanitySchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Profanity word is required"),
});

export type Profanity = z.infer<typeof ProfanitySchema>;

export const CreateProfanitySchema = ProfanitySchema.omit({ _id: true });
export type ProfanityInput = z.infer<typeof CreateProfanitySchema>; 