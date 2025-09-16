import { Database } from './database'

// Tipos base do banco de dados
export type Group = Database['public']['Tables']['whatsapp_groups']['Row']
export type GroupInsert =
  Database['public']['Tables']['whatsapp_groups']['Insert']
export type GroupUpdate =
  Database['public']['Tables']['whatsapp_groups']['Update']

// Tipos estendidos para funcionalidades específicas
export interface GroupWithStats extends Group {
  messageCount: number
  lastMessage?: {
    content: string
    timestamp: string
    sender: string
  }
  unreadCount: number
}

export interface GroupParticipant {
  phone: string
  name?: string
  isAdmin: boolean
  joinedAt: string
  lastSeen?: string
}

export interface GroupMessage {
  id: string
  groupId: string
  content: string
  type: 'text' | 'image' | 'document' | 'audio'
  sender: string
  senderName?: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  replyTo?: string
  forwarded?: boolean
}

export interface GroupSyncResult {
  success: boolean
  data?: Group[]
  error?: string
  syncedCount: number
  createdCount: number
  updatedCount: number
}

export interface GroupFormData {
  name: string
  description?: string
  participants: string[]
  whatsapp_id?: string
}

export interface GroupFilters {
  search?: string
  hasUnread?: boolean
  participantCount?: {
    min?: number
    max?: number
  }
  createdAfter?: string
  createdBefore?: string
}

export interface GroupSortOptions {
  field: 'name' | 'created_at' | 'updated_at' | 'participant_count'
  direction: 'asc' | 'desc'
}

// Enums para status e tipos
export enum GroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum GroupType {
  REGULAR = 'regular',
  BROADCAST = 'broadcast',
  COMMUNITY = 'community',
}

// Interfaces para operações de grupo
export interface CreateGroupRequest {
  name: string
  description?: string
  participants: string[]
  instanceId: string
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  participants?: string[]
}

export interface AddParticipantRequest {
  groupId: string
  participantPhone: string
  instanceId: string
}

export interface RemoveParticipantRequest {
  groupId: string
  participantPhone: string
  instanceId: string
}

export interface SendGroupMessageRequest {
  groupId: string
  message: string
  type?: 'text' | 'image' | 'document' | 'audio'
  mediaUrl?: string
  instanceId: string
}

// Interfaces para estatísticas de grupo
export interface GroupStats {
  totalMessages: number
  messagesToday: number
  messagesThisWeek: number
  messagesThisMonth: number
  activeParticipants: number
  totalParticipants: number
  lastActivity: string
  averageResponseTime: number
}

// Interfaces para relatórios de grupo
export interface GroupReport {
  groupId: string
  groupName: string
  period: {
    start: string
    end: string
  }
  stats: GroupStats
  topParticipants: Array<{
    phone: string
    name?: string
    messageCount: number
  }>
  messageTypes: {
    text: number
    image: number
    document: number
    audio: number
  }
}

// Interfaces para configurações de grupo
export interface GroupSettings {
  allowNewMembers: boolean
  onlyAdminsCanSendMessages: boolean
  allowMediaSharing: boolean
  allowDocumentSharing: boolean
  allowAudioSharing: boolean
  muteNotifications: boolean
  archiveGroup: boolean
}

// Interfaces para notificações de grupo
export interface GroupNotification {
  id: string
  groupId: string
  type: 'new_message' | 'member_joined' | 'member_left' | 'group_updated'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: Record<string, unknown>
}
