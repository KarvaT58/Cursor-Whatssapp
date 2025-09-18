// Tipos para o sistema de comunidades WhatsApp

export interface WhatsAppCommunity {
  id: string
  name: string
  description: string | null
  image_url: string | null
  whatsapp_community_id: string | null
  announcement_group_id: string | null
  created_by: string
  user_id: string
  is_active: boolean
  settings: {
    allow_member_invites: boolean
    require_admin_approval: boolean
    max_groups: number
    allow_announcements: boolean
  }
  created_at: string
  updated_at: string
}

export interface CommunityGroup {
  id: string
  community_id: string
  group_id: string
  added_by: string
  added_at: string
  is_announcement_group: boolean
  group?: {
    id: string
    name: string
    description: string | null
    participants: string[]
    admins: string[]
    whatsapp_id: string | null
  }
}

export interface CommunityMember {
  id: string
  community_id: string
  user_phone: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  invited_by: string | null
  is_active: boolean
}

export interface CommunityInvite {
  id: string
  community_id: string
  invite_code: string
  created_by: string
  expires_at: string
  max_uses: number | null
  used_count: number
  is_active: boolean
  created_at: string
}

export interface CommunityAnnouncement {
  id: string
  community_id: string
  sent_by: string
  content: string
  type: 'text' | 'image' | 'document'
  sent_at: string
  recipients_count: number
  status: 'pending' | 'sent' | 'failed'
}

// Tipos para criação e atualização
export interface CreateCommunityData {
  name: string
  description?: string
  image_url?: string
  settings?: Partial<WhatsAppCommunity['settings']>
}

export interface UpdateCommunityData {
  name?: string
  description?: string
  image_url?: string
  settings?: Partial<WhatsAppCommunity['settings']>
  is_active?: boolean
}

export interface AddGroupToCommunityData {
  group_id: string
  is_announcement_group?: boolean
}

export interface CreateCommunityInviteData {
  expires_at?: string
  max_uses?: number
}

export interface SendAnnouncementData {
  content: string
  type?: 'text' | 'image' | 'document'
  target_groups?: string[] // IDs dos grupos específicos, se não especificado, envia para todos
}

// Tipos para respostas da API
export interface CommunityListResponse {
  communities: WhatsAppCommunity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface CommunityDetailsResponse {
  community: WhatsAppCommunity
  groups: CommunityGroup[]
  members: CommunityMember[]
  stats: {
    total_groups: number
    total_members: number
    active_members: number
    announcement_groups: number
  }
}

export interface CommunityInviteResponse {
  invite: CommunityInvite
  invite_url: string
  qr_code?: string
}

// Tipos para filtros e busca
export interface CommunityFilters {
  query?: string
  is_active?: boolean
  created_by?: string
  has_announcement_group?: boolean
  min_groups?: number
  max_groups?: number
}

export interface CommunitySearchParams {
  page?: number
  limit?: number
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'groups_count'
  sort_order?: 'asc' | 'desc'
  filters?: CommunityFilters
}
