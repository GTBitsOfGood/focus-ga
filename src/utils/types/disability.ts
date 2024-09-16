import { z } from "zod";
import { ExtendId } from "./common";

export const disabilitySchema = z.object({
  name: z.string()
});

export const editDisabilitySchema = disabilitySchema.partial();

export type Disability = ExtendId<z.infer<typeof disabilitySchema>>;
export type DisabilityInput = z.input<typeof disabilitySchema>;
