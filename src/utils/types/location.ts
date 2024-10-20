import { z } from "zod";
import { ExtendId } from "./common";

export const locationSchema = z.object({
  name: z.string()
});

export const editLocationSchema = locationSchema.partial();

export type Location = ExtendId<z.infer<typeof locationSchema>>;
export type LocationInput = z.input<typeof locationSchema>;