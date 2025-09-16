import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

// Schema de validação para envio de mensagens
const SendMessageSchema = z.object({
  instanceId: z.string().min(1, 'ID da instância é obrigatório'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido'),
  message: z
    .string()
    .min(1, 'Mensagem é obrigatória')
    .max(4096, 'Mensagem muito longa'),
  type: z
    .enum(['text', 'image', 'document', 'audio'])
    .optional()
    .default('text'),
  mediaUrl: z.string().url('URL de mídia inválida').optional(),
  fileName: z.string().optional(),
})

// POST /api/z-api/send-message - Enviar mensagem via Z-API
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Validar dados
    const validatedData = SendMessageSchema.parse(body)

    // Buscar instância Z-API do usuário
    const { data: instance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('id', validatedData.instanceId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instância Z-API não encontrada ou inativa' },
        { status: 404 }
      )
    }

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      instance.instance_id,
      instance.instance_token,
      instance.client_token
    )

    // Enviar mensagem
    const result = await zApiClient.sendMessage({
      phone: validatedData.phone,
      message: validatedData.message,
      type: validatedData.type,
      mediaUrl: validatedData.mediaUrl,
      fileName: validatedData.fileName,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao enviar mensagem' },
        { status: 400 }
      )
    }

    // Salvar mensagem no banco de dados
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .eq('phone', validatedData.phone)
      .single()

    const { error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        contact_id: contact?.id || null,
        content: validatedData.message,
        direction: 'outbound',
        type: validatedData.type,
        status: 'sent',
        whatsapp_message_id: result.data?.messageId || null,
        created_at: new Date().toISOString(),
      })

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError)
      // Não falhar a requisição se não conseguir salvar no banco
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: result.data,
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

    console.error('Erro no endpoint POST /api/z-api/send-message:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
