import { z } from "zod";

export const groupIDSchema = z.string().uuid();
export type GroupId = z.infer<typeof groupIDSchema>;
export const userIDSchema = z.string().uuid();
export type UserId = z.infer<typeof userIDSchema>;
export const communityIdSchema = z.string().uuid();
export type CommunityId = z.infer<typeof communityIdSchema>;
