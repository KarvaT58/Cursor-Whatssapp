// Cliente Z-API
export { ZApiClient, useZApiInstances } from './client'

// Tipos Z-API
export type {
  ZApiInstance,
  ZApiMessage,
  ZApiGroup,
  ZApiGroupSettings,
  ZApiGroupParticipant,
  ZApiGroupMessage,
  ZApiGroupStats,
  ZApiCommunity,
  ZApiCommunitySettings,
  ZApiCommunityGroup,
  ZApiCommunityMember,
  ZApiCommunityAnnouncement,
  ZApiCommunityStats,
  ZApiResponse,
} from './client'

// Hooks específicos
export { useZApiGroups } from '../../hooks/use-z-api-groups'
export type { UseZApiGroupsReturn } from '../../hooks/use-z-api-groups'

export { useZApiCommunities } from '../../hooks/use-z-api-communities'
export type { UseZApiCommunitiesReturn } from '../../hooks/use-z-api-communities'
