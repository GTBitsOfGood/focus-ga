import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";
import { Disability } from "./disability";
import { PostDeletionTimeline, ProfileColors } from "@/utils/consts";

export const userSchema = z.object({
  username: z.string(),
  isAdmin: z.boolean().default(false),
  isBanned: z.boolean().default(false),
  lastName: z.string(),
  email: z.string().email(),
  childAge: z.number().min(0),
  childDisabilities: z.string().array().transform(ids => ids.map(id => new Types.ObjectId(id))),
  city: z.string(),
  bio: z.string().optional(),

  notificationPreference: z.boolean().default(true), // true = "Email about post replies", false = "Never email"
  defaultDisabilityTags: z.string().array().transform(ids => ids.map(id => new Types.ObjectId(id))).default([]),
  defaultDisabilityFilters: z.string().array().transform(ids => ids.map(id => new Types.ObjectId(id))).default([]),
  postDeletionTimeline: z.enum(Object.values(PostDeletionTimeline) as [PostDeletionTimeline, ...PostDeletionTimeline[]]).default(PostDeletionTimeline.FourYears), 
  profileColor: z.enum(Object.values(ProfileColors) as [ProfileColors, ...ProfileColors[]]).default(ProfileColors.ProfileDefault), 
});

export const editUserSchema = userSchema.partial();

export type User = ExtendId<z.infer<typeof userSchema>>;
export type PopulatedUser = Omit<User, 'childDisabilities' | 'defaultDisabilityTags' | 'defaultDisabilityFilters'> & {
  childDisabilities: Array<Disability>,
  defaultDisabilityTags: Array<Disability>,
  defaultDisabilityFilters: Array<Disability>
};
export type UserInput = z.input<typeof userSchema>;
