import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

// Schema de validação para adição de participantes
const addParticipantsSchema = z.object({
  phones: z.array(z.string()).min(1, 'Pelo menos um número deve ser fornecido')
})

// Schema de validação para remoção de participantes
const removeParticipantsSchema = z.object({
  phones: z.array(z.string()).min(1, 'Pelo menos um número deve ser fornecido')
})

// Schema de validação para adição/remoção de administradores
const manageAdminsSchema = z.object({
  phones: z.array(z.string()).min(1, 'Pelo menos um número deve ser fornecido')
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== INÍCIO DO GERENCIAMENTO DE GRUPO ===')
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError)
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id: groupId } = await params
    const body = await request.json()
    const { action } = body

    console.log('📋 Dados recebidos:', { groupId, action, body })

    // Buscar instância Z-API ativa
    const { data: userInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (instanceError || !userInstance) {
      console.error('❌ Erro ao buscar instância Z-API:', instanceError)
      return NextResponse.json(
        { error: 'Instância Z-API não encontrada ou inativa' },
        { status: 400 }
      )
    }

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      userInstance.instance_id,
      userInstance.instance_token,
      userInstance.client_token
    )

    let result: any = null

    switch (action) {
      case 'remove-participants':
        console.log('🔍 DEBUG API: Iniciando remoção de participantes')
        const removeData = removeParticipantsSchema.parse(body)
        console.log('🔍 DEBUG API: Dados validados:', removeData)
        result = await zApiClient.removeParticipants(groupId, removeData.phones)
        console.log('🔍 DEBUG API: Resultado da Z-API:', result)
        break

      case 'add-participants':
        console.log('🔍 DEBUG API: Iniciando adição de participantes')
        const addData = addParticipantsSchema.parse(body)
        console.log('🔍 DEBUG API: Dados validados:', addData)
        result = await zApiClient.addParticipants(groupId, addData.phones)
        console.log('🔍 DEBUG API: Resultado da Z-API:', result)
        break

      case 'add-admins':
        const addAdminData = manageAdminsSchema.parse(body)
        result = await zApiClient.addAdmins(groupId, addAdminData.phones)
        break

      case 'remove-admins':
        const removeAdminData = manageAdminsSchema.parse(body)
        result = await zApiClient.removeAdmins(groupId, removeAdminData.phones)
        break

      case 'get-invite-link':
        result = await zApiClient.getGroupInviteLink(groupId)
        break

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

    if (!result.success) {
      console.error('❌ Erro na operação Z-API:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Atualizar banco de dados local após operação bem-sucedida
    if (action === 'remove-participants') {
      console.log('🔄 Atualizando banco de dados após remoção de participantes')
      const removeData = removeParticipantsSchema.parse(body)
      
      // Buscar grupo atual
      const { data: currentGroup, error: groupError } = await supabase
        .from('whatsapp_groups')
        .select('participants')
        .eq('whatsapp_id', groupId)
        .single()

      if (groupError) {
        console.error('❌ Erro ao buscar grupo:', groupError)
      } else if (currentGroup) {
        // Remover participantes da lista
        const updatedParticipants = currentGroup.participants.filter(
          (phone: string) => !removeData.phones.includes(phone)
        )

        // Atualizar banco de dados
        const { error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({ 
            participants: updatedParticipants,
            updated_at: new Date().toISOString()
          })
          .eq('whatsapp_id', groupId)

        if (updateError) {
          console.error('❌ Erro ao atualizar grupo no banco:', updateError)
        } else {
          console.log('✅ Grupo atualizado no banco de dados')
        }
      }
    } else if (action === 'add-participants') {
      console.log('🔄 Atualizando banco de dados após adição de participantes')
      const addData = addParticipantsSchema.parse(body)
      
      // Buscar grupo atual
      const { data: currentGroup, error: groupError } = await supabase
        .from('whatsapp_groups')
        .select('participants')
        .eq('whatsapp_id', groupId)
        .single()

      if (groupError) {
        console.error('❌ Erro ao buscar grupo:', groupError)
      } else if (currentGroup) {
        // Adicionar participantes à lista (evitar duplicatas)
        const existingParticipants = currentGroup.participants || []
        const newParticipants = addData.phones.filter(
          (phone: string) => !existingParticipants.includes(phone)
        )
        const updatedParticipants = [...existingParticipants, ...newParticipants]

        // Atualizar banco de dados
        const { error: updateError } = await supabase
          .from('whatsapp_groups')
          .update({ 
            participants: updatedParticipants,
            updated_at: new Date().toISOString()
          })
          .eq('whatsapp_id', groupId)

        if (updateError) {
          console.error('❌ Erro ao atualizar grupo no banco:', updateError)
        } else {
          console.log('✅ Grupo atualizado no banco de dados')
        }
      }
    }

    console.log('✅ Operação realizada com sucesso:', result)
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Operação realizada com sucesso'
    })

  } catch (error: any) {
    console.error('❌ Erro no gerenciamento de grupo:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
