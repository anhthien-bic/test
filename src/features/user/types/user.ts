import { userIDSchema } from "@/types";
import { z } from "zod";

const latestWorkSchema = z.object({
    company: z.string().optional(),
    title_position: z.string().optional(),
})

export type LatestWork = z.infer<typeof latestWorkSchema>

export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHERS'])
export type Gender = z.infer<typeof genderSchema>

export const userSchema = z.object({
    bein_staff_role: z.string().nullable().optional(),
    id: userIDSchema,
    chat_user_id: z.string().optional(),
    email: z.string().email().optional(),
    username: z.string(),
    fullname: z.string().optional(),
    gender: genderSchema.optional().nullable(),
    avatar: z.string().url().optional(),
    background_img_url: z.string().optional(),
    country_code: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    rocket_chat_id: z.string().optional(),
    cognitoUuid: userIDSchema.optional(),
    streamUuid: userIDSchema.optional(),
    city: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    language: z.array(z.string()).optional().nullable(),
    relationship_status: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    birthday: z.string().optional().nullable(),
    latest_work: latestWorkSchema.optional().nullable(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    deleted_at: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    is_verified: z.boolean().optional(),
})

export type UserProfile = z.infer<typeof userSchema>