import { Database } from './database'

export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']

export type CampaignStatus = Campaign['status']

export interface CampaignStats {
  total: number
  sent: number
  delivered: number
  read: number
  failed: number
}

export interface CampaignWithContacts extends Campaign {
  contacts?: {
    id: string
    name: string
    phone: string
    email?: string
  }[]
}

export interface CreateCampaignData {
  name: string
  message: string
  recipients: string[]
  scheduled_at?: string
  status?: CampaignStatus
}

export interface UpdateCampaignData {
  name?: string
  message?: string
  recipients?: string[]
  status?: CampaignStatus
  scheduled_at?: string
  stats?: CampaignStats
}

export interface CampaignFilters {
  status?: CampaignStatus
  search?: string
  date_from?: string
  date_to?: string
}

export interface CampaignListResponse {
  campaigns: CampaignWithContacts[]
  total: number
  page: number
  limit: number
}

export interface CampaignMetrics {
  total_campaigns: number
  active_campaigns: number
  completed_campaigns: number
  failed_campaigns: number
  total_messages_sent: number
  total_recipients: number
  success_rate: number
}
