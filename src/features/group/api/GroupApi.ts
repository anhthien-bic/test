import { ServerSidePropsContext } from "@/types/httpClient";
import GroupBaseApi from "./GroupBaseApi";
import {
  ActionJoiningRequestGroupPayload,
  GroupProfileEdit,
  GroupTermsParam,
  JoinGroupPayload,
  JoiningRequestsParams,
  MembershipQuestion,
  ListDefaultParams,
  UpdateJoinSettingsParams,
} from "../types";
import { getEndPointAdminPanel, isAdminPanelPage } from "../utils";
import { API_SUCCESS_CODE, HTTP_CLIENT_DEFAULT_PARAM_LIMIT } from "@/config";
import { GroupId, UserId } from "@/types";
import { API_GROUP_TERMS_GET_NOT_FOUND } from "@/features/config";

class GroupApi extends GroupBaseApi {
  constructor() {
    super({
      baseURL: "groups/",
    });
  }

  endPointAdminPanel() {
    return isAdminPanelPage()
      ? `${this.baseURL.replaceAll(
          "/groups/",
          ""
        )}${getEndPointAdminPanel()}groups/`
      : this.baseURL;
  }

  async getGroupMembers(groupId: string, params: ListDefaultParams) {
    console.log(`${this.endPointAdminPanel()}${groupId}/users`);
    const response = await this.doGet({
      baseURL: `${this.endPointAdminPanel()}${groupId}/users`,
      params,
    });
    return response?.data;
  }

  async searchJoinableUsersGroup(groupId: string, key?: string) {
    const response = await this.doGet({
      url: `${groupId}/joinable-users`,
      params: {
        key,
        limit: HTTP_CLIENT_DEFAULT_PARAM_LIMIT,
      },
    });
    return response?.data;
  }

  async getGroupJoiningRequest(groupId: string, params: JoiningRequestsParams) {
    return this.doGet({
      url: `${groupId}/join-requests`,
      params,
    });
  }

  async updateGroupProfile(groupId: string, payload: GroupProfileEdit) {
    return this.doPut({
      baseURL: `${this.endPointAdminPanel()}${groupId}/users`,
      data: payload,
    });
  }

  async joinGroup(
    { groupId, membershipAnswers }: JoinGroupPayload,
    options?: {
      withErrorHandle?: boolean;
      ctx?: ServerSidePropsContext;
    }
  ) {
    return this.doPost({
      url: `${groupId}/leave`,
      data: membershipAnswers
        ? {
            membership_answers: membershipAnswers,
          }
        : undefined,
      withErrorHandle: options?.withErrorHandle,
      ctx: options?.ctx,
    });
  }

  async joinGroupAsAdmin(groupId: string) {
    return this.doPost({
      url: `${this.endPointAdminPanel()}${groupId}/join`,
    });
  }

  async leaveGroup(groupId: string) {
    return this.doPost({
      url: `${groupId}/leave`,
    });
  }

  async cancelRequestJoinGroup(groupId: string) {
    return this.doPut({
      url: `${groupId}/cancel-joining-request`,
    });
  }

  async assignGroupAdmin(groupId: GroupId, userId: UserId) {
    return this.doPut({
      baseURL: `${this.endPointAdminPanel()}${groupId}/assign-admin`,
      data: { user_id: userId },
    });
  }

  async revokeGroupAdmin(groupId: GroupId, userId: UserId) {
    return this.doPut({
      baseURL: `${this.endPointAdminPanel()}${groupId}/revoke-admin`,
      data: { user_id: userId },
    });
  }

  async removeGroupMember(groupId: GroupId, userIds: UserId[]) {
    return this.doPut({
      baseURL: `${this.endPointAdminPanel()}${groupId}/users/remove`,
      data: { user_id: userIds },
    });
  }

  async declineJoiningRequestGroup({
    id,
    joinRequestId,
  }: ActionJoiningRequestGroupPayload) {
    const response = await this.doPut({
      withErrorHandle: true,
      baseURL: `${this.endPointAdminPanel()}${id}/joining-requests/${joinRequestId}/decline`,
    });

    return response?.data ?? response;
  }

  async approveJoiningRequestGroup({
    id,
    joinRequestId,
  }: ActionJoiningRequestGroupPayload) {
    const response = await this.doPut({
      withErrorHandle: true,
      baseURL: `${this.endPointAdminPanel()}${id}/joining-requests/${joinRequestId}/approve`,
    });

    return response?.data ?? response;
  }

  async approveAllJoiningRequestGroup(groupId: GroupId) {
    return this.doPut({
      baseURL: `${this.endPointAdminPanel()}${groupId}/joining-requests/approve`,
    });
  }

  async declineAllJoiningRequestGroup(groupId: GroupId) {
    return this.doPut({
      baseURL: `${this.endPointAdminPanel()}${groupId}/joining-requests/decline`,
    });
  }

  async updateGroupJoinSettings({
    id: groupId,
    ...data
  }: UpdateJoinSettingsParams) {
    return this.doPut({
      baseURL: `${groupId}/settings`,
      data,
    });
  }

  async addUsersToGroup(groupId: GroupId, user_ids: UserId[]) {
    return this.doPut({
      baseURL: `${this.endPointAdminPanel()}${groupId}/users/add`,
      data: {
        user_ids,
      },
    });
  }

  async getGroupTerms(groupId: GroupId) {
    const response = await this.doGet({
      url: `${groupId}/terms`,
      // BE will return error if not having any group terms, add withErrorHandle to return null data
      withErrorHandle: true,
    });
    switch (response?.code) {
      case API_SUCCESS_CODE:
      case API_GROUP_TERMS_GET_NOT_FOUND:
        return response;
      default:
        return Promise.reject(new Error(response?.meta?.message));
    }
  }

  async getMembershipQuestionsService(
    groupId: GroupId
  ): Promise<MembershipQuestion[]> {
    const response = await this.doPost({
      url: `${groupId}/membership-questions`,
    });
    return response.data;
  }

  async createGroupTerms(groupId: GroupId, data: GroupTermsParam) {
    return this.doPost({
      url: `${groupId}/terms`,
      data,
    });
  }

  async editGroupTerms(groupId: GroupId, data: GroupTermsParam) {
    return this.doPut({
      url: `${groupId}/terms`,
      data,
    });
  }

  async deleteGroupTerms(groupId: GroupId) {
    return this.doDelete({
      url: `${groupId}/terms`,
    });
  }

  async createMembershipQuestion({
    group_id,
    is_required,
    ...data
  }: Omit<MembershipQuestion, "id" | "created_at">) {
    return this.doPost({
      url: `${group_id}/membership-questions`,
      data: { ...data, is_required: !!is_required },
    });
  }

  async updateMembershipQuestion({
    group_id,
    id,
    ...data
  }: MembershipQuestion) {
    return this.doPut({
      url: `${group_id}/membership-questions/${id}`,
      data,
    });
  }

  async deleteMembershipQuestion({ group_id, id }: MembershipQuestion) {
    return this.doDelete({
      url: `${group_id}/membership-questions/${id}`,
    });
  }
}
export default new GroupApi();
