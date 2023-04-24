export const COMMUNITY_SLUG = 'communitySlug'
export const navigationPaths = {
    ADMIN_PAGE :{
        COMMUNITY_PROFILE: `/admin/[${COMMUNITY_SLUG}]`,
    }
} as const