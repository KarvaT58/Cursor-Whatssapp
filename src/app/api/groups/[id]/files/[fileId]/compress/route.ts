import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de compressão
const CompressFileSchema = z.object({
  compression_level: z.number().min(1).max(9).default(6),
  target_size: z.number().min(1024).optional(), // Tamanho alvo em bytes
  quality: z.number().min(0.1).max(1).default(0.8), // Para imagens/vídeos
})

// POST /api/groups/[id]/files/[fileId]/compress - Comprimir arquivo
export async function POST(
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

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Buscar o arquivo
    const { data: file, error: fileError } = await supabase
      .from('group_files')
      .select('*')
      .eq('id', fileId)
      .eq('group_id', groupId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o arquivo está concluído
    if (file.status !== 'completed') {
      return NextResponse.json(
        { error: 'Arquivo ainda não está disponível para compressão' },
        { status: 400 }
      )
    }

    // Verificar se o arquivo já foi comprimido
    if (file.is_compressed) {
      return NextResponse.json(
        { error: 'Arquivo já foi comprimido' },
        { status: 400 }
      )
    }

    // Verificar se o arquivo é comprimível
    const compressibleTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/zip', 'application/rar',
    ]

    if (!compressibleTypes.includes(file.content_type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suporta compressão' },
        { status: 400 }
      )
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { compression_level, target_size, quality } = CompressFileSchema.parse(body)

    // Verificar se o arquivo é grande o suficiente para compressão
    const minSizeForCompression = 1024 * 1024 // 1MB
    if (file.size < minSizeForCompression) {
      return NextResponse.json(
        { error: 'Arquivo muito pequeno para compressão (mínimo 1MB)' },
        { status: 400 }
      )
    }

    // Atualizar status do arquivo para comprimindo
    const { error: updateError } = await supabase
      .from('group_files')
      .update({
        status: 'compressing',
        compression_progress: 0,
      })
      .eq('id', fileId)

    if (updateError) {
      console.error('Erro ao atualizar status do arquivo:', updateError)
      return NextResponse.json(
        { error: 'Erro ao iniciar compressão' },
        { status: 500 }
      )
    }

    // TODO: Implementar compressão real do arquivo
    // Esta é uma implementação simulada
    try {
      // Simular processo de compressão
      console.log(`TODO: Comprimir arquivo ${fileId} com nível ${compression_level}`)
      
      // Simular progresso de compressão
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
        
        const { error: progressError } = await supabase
          .from('group_files')
          .update({
            compression_progress: progress,
          })
          .eq('id', fileId)

        if (progressError) {
          console.error('Erro ao atualizar progresso:', progressError)
        }
      }

      // Simular resultado da compressão
      const originalSize = file.size
      const compressionRatio = 0.3 // Simular 30% de redução
      const compressedSize = Math.round(originalSize * compressionRatio)

      // Atualizar arquivo com resultado da compressão
      const { data: compressedFile, error: finalUpdateError } = await supabase
        .from('group_files')
        .update({
          status: 'completed',
          is_compressed: true,
          compression_ratio: compressionRatio,
          compression_progress: 100,
          compressed_size: compressedSize,
          compression_settings: {
            level: compression_level,
            target_size: target_size,
            quality: quality,
          },
          compressed_at: new Date().toISOString(),
        })
        .eq('id', fileId)
        .select()
        .single()

      if (finalUpdateError) {
        console.error('Erro ao finalizar compressão:', finalUpdateError)
        return NextResponse.json(
          { error: 'Erro ao finalizar compressão' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Arquivo comprimido com sucesso',
        file: {
          id: compressedFile.id,
          filename: compressedFile.filename,
          original_size: originalSize,
          compressed_size: compressedSize,
          compression_ratio: compressionRatio,
          size_reduction: originalSize - compressedSize,
          compression_percentage: Math.round((1 - compressionRatio) * 100),
        },
      })
    } catch (compressionError) {
      console.error('Erro durante compressão:', compressionError)
      
      // Reverter status em caso de erro
      await supabase
        .from('group_files')
        .update({
          status: 'completed',
          compression_progress: 0,
        })
        .eq('id', fileId)

      return NextResponse.json(
        { error: 'Erro durante a compressão do arquivo' },
        { status: 500 }
      )
    }
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

    console.error('Erro na API de compressão de arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/files/[fileId]/compress - Obter status da compressão
export async function GET(
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

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Buscar o arquivo
    const { data: file, error: fileError } = await supabase
      .from('group_files')
      .select('*')
      .eq('id', fileId)
      .eq('group_id', groupId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Status da compressão obtido com sucesso',
      file: {
        id: file.id,
        filename: file.filename,
        status: file.status,
        is_compressed: file.is_compressed,
        compression_ratio: file.compression_ratio,
        compression_progress: file.compression_progress,
        original_size: file.size,
        compressed_size: file.compressed_size,
        compression_settings: file.compression_settings,
        compressed_at: file.compressed_at,
      },
    })
  } catch (error) {
    console.error('Erro na API de status da compressão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
