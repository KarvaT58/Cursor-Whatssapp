export interface Message {
  id: string
  content: string
  type:
    | 'text'
    | 'image'
    | 'audio'
    | 'video'
    | 'document'
    | 'location'
    | 'contact'
    | 'sticker'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  direction: 'inbound' | 'outbound'
  contact_id?: string
  group_id?: string
  user_id: string
  whatsapp_id?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

export interface WhatsAppInstance {
  id: string
  name: string
  phone: string
  status: 'connected' | 'disconnected' | 'connecting'
  qr_code?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface WhatsAppWebhook {
  id: string
  url: string
  events: string[]
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface MessageTemplate {
  id: string
  name: string
  content: string
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  language: string
  user_id: string
  created_at: string
  updated_at: string
}
