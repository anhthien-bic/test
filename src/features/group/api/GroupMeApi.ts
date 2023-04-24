import GroupBaseApi from "./GroupBaseApi";
import {
  CommunityOrdersPayload,
  ListDefaultParams,
  discoverResponseSchema,
  GroupViewType,
  GetMyGroupsParams,
  groupTreeItemResponseScheme,
  SearchDiscoverParams,
  Discover,
} from "../types";
import { CommunityId } from "@/types";

class CommunityApi extends GroupBaseApi {
  constructor() {
    super({
      baseURL: "me/",
    });
  }
  async canCUDTagService(communityId: string): Promise<boolean> {
    const response = await this.doGet({
      url: `permissions/can-cud-tags/community/${communityId}`,
    });
    return response.data;
  }

  async getDiscoverOwner() {
    const response = await this.doGet({
      url: `communities/owned`,
    });
    return response?.data;
  }

  async updateCommunityOrders(communityOrders: CommunityOrdersPayload) {
    return this.doPut({
      url: `communities/order`,
      data: communityOrders,
    });
  }

  async getMyCommunities() {
    return this.doGet({
      url: `communities`,
      validator: discoverResponseSchema.parseAsync,
    });
  }

  async getMyGroups(
    communityId: CommunityId,
    groupViewType: GroupViewType = "flat",
    params?: GetMyGroupsParams
  ) {
    return this.doGet({
      url: `communities/${communityId}/groups`,
      params: {
        preview_member: true,
        list_by: groupViewType,
        ...params,
      },
      validator: groupTreeItemResponseScheme.passthrough().parseAsync,
    });
  }

  async getYourGroups(params: ListDefaultParams) {
    return this.doGet({
      url: `groups`,
      validator: discoverResponseSchema.parseAsync,
      params,
    });
  }

  async getDiscoverManage(params: ListDefaultParams) {
    return this.doGet({
      url: `groups/manage`,
      validator: discoverResponseSchema.parseAsync,
      params,
    });
  }

  async getSearchDiscover(params: SearchDiscoverParams) {
    const response = await this.doGet({
      url: `search/groups`,
      validator: discoverResponseSchema.parseAsync,
      params,
    });
    return {
      ...response,
      data:
        // convert group id level 0 = community id
        response.data?.map((item: Discover) =>
          item.level === 0
            ? { ...item, id: item.community?.id ?? item.id }
            : item
        ) || [],
    };
  }
}
export default new CommunityApi();
