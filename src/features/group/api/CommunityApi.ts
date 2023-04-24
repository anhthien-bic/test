import GroupBaseApi from "./GroupBaseApi";
import {
  GetCommunitiesParams,
  GetCommunityStructureParams,
  GetMoveGroupPreviewParams,
  GetTargetGroupsForMovingAGroupParams,
  MoveGroupParams,
  ReorderGroupsParams,
  ToggleCollapseForGroupPayload,
  communityProfileResponseScheme,
  discoverResponseSchema,
  DiscoverGroupParams,
} from "../types";
import { CommunityId, UserId } from "@/types";

class CommunityApi extends GroupBaseApi {
  constructor() {
    super({
      baseURL: "communities/",
    });
  }

  async getCommunities({ discover, ...params }: GetCommunitiesParams) {
    return this.doGet({
      url: discover ? "discover" : "",
      method: "GET",
      params,
      validator: discoverResponseSchema.parseAsync,
    });
  }

  async getCommunityProfile(communityId: CommunityId) {
    const response = await this.doGet({
      withErrorHandle: true,
      url: `${communityId}`,
      validator: communityProfileResponseScheme.passthrough().parseAsync,
    });

    if (response.data) {
      return response.data;
    }
    throw new Error(response?.meta?.message);
  }

  async collapseGroup(payload: ToggleCollapseForGroupPayload) {
    const { communityId, groupId, collapsed } = payload;
    if (communityId.trim() === "" || groupId.trim() === "") return null;
    const response = await this.doGet({
      url: `${communityId}/group-structure/collapse/${groupId}`,
      data: {
        status: collapsed,
      },
    });
    return response.data;
  }

  async getCommunityStructure(
    communityId: CommunityId,
    params?: GetCommunityStructureParams
  ) {
    const response = await this.doGet({
      url: `${communityId}/group-structure`,
      params,
    });
    return response?.data;
  }

  async getTargetGroupsForMovingAGroup({
    communityId,
    groupId,
    key,
  }: GetTargetGroupsForMovingAGroupParams) {
    const response = await this.doGet({
      url: `${communityId}/group-structure/move-targets/${groupId}`,

      params: {
        key: key !== "" ? key : undefined,
      },
    });
    return response?.data;
  }

  async moveGroup({
    communityId,
    groupId,
    targetOuterGroupId,
  }: MoveGroupParams) {
    return this.doPut({
      url: `${communityId}/group-structure/move`,
      data: {
        group_id: groupId,
        target_outer_group_id: targetOuterGroupId,
      },
    });
  }

  async reorderGroups({ communityId, groupIds }: ReorderGroupsParams) {
    return this.doPut({
      url: `${communityId}/group-structure/order`,
      data: groupIds,
    });
  }

  async getMoveGroupPreview({
    communityId,
    groupId,
    targetId,
  }: GetMoveGroupPreviewParams) {
    const response = await this.doGet({
      url: `${communityId}/group-structure/move-preview`,
      method: "GET",
      params: {
        group_id: groupId,
        target_id: targetId,
      },
    });
    return response?.data;
  }

  async assignCommAdmin(communityId: string, userIds: UserId[]) {
    return this.doPut({
      url: `${communityId}/assign-admin`,
      data: { user_ids: userIds },
    });
  }

  async revokeCommAdmin(communityId: string, userIds: UserId[]) {
    return this.doPut({
      url: `${communityId}/revoke-admin`,
      data: { user_ids: userIds },
    });
  }

  async getGroups(params: DiscoverGroupParams) {
    const { id, discover, ...rest } = params;

    return this.doGet({
      url: discover ? `${id}/groups/discover` : `${id}/groups`,
      params: { ...rest },
      validator: discoverResponseSchema.parseAsync,
    });
  }
}
export default new CommunityApi();
