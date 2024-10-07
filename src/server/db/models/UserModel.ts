import { User } from "@/utils/types/user";
import mongoose, { Schema } from "mongoose";

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const UserSchema = new Schema<User>({
  username: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  lastName: { type: String, required: true },
  email: { type: String, required: true, validate: {
    validator: (s: string) => emailRegex.test(s) 
  }},
  childAge: { type: Number, min: 0, required: true },
  childDisabilities: [{ type: Schema.Types.ObjectId, ref: 'Disability', required: true }],
  city: { type: String, required: true },
  bio: { type: String },
});

const UserModel = mongoose.models?.User ?? mongoose.model('User', UserSchema);

export default UserModel;
