export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'user'
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          tags: string[]
          notes: string | null
          last_interaction: string | null
          whatsapp_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          tags?: string[]
          notes?: string | null
          last_interaction?: string | null
          whatsapp_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          tags?: string[]
          notes?: string | null
          last_interaction?: string | null
          whatsapp_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      whatsapp_groups: {
        Row: {
          id: string
          name: string
          whatsapp_id: string
          description: string | null
          participants: string[]
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          whatsapp_id: string
          description?: string | null
          participants?: string[]
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          whatsapp_id?: string
          description?: string | null
          participants?: string[]
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      whatsapp_messages: {
        Row: {
          id: string
          contact_id: string | null
          group_id: string | null
          content: string
          type: 'text' | 'image' | 'document' | 'audio'
          direction: 'inbound' | 'outbound'
          status: 'sent' | 'delivered' | 'read' | 'failed'
          whatsapp_message_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id?: string | null
          group_id?: string | null
          content: string
          type?: 'text' | 'image' | 'document' | 'audio'
          direction: 'inbound' | 'outbound'
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          whatsapp_message_id?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string | null
          group_id?: string | null
          content?: string
          type?: 'text' | 'image' | 'document' | 'audio'
          direction?: 'inbound' | 'outbound'
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          whatsapp_message_id?: string | null
          user_id?: string
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          message: string
          recipients: string[]
          status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed'
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          stats: {
            total: number
            sent: number
            delivered: number
            read: number
            failed: number
          }
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          message: string
          recipients?: string[]
          status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed'
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          stats?: {
            total: number
            sent: number
            delivered: number
            read: number
            failed: number
          }
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          message?: string
          recipients?: string[]
          status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed'
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          stats?: {
            total: number
            sent: number
            delivered: number
            read: number
            failed: number
          }
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_messages: {
        Row: {
          id: string
          team_id: string
          user_id: string
          content: string
          channel: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          content: string
          channel?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          content?: string
          channel?: string
          created_at?: string
        }
      }
      z_api_instances: {
        Row: {
          id: string
          user_id: string
          instance_id: string
          instance_token: string
          client_token: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instance_id: string
          instance_token: string
          client_token: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          instance_id?: string
          instance_token?: string
          client_token?: string
          name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
