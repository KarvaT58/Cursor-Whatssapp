import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

// Schema para validação das configurações do grupo
const UpdateGroupSettingsSchema = z.object({
  admin_only_message: z.boolean().optional(),
  admin_only_settings: z.boolean().optional(),
  require_admin_approval: z.boolean().optional(),
  admin_only_add_member: z.boolean().optional(),
})

// PATCH /api/groups/[id]/settings - Atualizar configurações do grupo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INÍCIO DA ATUALIZAÇÃO DE CONFIGURAÇÕES ===')
    console.log('URL:', request.url)
    console.log('Method:', request.method)
    
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const groupId = resolvedParams.id
    console.log('Group ID:', groupId)
    
    if (!groupId) {
      console.log('Erro: ID do grupo é obrigatório')
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, admin_only_message, admin_only_settings, require_admin_approval, admin_only_add_member')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Validar dados da requisição
    const body = await request.json()
    console.log('Dados recebidos:', body)
    
    const validatedData = UpdateGroupSettingsSchema.parse(body)
    console.log('Dados validados:', validatedData)

    // Atualizar configurações no banco de dados
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        admin_only_message: validatedData.admin_only_message ?? existingGroup.admin_only_message,
        admin_only_settings: validatedData.admin_only_settings ?? existingGroup.admin_only_settings,
        require_admin_approval: validatedData.require_admin_approval ?? existingGroup.require_admin_approval,
        admin_only_add_member: validatedData.admin_only_add_member ?? existingGroup.admin_only_add_member,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar configurações:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações do grupo' },
        { status: 500 }
      )
    }

    // Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        console.log(`🔄 Sincronizando configurações do grupo ${existingGroup.whatsapp_id} no WhatsApp`)
        
        // Buscar instância Z-API ativa
        const { data: userInstance, error: instanceError } = await supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (instanceError || !userInstance) {
          console.error('❌ Erro ao buscar instância Z-API:', instanceError)
        } else {
          // Criar cliente Z-API
          const zApiClient = new ZApiClient(
            userInstance.instance_id,
            userInstance.instance_token,
            userInstance.client_token
          )

          // Verificar se o usuário é administrador do grupo
          const metadataResult = await zApiClient.getGroupMetadata(existingGroup.whatsapp_id)
          
          if (metadataResult.success && metadataResult.data) {
            const groupData = metadataResult.data
            
            // Obter o número de telefone real do usuário
            let userPhoneNumber = userInstance.instance_id
            
            try {
              const instanceInfo = await zApiClient.getInstanceInfo()
              if (instanceInfo.success && instanceInfo.data) {
                userPhoneNumber = instanceInfo.data.phone || instanceInfo.data.phoneNumber || instanceInfo.data.number || userInstance.instance_id
              }
            } catch (error) {
              console.log('⚠️ Não foi possível obter número real, usando instance_id')
            }
            
            if (!userPhoneNumber || userPhoneNumber === userInstance.instance_id) {
              userPhoneNumber = groupData.owner
            }
            
            // Verificar se o usuário é administrador
            const groupOwner = groupData.owner
            const isOwner = groupOwner === userPhoneNumber
            const isParticipantAdmin = groupData.participants?.some((participant: any) => 
              participant.phone === userPhoneNumber && (participant.isAdmin || participant.isSuperAdmin)
            )
            const isAdmin = isOwner || isParticipantAdmin
            
            if (isAdmin) {
              console.log('✅ Usuário é administrador do grupo, prosseguindo com atualização das configurações')
              
              // Atualizar configurações do grupo no WhatsApp
              const zApiResult = await zApiClient.updateGroupSettings(existingGroup.whatsapp_id, {
                adminOnlyMessage: updatedGroup.admin_only_message,
                adminOnlySettings: updatedGroup.admin_only_settings,
                requireAdminApproval: updatedGroup.require_admin_approval,
                adminOnlyAddMember: updatedGroup.admin_only_add_member,
              })
              
              if (zApiResult.success) {
                console.log('✅ Configurações do grupo atualizadas no WhatsApp com sucesso')
              } else {
                console.error('❌ Erro ao atualizar configurações do grupo no WhatsApp:', zApiResult.error)
              }
            } else {
              console.log('⚠️ AVISO: Usuário não é administrador do grupo, não é possível atualizar as configurações no WhatsApp')
            }
          } else {
            console.error('❌ Erro ao obter metadados do grupo:', metadataResult.error)
          }
        }
      } catch (zApiError) {
        console.error('❌ Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Configurações do grupo atualizadas com sucesso',
      group: updatedGroup,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de atualização de configurações do grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
