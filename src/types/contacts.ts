export interface Contact {
  id: string
  name: string
  phone: string
  email: string | null
  tags: string[]
  notes: string | null
  last_interaction: string | null
  whatsapp_id: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface CreateContactData {
  name: string
  phone: string
  email?: string | null
  tags?: string[]
  notes?: string | null
}

export interface UpdateContactData {
  name?: string
  phone?: string
  email?: string | null
  tags?: string[]
  notes?: string | null
}

export interface ContactFilters {
  search?: string
  tags?: string[]
  created_after?: string
  created_before?: string
}
