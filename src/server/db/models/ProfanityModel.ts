import mongoose from "mongoose";

export interface Profanity {
  _id: string;
  name: string;
}

const ProfanitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.models.Profanity || mongoose.model("Profanity", ProfanitySchema); 