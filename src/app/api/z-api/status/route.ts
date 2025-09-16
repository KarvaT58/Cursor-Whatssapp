import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

// Schema de validação
const StatusSchema = z.object({
  instanceId: z.string().min(1, 'ID da instância é obrigatório'),
})

// GET /api/z-api/status - Verificar status da instância Z-API
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

    if (!instanceId) {
      return NextResponse.json(
        { error: 'ID da instância é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar instância Z-API do usuário
    const { data: instance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('id', instanceId)
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

    // Verificar status
    const result = await zApiClient.getStatus()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao verificar status' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      status: result.data,
      instance: {
        id: instance.id,
        name: instance.name,
        is_active: instance.is_active,
      },
    })
  } catch (error) {
    console.error('Erro no endpoint GET /api/z-api/status:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
