import { createClient } from '@/lib/supabase/server'

export interface GroupParticipant {
  id: string
  group_id: string
  participant_phone: string
  participant_name: string | null
  is_admin: boolean
  is_super_admin: boolean
  joined_at: string
  left_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Adiciona um participante a um grupo
 */
export async function addGroupParticipant(
  groupId: string,
  participantPhone: string,
  participantName?: string,
  isAdmin: boolean = false,
  isSuperAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('group_participants')
      .insert({
        group_id: groupId,
        participant_phone: participantPhone,
        participant_name: participantName,
        is_admin: isAdmin,
        is_super_admin: isSuperAdmin,
        is_active: true
      })

    if (error) {
      console.error('❌ Erro ao adicionar participante:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Participante ${participantPhone} adicionado ao grupo ${groupId}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao adicionar participante:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Remove um participante de um grupo (marca como inativo)
 */
export async function removeGroupParticipant(
  groupId: string,
  participantPhone: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Primeiro, verificar se o participante existe
    const { data: existingParticipant, error: checkError } = await supabase
      .from('group_participants')
      .select('id, is_active')
      .eq('group_id', groupId)
      .eq('participant_phone', participantPhone)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar participante:', checkError)
      return { success: false, error: checkError.message }
    }

    if (!existingParticipant) {
      console.log(`⚠️ Participante ${participantPhone} não encontrado no grupo ${groupId}`)
      return { success: true } // Considerar sucesso se não existe
    }

    if (!existingParticipant.is_active) {
      console.log(`⚠️ Participante ${participantPhone} já está inativo no grupo ${groupId}`)
      return { success: true } // Considerar sucesso se já está inativo
    }

    // Marcar como inativo
    const { error } = await supabase
      .from('group_participants')
      .update({
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('group_id', groupId)
      .eq('participant_phone', participantPhone)
      .eq('is_active', true)

    if (error) {
      console.error('❌ Erro ao remover participante:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Participante ${participantPhone} removido do grupo ${groupId}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao remover participante:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Obtém todos os participantes ativos de um grupo
 */
export async function getGroupParticipants(groupId: string): Promise<{
  success: boolean
  participants?: GroupParticipant[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('group_participants')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('❌ Erro ao obter participantes:', error)
      return { success: false, error: error.message }
    }

    return { success: true, participants: data || [] }
  } catch (error) {
    console.error('❌ Erro ao obter participantes:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Sincroniza participantes de um grupo com dados da Z-API
 */
export async function syncGroupParticipantsFromZApi(
  groupId: string,
  zApiParticipants: Array<{
    phone: string
    lid: string
    isAdmin: boolean
    isSuperAdmin: boolean
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Primeiro, marcar todos os participantes atuais como inativos
    await supabase
      .from('group_participants')
      .update({ is_active: false, left_at: new Date().toISOString() })
      .eq('group_id', groupId)
      .eq('is_active', true)

    // Depois, adicionar/reativar os participantes da Z-API
    for (const participant of zApiParticipants) {
      const { error } = await supabase
        .from('group_participants')
        .upsert({
          group_id: groupId,
          participant_phone: participant.phone,
          is_admin: participant.isAdmin,
          is_super_admin: participant.isSuperAdmin,
          is_active: true,
          joined_at: new Date().toISOString(),
          left_at: null
        }, {
          onConflict: 'group_id,participant_phone,is_active'
        })

      if (error) {
        console.error(`❌ Erro ao sincronizar participante ${participant.phone}:`, error)
      }
    }

    console.log(`✅ Participantes sincronizados para o grupo ${groupId}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao sincronizar participantes:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

/**
 * Obtém o número de participantes ativos de um grupo
 */
export async function getGroupParticipantCount(groupId: string): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { count, error } = await supabase
      .from('group_participants')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('is_active', true)

    if (error) {
      console.error('❌ Erro ao contar participantes:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('❌ Erro ao contar participantes:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
