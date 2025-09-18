import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

// Schema para validação da imagem do grupo
const UpdateGroupImageSchema = z.object({
  image_url: z.string().url('URL da imagem inválida').optional(),
  remove_image: z.boolean().optional(),
})

// PATCH /api/groups/[id]/image - Atualizar imagem do grupo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== INÍCIO DO UPLOAD DE IMAGEM ===')
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
      .select('id, name, whatsapp_id, image_url')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se é uma requisição de upload de arquivo ou URL
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Upload de arquivo
      return await handleFileUpload(request, supabase, groupId, user.id, existingGroup)
    } else {
      // URL da imagem
      return await handleImageUrl(request, supabase, groupId, user.id, existingGroup)
    }
  } catch (error) {
    console.error('Erro na API de atualização de imagem do grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para lidar com upload de arquivo
async function handleFileUpload(
  request: NextRequest,
  supabase: any,
  groupId: string,
  userId: string,
  existingGroup: any
) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo de imagem é obrigatório' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${groupId}_${Date.now()}.${fileExt}`
    const filePath = `group-images/${fileName}`

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('group-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem' },
        { status: 500 }
      )
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('group-images')
      .getPublicUrl(filePath)

    // Atualizar URL da imagem no banco
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        image_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar URL da imagem:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar URL da imagem' },
        { status: 500 }
      )
    }

    // Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        console.log(`🔄 Sincronizando foto do grupo ${existingGroup.whatsapp_id} no WhatsApp`)
        
        // Buscar instância Z-API ativa
        const { data: userInstance, error: instanceError } = await supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', userId)
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
              console.log('✅ Usuário é administrador do grupo, prosseguindo com atualização da foto')
              
              // Atualizar foto do grupo no WhatsApp
              const zApiResult = await zApiClient.updateGroupPhoto(existingGroup.whatsapp_id, publicUrl)
              
              if (zApiResult.success) {
                console.log('✅ Foto do grupo atualizada no WhatsApp com sucesso')
              } else {
                console.error('❌ Erro ao atualizar foto do grupo no WhatsApp:', zApiResult.error)
              }
            } else {
              console.log('⚠️ AVISO: Usuário não é administrador do grupo, não é possível atualizar a foto no WhatsApp')
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
      message: 'Imagem do grupo atualizada com sucesso',
      group: updatedGroup,
      image_url: publicUrl,
    })
  } catch (error) {
    console.error('Erro no upload de arquivo:', error)
    return NextResponse.json(
      { error: 'Erro ao processar upload da imagem' },
      { status: 500 }
    )
  }
}

// Função para lidar com URL da imagem
async function handleImageUrl(
  request: NextRequest,
  supabase: any,
  groupId: string,
  userId: string,
  existingGroup: any
) {
  try {
    const body = await request.json()
    const { image_url, remove_image } = UpdateGroupImageSchema.parse(body)

    let newImageUrl = null

    if (remove_image) {
      // Remover imagem
      newImageUrl = null
    } else if (image_url) {
      // Validar URL da imagem
      newImageUrl = image_url
    } else {
      return NextResponse.json(
        { error: 'URL da imagem ou remove_image é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar URL da imagem no banco
    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        image_url: newImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar URL da imagem:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar imagem do grupo' },
        { status: 500 }
      )
    }

    // Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        console.log(`🔄 Sincronizando foto do grupo ${existingGroup.whatsapp_id} no WhatsApp`)
        
        // Buscar instância Z-API ativa
        const { data: userInstance, error: instanceError } = await supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', userId)
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
              console.log('✅ Usuário é administrador do grupo, prosseguindo com atualização da foto')
              
              let zApiResult
              if (remove_image) {
                // Remover foto do grupo no WhatsApp
                zApiResult = await zApiClient.removeGroupPhoto(existingGroup.whatsapp_id)
                if (zApiResult.success) {
                  console.log('✅ Foto do grupo removida no WhatsApp com sucesso')
                } else {
                  console.error('❌ Erro ao remover foto do grupo no WhatsApp:', zApiResult.error)
                }
              } else if (newImageUrl) {
                // Atualizar foto do grupo no WhatsApp
                zApiResult = await zApiClient.updateGroupPhoto(existingGroup.whatsapp_id, newImageUrl)
                if (zApiResult.success) {
                  console.log('✅ Foto do grupo atualizada no WhatsApp com sucesso')
                } else {
                  console.error('❌ Erro ao atualizar foto do grupo no WhatsApp:', zApiResult.error)
                }
              }
            } else {
              console.log('⚠️ AVISO: Usuário não é administrador do grupo, não é possível atualizar a foto no WhatsApp')
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
      message: remove_image ? 'Imagem removida com sucesso' : 'Imagem do grupo atualizada com sucesso',
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

    console.error('Erro ao processar URL da imagem:', error)
    return NextResponse.json(
      { error: 'Erro ao processar URL da imagem' },
      { status: 500 }
    )
  }
}
