import { GEORGIA_CITIES } from "@/utils/cities";
import { PostDeletionTimeline, ProfileColors } from "@/utils/consts";
import { User } from "@/utils/types/user";
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema<User>({
  username: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  lastName: { type: String, required: true },
  email: { type: String, required: true},
  childAge: { type: Number, min: 0, required: true },
  childDisabilities: [{ type: Schema.Types.ObjectId, ref: 'Disability', required: true }],
  city: { type: String, enum: GEORGIA_CITIES, required: true },
  bio: { type: String },

  notificationPreference: { type: Boolean, default: true }, // true = "Email about post replies", false = "Never email"
  defaultDisabilityTags: [{ type: Schema.Types.ObjectId, ref: 'Disability' }],
  defaultDisabilityFilters: [{ type: Schema.Types.ObjectId, ref: 'Disability' }],
  postDeletionTimeline: {
    type: String,
    enum: Object.values(PostDeletionTimeline), // Use the enum values here
    default: PostDeletionTimeline.FourYears, // Set the default using the enum
  },

  profileColor: {
    type: String,
    enum: Object.values(ProfileColors), // Use the keys of the profile colors for enum
    default: ProfileColors.ProfileDefault, // Set the default color key
  },
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

export default UserModel;
