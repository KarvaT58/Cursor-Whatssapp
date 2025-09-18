import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/groups/[id]/files/[fileId]/download - Download de arquivo
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

    // Verificar se o arquivo está concluído
    if (file.status !== 'completed') {
      return NextResponse.json(
        { error: 'Arquivo ainda não está disponível para download' },
        { status: 400 }
      )
    }

    // Gerar URL de download assinada
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('group-files')
      .createSignedUrl(file.storage_path, 3600) // 1 hora

    if (downloadError) {
      console.error('Erro ao gerar URL de download:', downloadError)
      return NextResponse.json(
        { error: 'Erro ao gerar URL de download' },
        { status: 500 }
      )
    }

    // Registrar download
    const { error: downloadLogError } = await supabase
      .from('file_downloads')
      .insert({
        file_id: fileId,
        downloaded_by: user.id,
        downloaded_by_phone: userPhone,
        downloaded_at: new Date().toISOString(),
      })

    if (downloadLogError) {
      console.error('Erro ao registrar download:', downloadLogError)
      // Não falhar a operação se o registro falhar
    }

    // Atualizar contador de downloads
    const { error: updateError } = await supabase
      .from('group_files')
      .update({
        download_count: (file.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', fileId)

    if (updateError) {
      console.error('Erro ao atualizar contador de downloads:', updateError)
      // Não falhar a operação se a atualização falhar
    }

    return NextResponse.json({
      message: 'URL de download gerada com sucesso',
      file: {
        id: file.id,
        filename: file.original_filename,
        size: file.size,
        content_type: file.content_type,
        description: file.description,
        uploaded_at: file.created_at,
        download_count: (file.download_count || 0) + 1,
      },
      download_url: downloadData.signedUrl,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Erro na API de download de arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
