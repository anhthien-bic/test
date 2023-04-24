import {
  UserId,
  GroupId,
  groupIDSchema,
  userIDSchema,
  CommunityId,
} from "@/types";
import { ListDefaultParams } from "./common";
import { z } from "zod";

export type JoiningRequestsSort =
  | "created_at:desc"
  | "id:desc"
  | "created_at:asc"
  | "updated_at:asc"
  | "updated_at:desc";

export type KeyJoinRequests = "waiting" | "approved" | "canceled" | "rejected";

export interface JoiningRequestsParams extends ListDefaultParams {
  key?: KeyJoinRequests;
  sort?: JoiningRequestsSort;
  fullname?: string;
}

export enum GroupPrivacy {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  PRIVATE = "PRIVATE",
  SECRET = "SECRET",
}

export interface GroupProfileEdit {
  description?: string;
  background_img_url?: string;
  name?: string;
  icon?: string;
  privacy?: GroupPrivacyType;
  settings?: {
    is_join_approval?: boolean;
  };
}

export type MembershipAnswersPayload = {
  question_id: string;
  answer: string | null;
};

export type JoinGroupPayload = {
  groupId: string;
  membershipAnswers?: MembershipAnswersPayload[];
};

export type ActionJoiningRequestGroupPayload = {
  joinRequestId: UserId;
  id: GroupId;
};

export type UpdateJoinSettingsParams = {
  is_join_approval?: boolean;
  is_active_membership_questions?: boolean;
  id: GroupId;
  is_active_group_terms?: boolean;
};

export type GroupTermsParam = {
  content: string;
};

export interface MembershipQuestion {
  id: string;
  group_id: GroupId;
  question: string;
  is_required?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetCommunitiesParams extends ListDefaultParams {
  discover?: boolean;
  sort?: string;
}

export type GroupSettings = {
  is_join_approval?: boolean;
  is_active_group_terms?: boolean;
  is_active_membership_questions?: boolean;
};

export const groupPrivacyScheme = z.nativeEnum(GroupPrivacy);

export type GroupPrivacyType = z.infer<typeof groupPrivacyScheme>;

export const groupBaseScheme = z
  .object({
    id: groupIDSchema,
    parent_id: groupIDSchema.nullish(),
    name: z.string(),
    slug: z.string().optional(),
    description: z.string().nullish(),
    level: z.number().optional(),
    parents: z.array(z.string()).nullish(),
    owner_id: z.string().optional(),
    created_by: z.string().optional(),
    icon: z.string().nullish(),
    background_img_url: z.string().nullish(),
    privacy: groupPrivacyScheme,
    chat_id: z.string().optional(),
    scheme_id: z.string().optional(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    deleted_at: z.string().nullish(),
    settings: z
      .object({
        is_join_approval: z.boolean().optional(),
        is_active_group_terms: z.boolean().optional(),
        is_active_membership_questions: z.boolean().optional(),
      })
      .optional(),
    user_count: z.number().optional(),
    join_status: z.number().optional(),
    total_pending_members: z.number().optional(),
    unique: z.string().nullish(),
    members: z
      .array(
        z.object({
          id: userIDSchema,
          avatar: z.string(),
        })
      )
      .optional(),
    is_in_default_group_set: z.boolean().optional(),
    community_id: z.string().optional(),
    is_archived: z.boolean().nullish(),
  })
  .passthrough();

export const groupScheme: z.ZodType<z.infer<typeof groupBaseScheme>> =
  groupBaseScheme.extend({
    children: z.lazy(() => groupScheme.array()),
  });

export type Groups = z.infer<typeof groupScheme>;

export const communityDiscoverSchema = z.object({
  id: z.string(),
  name: z.string(),
  group_id: z.string(),
});

export type CommunityDiscover = z.infer<typeof communityDiscoverSchema>;

export const discoverScheme = z
  .object({
    community: communityDiscoverSchema.optional(),
    group_id: groupIDSchema.optional(),
  })
  .and(groupScheme);

export type Discover = z.infer<typeof discoverScheme>;

export const discoverResponseSchema = z.object({
  data: z.array(discoverScheme),
  meta: z
    .object({
      has_next_page: z.boolean().optional(),
      message: z.string(),
      total: z.number(),
    })
    .optional(),
});

export type DiscoverResponse = z.infer<typeof discoverResponseSchema>;

export const communityScheme = groupScheme.and(
  z.object({
    group_id: groupIDSchema,
    slug: z.string(),
  })
);

export type Community = z.infer<typeof communityScheme>;

export const communityProfileResponseScheme = z.object({
  data: communityScheme.nullable(),
});

export type CommunityProfileResponse = z.infer<
  typeof communityProfileResponseScheme
>;

export const groupTreeItemScheme: z.ZodType<
  Groups & {
    collapsed?: boolean;
  }
> = z.lazy(() =>
  groupScheme.and(
    z.object({
      collapsed: z.boolean().optional(),
      children: z.array(groupTreeItemScheme).optional(),
    })
  )
);

export type GroupTreeItem = z.infer<typeof groupTreeItemScheme>;

export type ToggleCollapseForGroupPayload = {
  communityId: CommunityId;
  groupId: GroupId;
  collapsed: boolean;
  newTreeData: GroupTreeItem[];
};

export type GetCommunityStructureParams = {
  include_archived?: boolean;
};

export interface GetTargetGroupsForMovingAGroupParams {
  communityId: CommunityId;
  groupId: GroupId;
  key?: string;
}

export interface MoveGroupParams {
  communityId: CommunityId;
  groupId: GroupId;
  targetOuterGroupId: GroupId;
}

export interface ReorderGroupsParams {
  communityId: CommunityId;
  groupIds: CommunityId[];
}

export interface GetMoveGroupPreviewParams {
  communityId: CommunityId;
  groupId: GroupId;
  targetId?: string;
}

export type CommunityOrdersPayload = { id: CommunityId }[];

export interface GroupsAsAdminParams extends ListDefaultParams {
  key?: string;
  sort?: string;
}

export interface MembersAsAdminParams extends ListDefaultParams {
  idUser: GroupId;
  communityId: CommunityId;
  isAdmin: boolean;
}

export type CreateGroupsSetPayload = {
  name: string;
  description?: string | null;
  group_ids: GroupId[];
};

export interface EditGroupSetParams {
  communityId: CommunityId;
  groupSetId: string;
  data: CreateGroupsSetPayload;
}

export interface DeleteGroupSet {
  groupSetId: string;
  communityId: CommunityId;
}

export interface RemoveGroupSet {
  communityId: CommunityId;
}

export type AddMemberToGroupSetsPayload = {
  userIds: UserId[];
};

export type ArchivedGroupPayload = {
  groupId: GroupId;
  communityId: CommunityId;
};

export type RestoreGroupPayload = ArchivedGroupPayload;

export const commReferralScheme = z.object({
  community_id: z.string().optional(),
  code: z.string(),
  is_active: z.boolean(),
});

export type CommReferralInfo = z.infer<typeof commReferralScheme>;

export interface CommReferralInfoParams
  extends Pick<CommReferralInfo, "is_active"> {}

export const commReferralResponseScheme = z.object({
  code: z.string(),
  meta: z.object({
    message: z.string(),
  }),
  data: commReferralScheme.nullish(),
});

export interface GetActivityLogParams extends Pick<ListDefaultParams, "limit"> {
  group_id?: GroupId;
  object_id?: UserId;
  object_type?: "GROUP" | "MEMBER";
  from?: number;
  to?: number;
  page?: number;
  sort?: "asc" | "desc";
}

export type GroupViewType = "flat" | "tree";

export type GetMyGroupsParams = ListDefaultParams;

export const groupTreeItemResponseScheme = z.object({
  data: z.array(groupTreeItemScheme),
});

export type GroupTreeItemResponse = z.infer<typeof groupTreeItemResponseScheme>;

export interface SearchDiscoverParams extends Omit<ListDefaultParams, "key"> {
  keyword: string;
}

export interface DiscoverGroupParams extends ListDefaultParams {
  discover?: boolean;
  id?: string;
}
