import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de upload de arquivo
const UploadFileSchema = z.object({
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  content_type: z.string().min(1, 'Tipo de conteúdo é obrigatório'),
  size: z.number().min(1, 'Tamanho do arquivo deve ser maior que 0').max(2 * 1024 * 1024 * 1024, 'Arquivo muito grande (máximo 2GB)'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  is_compressed: z.boolean().default(false),
  compression_ratio: z.number().min(0).max(1).optional(),
})

// POST /api/groups/[id]/files/upload - Iniciar upload de arquivo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const groupId = params.id
    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { filename, content_type, size, description, is_compressed, compression_ratio } = UploadFileSchema.parse(body)

    // Verificar tipos de arquivo permitidos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
      'application/pdf', 'application/zip', 'application/rar',
      'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]

    if (!allowedTypes.includes(content_type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    // Verificar limite de armazenamento do grupo
    const { data: existingFiles, error: filesError } = await supabase
      .from('group_files')
      .select('size')
      .eq('group_id', groupId)
      .eq('status', 'completed')

    if (filesError) {
      console.error('Erro ao verificar arquivos existentes:', filesError)
      return NextResponse.json(
        { error: 'Erro ao verificar limite de armazenamento' },
        { status: 500 }
      )
    }

    const currentStorage = existingFiles?.reduce((total, file) => total + (file.size || 0), 0) || 0
    const maxStorage = 10 * 1024 * 1024 * 1024 // 10GB por grupo
    const newTotalStorage = currentStorage + size

    if (newTotalStorage > maxStorage) {
      return NextResponse.json(
        { error: 'Limite de armazenamento do grupo excedido (máximo 10GB)' },
        { status: 400 }
      )
    }

    // Gerar ID único para o arquivo
    const fileId = crypto.randomUUID()
    const fileExtension = filename.split('.').pop() || ''
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `groups/${groupId}/files/${fileId}.${fileExtension}`

    // Criar registro do arquivo
    const { data: newFile, error: createError } = await supabase
      .from('group_files')
      .insert({
        id: fileId,
        group_id: groupId,
        uploaded_by: user.id,
        uploaded_by_phone: userPhone,
        filename: sanitizedFilename,
        original_filename: filename,
        content_type: content_type,
        size: size,
        description: description || null,
        storage_path: storagePath,
        status: 'uploading',
        is_compressed: is_compressed,
        compression_ratio: compression_ratio || null,
        upload_progress: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar registro do arquivo:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar registro do arquivo' },
        { status: 500 }
      )
    }

    // Gerar URL de upload assinada para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('group-files')
      .createSignedUploadUrl(storagePath, {
        expiresIn: 3600, // 1 hora
        upsert: false,
      })

    if (uploadError) {
      console.error('Erro ao gerar URL de upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao gerar URL de upload' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Upload iniciado com sucesso',
      file: {
        id: newFile.id,
        filename: newFile.filename,
        size: newFile.size,
        status: newFile.status,
        upload_progress: newFile.upload_progress,
      },
      upload_url: uploadData.signedUrl,
      upload_path: storagePath,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
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

    console.error('Erro na API de upload de arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/groups/[id]/files/upload/[fileId] - Confirmar upload concluído
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
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

    const groupId = params.id
    const fileId = params.fileId

    if (!groupId || !fileId) {
      return NextResponse.json({ error: 'IDs do grupo e arquivo são obrigatórios' }, { status: 400 })
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Buscar o arquivo
    const { data: file, error: fileError } = await supabase
      .from('group_files')
      .select('*')
      .eq('id', fileId)
      .eq('group_id', groupId)
      .eq('uploaded_by', user.id)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o arquivo está em status de upload
    if (file.status !== 'uploading') {
      return NextResponse.json(
        { error: 'Arquivo não está em status de upload' },
        { status: 400 }
      )
    }

    // Verificar se o arquivo existe no storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('group-files')
      .download(file.storage_path)

    if (storageError || !fileData) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado no storage' },
        { status: 404 }
      )
    }

    // Atualizar status do arquivo para concluído
    const { data: updatedFile, error: updateError } = await supabase
      .from('group_files')
      .update({
        status: 'completed',
        upload_progress: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar status do arquivo:', updateError)
      return NextResponse.json(
        { error: 'Erro ao confirmar upload' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id) {
      try {
        // await sendFileToWhatsApp(group.whatsapp_id, updatedFile)
        console.log(`TODO: Enviar arquivo ${fileId} para WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    // TODO: Notificar participantes sobre o novo arquivo
    try {
      // await notifyParticipantsAboutFile(group.participants, updatedFile, group.name)
      console.log(`TODO: Notificar participantes sobre arquivo ${fileId}`)
    } catch (notificationError) {
      console.error('Erro ao notificar participantes:', notificationError)
      // Não falhar a operação se a notificação falhar
    }

    return NextResponse.json({
      message: 'Upload concluído com sucesso',
      file: {
        id: updatedFile.id,
        filename: updatedFile.filename,
        size: updatedFile.size,
        status: updatedFile.status,
        download_url: `/api/groups/${groupId}/files/${fileId}/download`,
        created_at: updatedFile.created_at,
      },
    })
  } catch (error) {
    console.error('Erro na API de confirmar upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
