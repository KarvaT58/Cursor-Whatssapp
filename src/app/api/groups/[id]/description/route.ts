import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

// Schema para validação da descrição do grupo
const UpdateGroupDescriptionSchema = z.object({
  description: z.string().max(1024, 'Descrição muito longa').optional(),
})

// PATCH /api/groups/[id]/description - Atualizar descrição do grupo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id: groupId } = await params
    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { description } = UpdateGroupDescriptionSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, description, whatsapp_id')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar descrição do grupo
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar descrição do grupo:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar descrição do grupo' },
        { status: 500 }
      )
    }

    // Sincronizar com Z-API se whatsapp_id estiver presente
    console.log('🔍 DEBUG: Grupo encontrado:', { 
      id: existingGroup.id, 
      name: existingGroup.name, 
      description: existingGroup.description,
      whatsapp_id: existingGroup.whatsapp_id 
    })
    
    if (existingGroup.whatsapp_id) {
      try {
        console.log(`🔄 Sincronizando descrição do grupo ${existingGroup.whatsapp_id} no WhatsApp para: ${description || ''}`)
        
        // Buscar instância Z-API ativa
        const { data: userInstance, error: instanceError } = await supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (instanceError || !userInstance) {
          console.error('❌ Erro ao buscar instância Z-API:', instanceError)
          // Continuar sem falhar - a descrição foi atualizada no banco local
        } else {
          // Criar cliente Z-API
          const zApiClient = new ZApiClient(
            userInstance.instance_id,
            userInstance.instance_token,
            userInstance.client_token
          )

          // Primeiro, verificar se o usuário é administrador do grupo
          const metadataResult = await zApiClient.getGroupMetadata(existingGroup.whatsapp_id)
          
          if (metadataResult.success && metadataResult.data) {
            const groupData = metadataResult.data
            console.log('📋 Metadados do grupo:', groupData)
            
            // Obter o número de telefone real do usuário
            let userPhoneNumber = userInstance.instance_id // fallback
            
            try {
              const instanceInfo = await zApiClient.getInstanceInfo()
              if (instanceInfo.success && instanceInfo.data) {
                userPhoneNumber = instanceInfo.data.phone || instanceInfo.data.phoneNumber || instanceInfo.data.number || userInstance.instance_id
                console.log('📱 Número de telefone real obtido:', userPhoneNumber)
              }
            } catch (error) {
              console.log('⚠️ Não foi possível obter número real, usando instance_id')
            }
            
            // Se ainda não temos o número real, usar o owner do grupo como referência
            if (!userPhoneNumber || userPhoneNumber === userInstance.instance_id) {
              userPhoneNumber = groupData.owner
              console.log('📱 Usando owner do grupo como número do usuário:', userPhoneNumber)
            }
            
            // Verificar se o usuário é administrador
            // O owner do grupo é sempre administrador, e também verificar se está na lista de participantes como admin
            const groupOwner = groupData.owner
            const isOwner = groupOwner === userPhoneNumber
            
            // Verificar se o usuário está na lista de participantes como administrador
            const isParticipantAdmin = groupData.participants?.some((participant: any) => 
              participant.phone === userPhoneNumber && (participant.isAdmin || participant.isSuperAdmin)
            )
            
            const isAdmin = isOwner || isParticipantAdmin
            
            console.log('🔍 DEBUG: Verificação de permissões:', {
              groupOwner,
              userInstanceId: userInstance.instance_id,
              userPhoneNumber,
              isOwner,
              isParticipantAdmin,
              isAdmin,
              participants: groupData.participants
            })
            
            if (isAdmin) {
              console.log('✅ Usuário é administrador do grupo, prosseguindo com atualização')
              
              // Atualizar descrição do grupo no WhatsApp
              const zApiResult = await zApiClient.updateGroupDescription(existingGroup.whatsapp_id, description || '')
              
              if (zApiResult.success) {
                console.log('✅ Descrição do grupo atualizada no WhatsApp com sucesso')
              } else {
                console.error('❌ Erro ao atualizar descrição do grupo no WhatsApp:', zApiResult.error)
                // Não falhar a operação se a sincronização falhar
              }
            } else {
              console.log('⚠️ AVISO: Usuário não é administrador do grupo, não é possível atualizar a descrição no WhatsApp')
            }
          } else {
            console.error('❌ Erro ao obter metadados do grupo:', metadataResult.error)
            // Tentar atualizar mesmo assim
            const zApiResult = await zApiClient.updateGroupDescription(existingGroup.whatsapp_id, description || '')
            
            if (zApiResult.success) {
              console.log('✅ Descrição do grupo atualizada no WhatsApp com sucesso')
            } else {
              console.error('❌ Erro ao atualizar descrição do grupo no WhatsApp:', zApiResult.error)
            }
          }
        }
      } catch (zApiError) {
        console.error('❌ Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    } else {
      console.log('⚠️ AVISO: Grupo não possui whatsapp_id, não será sincronizado com WhatsApp')
    }

    return NextResponse.json({
      message: 'Descrição do grupo atualizada com sucesso',
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

    console.error('Erro na API de atualização de descrição do grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}