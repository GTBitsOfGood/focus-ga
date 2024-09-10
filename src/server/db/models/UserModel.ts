import { userSchema } from "@/utils/types";
import mongoose, { Schema, Types } from "mongoose";
import { z } from "zod";

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export type User = z.infer<typeof userSchema>;

const UserSchema = new Schema<User>({
  username: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  lastName: { type: String, required: true },
  email: { type: String, required: true, validate: {
    validator: (s: string) => emailRegex.test(s) 
  }},
  childAge: { type: Number, min: 0, required: true },
  childDisabilities: [{ type: Schema.Types.ObjectId, ref: 'Disability', required: true }],
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  }
});

const UserModel = mongoose.models?.User ?? mongoose.model('User', UserSchema);

export default UserModel;