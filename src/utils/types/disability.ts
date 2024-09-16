import { z } from "zod";

export const disabilitySchema = z.object({
  name: z.string()
});

export const editDisabilitySchema = disabilitySchema.partial();

export type Disability = z.infer<typeof disabilitySchema>;
export type DisabilityInput = z.input<typeof disabilitySchema>;
