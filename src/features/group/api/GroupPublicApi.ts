import GroupBaseApi from "./GroupBaseApi";


import { GroupId } from "@/types";

class CommunityApi extends GroupBaseApi {
  constructor() {
    super({
      baseURL: "public/",
    });
  }

  async getPublicCommunityService(communityId: string) {
    const response = await this.doGet({
      url: `communities/${communityId}`,
      noAuth: true,
    });
    return response.data;
  }

  async getPublicGroupService(groupId: GroupId) {
    const response = await this.doGet({
      url: `groups/${groupId}`,
      noAuth: true,
    });
    return response?.data;
  }
}

export default new CommunityApi();
