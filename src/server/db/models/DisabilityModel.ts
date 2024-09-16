import { Disability } from "@/utils/types";
import mongoose, { Schema } from "mongoose";

const DisabilitySchema = new Schema<Disability>({
  name: { type: String, required: true }
});

const DisabilityModel = mongoose.models?.Disability ?? mongoose.model('Disability', DisabilitySchema);

export default DisabilityModel;