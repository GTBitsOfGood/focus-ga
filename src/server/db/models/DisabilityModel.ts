import { disabilitySchema } from "@/utils/types";
import mongoose, { Schema } from "mongoose";
import { z } from "zod";

export type Disability = z.infer<typeof disabilitySchema>;

const DisabilitySchema = new Schema<Disability>({
  name: { type: String, required: true }
});

const DisabilityModel = mongoose.models?.Disability ?? mongoose.model('Disability', DisabilitySchema);

export default DisabilityModel;