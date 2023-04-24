import { COMMUNITY_SLUG, navigationPaths } from "@/features/config";
import Router from "next/router";

export const isAdminPanelPage = () => {
  if (!Router?.pathname) return false;
  return Router.pathname.includes(navigationPaths.ADMIN_PAGE.COMMUNITY_PROFILE);
};

export const getEndPointAdminPanel = (communityId: string = "") => {
  const communitySlug: any = Router?.query?.[COMMUNITY_SLUG];
  const endPoint = `/manage/communities/${communityId || communitySlug}/`;
  return isAdminPanelPage() ? endPoint : "";
};
