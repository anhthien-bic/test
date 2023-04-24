import BaseApi from "@/api/BaseApi";
import { ApiConfig } from "@/api/BaseApi";

export default class GroupBaseApi extends BaseApi {
  constructor(data: ApiConfig) {
    super({
      ...data,
      baseURL: `${process.env.NEXT_PUBLIC_BEIN_GROUP_API_URL}${process.env.NEXT_PUBLIC_BEIN_GROUP_API_VERSION}/group/${data.baseURL}`,
      withCredentials: true,
    });
  }
}
