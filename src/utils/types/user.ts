import { z } from "zod";
import { Types } from "mongoose";

export const userSchema = z.object({
  username: z.string(),
  isAdmin: z.boolean().default(false),
  lastName: z.string(),
  email: z.string().email(),
  childAge: z.number().min(0),
  childDisabilities: z.string().array().transform(ids => ids.map(id => new Types.ObjectId(id))),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  })
});

export const editUserSchema = userSchema.partial();

export type User = z.infer<typeof userSchema>;
export type UserInput = z.input<typeof userSchema>;
