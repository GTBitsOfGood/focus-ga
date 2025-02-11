import { z } from "zod";
import { ExtendId } from "./common";

export const visibilitySchema = z.object({
  name: z.boolean()
});

export const editVisiblitySchema = visibilitySchema.partial();

export type Visiblity = ExtendId<z.infer<typeof visibilitySchema>>;
export type VisiblityInput = z.input<typeof visibilitySchema>;
