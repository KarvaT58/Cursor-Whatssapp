import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

// Schema de validação
const MessagesSchema = z.object({
  instanceId: z.string().min(1, 'ID da instância é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório').optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
})

// GET /api/z-api/messages - Obter mensagens da instância Z-API
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const instanceId = searchParams.get('instanceId')
    const phone = searchParams.get('phone')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validar parâmetros
    const validatedData = MessagesSchema.parse({
      instanceId,
      phone,
      limit,
      offset,
    })

    // Buscar instância Z-API do usuário
    const { data: instance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('id', validatedData.instanceId)
      .eq('user_id', user.id)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instância Z-API não encontrada' },
        { status: 404 }
      )
    }

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      instance.instance_id,
      instance.instance_token,
      instance.client_token
    )

    // Construir parâmetros para a API
    const params: Record<string, string> = {
      limit: validatedData.limit.toString(),
      offset: validatedData.offset.toString(),
    }

    if (validatedData.phone) {
      params.phone = validatedData.phone
    }

    // Obter mensagens
    const result = await zApiClient.getMessages(params)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao obter mensagens' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: result.data,
      instance: {
        id: instance.id,
        name: instance.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Erro no endpoint GET /api/z-api/messages:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
