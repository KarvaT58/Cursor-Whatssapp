import { Database } from './database'

// Base types from database
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']

export type TeamMessage = Database['public']['Tables']['team_messages']['Row']
export type TeamMessageInsert =
  Database['public']['Tables']['team_messages']['Insert']
export type TeamMessageUpdate =
  Database['public']['Tables']['team_messages']['Update']

export type User = Database['public']['Tables']['users']['Row']

// Team role enum
export type TeamRole = 'owner' | 'admin' | 'user'

// Extended types with relationships
export interface TeamWithMembers extends Team {
  members: TeamMember[]
  memberCount: number
}

export interface TeamMember extends User {
  isOnline?: boolean
  lastSeen?: string
}

export interface TeamMessageWithUser extends TeamMessage {
  sender: {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
  }
  replyTo?: TeamMessageWithUser
}

// API Response types
export interface TeamResponse {
  team: Team
  members: TeamMember[]
  userRole: 'admin' | 'user'
}

export interface TeamMembersResponse {
  members: TeamMember[]
  userRole: 'admin' | 'user'
}

export interface TeamMessagesResponse {
  messages: TeamMessageWithUser[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

// Form types
export interface CreateTeamData {
  name: string
  description?: string
}

export interface UpdateTeamData {
  name?: string
  description?: string
}

export interface InviteUserData {
  email: string
  role?: TeamRole
}

export interface UpdateUserRoleData {
  userId: string
  role: TeamRole
}

export interface SendMessageData {
  content: string
  messageType?: 'text' | 'image' | 'file' | 'system'
  channel?: string
  replyToId?: string
  metadata?: Record<string, unknown>
}

export interface EditMessageData {
  content: string
  metadata?: Record<string, unknown>
}

// Hook types
export interface UseTeamOptions {
  refreshInterval?: number
  enabled?: boolean
}

export interface UseTeamMessagesOptions {
  channel?: string
  limit?: number
  refreshInterval?: number
  enabled?: boolean
}

// Team statistics
export interface TeamStats {
  totalMembers: number
  onlineMembers: number
  totalMessages: number
  messagesToday: number
  activeChannels: string[]
}

// Team activity
export interface TeamActivity {
  id: string
  type:
    | 'message'
    | 'member_joined'
    | 'member_left'
    | 'role_changed'
    | 'team_updated'
  description: string
  userId: string
  userName: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// Team channels
export interface TeamChannel {
  name: string
  description?: string
  isDefault: boolean
  messageCount: number
  lastMessage?: {
    content: string
    timestamp: string
    userName: string
  }
}

// Team permissions
export interface TeamPermissions {
  canInviteMembers: boolean
  canRemoveMembers: boolean
  canUpdateTeam: boolean
  canDeleteTeam: boolean
  canManageRoles: boolean
  canCreateChannels: boolean
  canDeleteMessages: boolean
}

// Team settings
export interface TeamSettings {
  allowMemberInvites: boolean
  requireApprovalForJoins: boolean
  defaultChannel: string
  maxMembers?: number
  messageRetentionDays?: number
}

// Team invite
export interface TeamInvite {
  id: string
  teamId: string
  email: string
  role: 'admin' | 'user'
  invitedBy: string
  invitedByName: string
  expiresAt: string
  createdAt: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}

// Team notification settings
export interface TeamNotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  mentionNotifications: boolean
  channelNotifications: string[]
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

// Real-time message types
export interface TeamMessageEvent {
  type: 'message_created' | 'message_updated' | 'message_deleted'
  message: TeamMessageWithUser
  teamId: string
  channel: string
}

export interface TeamMemberPresence {
  userId: string
  isOnline: boolean
  lastSeen: string
  status?: 'available' | 'busy' | 'away'
}

export interface TeamTypingIndicator {
  userId: string
  userName: string
  channel: string
  isTyping: boolean
}

// Message search and filtering
export interface MessageSearchFilters {
  query?: string
  senderId?: string
  messageType?: 'text' | 'image' | 'file' | 'system'
  dateFrom?: string
  dateTo?: string
  hasAttachments?: boolean
}

export interface MessageSearchResult {
  messages: TeamMessageWithUser[]
  total: number
  query: string
  filters: MessageSearchFilters
}
