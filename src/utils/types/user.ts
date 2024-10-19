import { z } from "zod";
import { Types } from "mongoose";
import { ExtendId } from "./common";
import { Disability } from "./disability";

export const userSchema = z.object({
  username: z.string(),
  isAdmin: z.boolean().default(false),
  lastName: z.string(),
  email: z.string().email(),
  childAge: z.number().min(0),
  childDisabilities: z.string().array().transform(ids => ids.map(id => new Types.ObjectId(id))),
  city: z.string(),
  bio: z.string().optional(),
});

export const editUserSchema = userSchema.partial();

export type User = ExtendId<z.infer<typeof userSchema>>;
export type PopulatedUser = Omit<User, 'childDisabilities'> & { childDisabilities: Array<Disability> };
export type UserInput = z.input<typeof userSchema>;
