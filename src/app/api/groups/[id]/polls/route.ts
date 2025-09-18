import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de criação de enquete
const CreatePollSchema = z.object({
  question: z.string().min(1, 'Pergunta é obrigatória').max(500, 'Pergunta muito longa'),
  options: z.array(z.string().min(1, 'Opção não pode estar vazia').max(100, 'Opção muito longa'))
    .min(2, 'Mínimo 2 opções')
    .max(12, 'Máximo 12 opções'),
  allow_multiple: z.boolean().default(false),
  expires_at: z.string().datetime().optional(),
})

// POST /api/groups/[id]/polls - Criar enquete
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

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { question, options, allow_multiple, expires_at } = CreatePollSchema.parse(body)

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

    // Verificar se o usuário é administrador do grupo
    const userPhone = user.phone || user.email
    const isAdmin = group.admins?.includes(userPhone)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar enquetes' },
        { status: 403 }
      )
    }

    // Criar a enquete
    const { data: newPoll, error: createError } = await supabase
      .from('group_polls')
      .insert({
        group_id: groupId,
        question,
        options,
        allow_multiple: allow_multiple,
        expires_at: expires_at || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar enquete:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar enquete' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id) {
      try {
        // await createWhatsAppPoll(group.whatsapp_id, newPoll)
        console.log(`TODO: Criar enquete ${newPoll.id} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Enquete criada com sucesso',
      poll: newPoll,
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

    console.error('Erro na API de criação de enquete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/polls - Listar enquetes do grupo
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

    // Buscar enquetes do grupo
    const { data: polls, error: pollsError } = await supabase
      .from('group_polls')
      .select(`
        *,
        poll_votes (
          id,
          user_phone,
          selected_options,
          created_at
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (pollsError) {
      console.error('Erro ao buscar enquetes:', pollsError)
      return NextResponse.json(
        { error: 'Erro ao buscar enquetes' },
        { status: 500 }
      )
    }

    // Processar enquetes para incluir estatísticas
    const processedPolls = polls?.map(poll => {
      const votes = poll.poll_votes || []
      const totalVotes = votes.length
      
      // Calcular votos por opção
      const optionVotes = poll.options.map((option: string, index: number) => {
        const votesForOption = votes.filter((vote: any) => 
          vote.selected_options.includes(index)
        ).length
        
        return {
          option,
          index,
          votes: votesForOption,
          percentage: totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0,
        }
      })

      // Verificar se o usuário já votou
      const userVote = votes.find((vote: any) => vote.user_phone === userPhone)
      const hasUserVoted = !!userVote

      // Verificar se a enquete expirou
      const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date()

      return {
        ...poll,
        stats: {
          total_votes: totalVotes,
          option_votes: optionVotes,
          has_user_voted: hasUserVoted,
          user_vote: userVote?.selected_options || [],
          is_expired: isExpired,
        },
      }
    }) || []

    return NextResponse.json({
      message: 'Enquetes obtidas com sucesso',
      polls: processedPolls,
      total_polls: processedPolls.length,
    })
  } catch (error) {
    console.error('Erro na API de listagem de enquetes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
