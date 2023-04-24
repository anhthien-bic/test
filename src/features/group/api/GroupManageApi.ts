import GroupBaseApi from "./GroupBaseApi";
import {
  CommunityOrdersPayload,
  ListDefaultParams,
  GroupsAsAdminParams,
  MembersAsAdminParams,
  CreateGroupsSetPayload,
  EditGroupSetParams,
  DeleteGroupSet,
  RemoveGroupSet,
  AddMemberToGroupSetsPayload,
  ArchivedGroupPayload,
  RestoreGroupPayload,
  commReferralResponseScheme,
  CommReferralInfoParams,
  GetActivityLogParams,
} from "../types";
import { CommunityId } from "@/types";

class GroupManageApi extends GroupBaseApi {
  constructor() {
    super({
      baseURL: "manage/communities/",
    });
  }

  async getDiscoverOwner() {
    const response = await this.doGet({
      url: `/me/communities/owned`,
    });
    return response?.data;
  }

  async updateCommunityOrders(communityOrders: CommunityOrdersPayload) {
    return this.doPut({
      url: `me/communities/order`,
      data: communityOrders,
    });
  }

  async getGroupsAsAdminOfCommunity(
    communityId: string,
    params?: GroupsAsAdminParams
  ) {
    const response = await this.doGet({
      url: `${communityId}/groups`,
      params,
    });
    return response?.data;
  }

  async getGroupSetsAsDefault(communityId: string) {
    const response = await this.doGet({
      url: `${communityId}/group-sets-default`,
    });
    return response?.data;
  }

  async getMembersAsAdminOfCommunity(
    communityId: string,
    params: ListDefaultParams
  ) {
    const response = await this.doGet({
      url: `${communityId}/members`,
      params,
    });
    return response?.data;
  }

  async getUserJoinedGroups(params?: MembersAsAdminParams) {
    const { communityId, idUser, isAdmin, ...rest } = params || {
      communityId: "",
      idUser: "",
    };
    if (communityId.trim() === "" || idUser.trim() === "") {
      return [];
    }
    const urlGroup = `${communityId}/users/${idUser}/groups`;

    const response = await this.doGet({
      url: isAdmin ? `${urlGroup}/as-admin` : urlGroup,
      params: {
        ...rest,
      },
    });
    return response?.data;
  }

  async getGroupsSet(communityId: CommunityId, params: ListDefaultParams) {
    const response = await this.doGet({
      url: `${communityId}/group-sets`,
      params,
    });
    return response.data;
  }

  async createGroupsSet(
    communityId: CommunityId,
    data: CreateGroupsSetPayload
  ) {
    return this.doPost({
      url: `${communityId}/group-sets`,
      data,
    });
  }

  async editGroupSet(communityId: CommunityId, data: EditGroupSetParams) {
    return this.doPut({
      url: `${communityId}/group-sets`,
      data,
    });
  }

  async deleteGroupSet(params: DeleteGroupSet) {
    return this.doDelete({
      url: `${params.communityId}/group-sets/${params.groupSetId}`,
    });
  }

  async removeGroupSetAsDefault(params: RemoveGroupSet) {
    return this.doDelete({
      url: `${params.communityId}/group-sets-default`,
    });
  }

  async addMemberToGroupSets({
    communityId,
    groupSetId,
    userIds,
  }: {
    communityId: CommunityId;
    groupSetId: string;
  } & AddMemberToGroupSetsPayload) {
    return this.doPost({
      url: `${communityId}/group-sets/${groupSetId}/members`,
      data: { user_ids: userIds },
    });
  }

  async getAddMemberProgress(communityId: CommunityId, jobId?: string) {
    return this.doGet({
      url: `${communityId}/group-sets/members/${jobId}`,
    });
  }

  async makeGroupSetAsDefault(communityId: CommunityId, groupSetId: string) {
    return this.doGet({
      url: `${communityId}/group-sets/${groupSetId}/default`,
    });
  }

  async archivedGroupService(archiveGroupPayload: ArchivedGroupPayload) {
    return this.doPut({
      url: `${archiveGroupPayload.communityId}/groups/${archiveGroupPayload.groupId}/archive`,
    });
  }

  async restoreGroupService(restoreGroupPayload: RestoreGroupPayload) {
    return this.doPut({
      url: `${restoreGroupPayload.communityId}/groups/${restoreGroupPayload.groupId}/restore`,
    });
  }

  async canCUDTagService(communityId: string): Promise<boolean> {
    const response = await this.doGet({
      url: `me/permissions/can-cud-tags/community/${communityId}`,
    });
    return response.data;
  }

  async getCommunityReferralInfo(communityId: string) {
    const response = await this.doGet({
      url: `${communityId}/referral`,
      withErrorHandle: true,
      validator: commReferralResponseScheme.passthrough().parseAsync,
    });
    return response.data;
  }

  async updateCommunityReferralInfo(
    communityId: CommunityId,
    params: CommReferralInfoParams
  ) {
    return this.doPut({
      url: `${communityId}/referral`,
      data: params,
    });
  }

  async getActivityLogs(
    communityId: CommunityId,
    params: GetActivityLogParams
  ) {
    return this.doGet({
      url: `${communityId}/activity-logs`,
      params: {
        limit: 20,
        page: 1,
        sort: "desc",
        ...params,
      },
    });
  }

  async getGroupsInGroupSet(communityId: CommunityId) {
    const response = await this.doGet({
      url: `${communityId}/group-ids-in-all-group-sets`,
    });
    return response?.data;
  }
}
export default new GroupManageApi();
