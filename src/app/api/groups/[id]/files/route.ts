import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/groups/[id]/files - Listar arquivos do grupo
export async function GET(
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

    // Buscar parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir query
    let query = supabase
      .from('group_files')
      .select(`
        *,
        file_downloads (
          id,
          downloaded_by_phone,
          downloaded_at
        )
      `)
      .eq('group_id', groupId)
      .eq('status', 'completed')

    // Aplicar filtros
    if (search) {
      query = query.or(`filename.ilike.%${search}%,original_filename.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (type) {
      if (type === 'image') {
        query = query.like('content_type', 'image/%')
      } else if (type === 'video') {
        query = query.like('content_type', 'video/%')
      } else if (type === 'audio') {
        query = query.like('content_type', 'audio/%')
      } else if (type === 'document') {
        query = query.or('content_type.like.application/pdf,content_type.like.application/msword,content_type.like.application/vnd.openxmlformats-officedocument.wordprocessingml.document,content_type.like.application/vnd.ms-excel,content_type.like.application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,content_type.like.application/vnd.ms-powerpoint,content_type.like.application/vnd.openxmlformats-officedocument.presentationml.presentation')
      } else if (type === 'archive') {
        query = query.or('content_type.like.application/zip,content_type.like.application/rar')
      } else if (type === 'text') {
        query = query.like('content_type', 'text/%')
      }
    }

    // Aplicar ordenação
    const validSortFields = ['created_at', 'filename', 'size', 'download_count']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at'
    const order = sortOrder === 'asc' ? 'asc' : 'desc'

    query = query.order(sortField, { ascending: order === 'asc' })

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    // Executar query
    const { data: files, error: filesError } = await query

    if (filesError) {
      console.error('Erro ao buscar arquivos:', filesError)
      return NextResponse.json(
        { error: 'Erro ao buscar arquivos' },
        { status: 500 }
      )
    }

    // Buscar total de arquivos para paginação
    let countQuery = supabase
      .from('group_files')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'completed')

    if (search) {
      countQuery = countQuery.or(`filename.ilike.%${search}%,original_filename.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (type) {
      if (type === 'image') {
        countQuery = countQuery.like('content_type', 'image/%')
      } else if (type === 'video') {
        countQuery = countQuery.like('content_type', 'video/%')
      } else if (type === 'audio') {
        countQuery = countQuery.like('content_type', 'audio/%')
      } else if (type === 'document') {
        countQuery = countQuery.or('content_type.like.application/pdf,content_type.like.application/msword,content_type.like.application/vnd.openxmlformats-officedocument.wordprocessingml.document,content_type.like.application/vnd.ms-excel,content_type.like.application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,content_type.like.application/vnd.ms-powerpoint,content_type.like.application/vnd.openxmlformats-officedocument.presentationml.presentation')
      } else if (type === 'archive') {
        countQuery = countQuery.or('content_type.like.application/zip,content_type.like.application/rar')
      } else if (type === 'text') {
        countQuery = countQuery.like('content_type', 'text/%')
      }
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Erro ao contar arquivos:', countError)
    }

    // Processar arquivos
    const processedFiles = files?.map(file => ({
      id: file.id,
      filename: file.original_filename,
      size: file.size,
      content_type: file.content_type,
      description: file.description,
      uploaded_by: file.uploaded_by_phone,
      uploaded_at: file.created_at,
      download_count: file.download_count || 0,
      last_downloaded_at: file.last_downloaded_at,
      is_compressed: file.is_compressed,
      compression_ratio: file.compression_ratio,
      download_url: `/api/groups/${groupId}/files/${file.id}/download`,
      recent_downloads: file.file_downloads?.slice(0, 5) || [],
    })) || []

    // Calcular estatísticas
    const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0)
    const fileTypes = processedFiles.reduce((acc, file) => {
      const type = file.content_type.split('/')[0]
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      message: 'Arquivos obtidos com sucesso',
      files: processedFiles,
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
      statistics: {
        total_files: count || 0,
        total_size: totalSize,
        file_types: fileTypes,
        average_size: processedFiles.length > 0 ? Math.round(totalSize / processedFiles.length) : 0,
      },
    })
  } catch (error) {
    console.error('Erro na API de listar arquivos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
