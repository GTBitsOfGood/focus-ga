import { z } from "zod";
import { ExtendId } from "./common";
import { GEORGIA_CITIES } from "../cities";

export const locationSchema = z.object({
  name: z.enum(GEORGIA_CITIES),
});

export const editLocationSchema = locationSchema.partial();

export type Location = ExtendId<z.infer<typeof locationSchema>>;
export type LocationInput = z.input<typeof locationSchema>;