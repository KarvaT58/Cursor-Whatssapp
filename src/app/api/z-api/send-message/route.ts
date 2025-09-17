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
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido (use formato: +5511999999999)'),
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
  isGroup: z.boolean().optional().default(false),
  groupId: z.string().optional(),
})

// GET /api/z-api/send-message - Testar conectividade
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

    return NextResponse.json({
      success: true,
      message: 'API Z-API Send Message está funcionando',
      user: {
        id: user.id,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro no endpoint GET /api/z-api/send-message:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
      console.error('Erro de autenticação:', authError)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Dados recebidos:', body)

    // Validar dados
    const validatedData = SendMessageSchema.parse(body)
    console.log('Dados validados:', validatedData)

    // Buscar instância Z-API do usuário
    const { data: instance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('id', validatedData.instanceId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (instanceError || !instance) {
      console.error('Erro ao buscar instância Z-API:', instanceError)
      console.log('InstanceId procurado:', validatedData.instanceId)
      console.log('UserId:', user.id)
      return NextResponse.json(
        { error: 'Instância Z-API não encontrada ou inativa' },
        { status: 404 }
      )
    }

    console.log('Instância Z-API encontrada:', instance)

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      instance.instance_id,
      instance.instance_token,
      instance.client_token
    )

    // Enviar mensagem
    let result
    if (validatedData.isGroup) {
      console.log('Enviando mensagem para grupo:', validatedData.phone)
      result = await zApiClient.sendGroupMessage(
        validatedData.phone,
        validatedData.message
      )
    } else {
      console.log('Enviando mensagem individual:', {
        phone: validatedData.phone,
        message: validatedData.message,
        type: validatedData.type,
        mediaUrl: validatedData.mediaUrl,
        fileName: validatedData.fileName,
      })
      result = await zApiClient.sendMessage({
        phone: validatedData.phone,
        message: validatedData.message,
        type: validatedData.type,
        mediaUrl: validatedData.mediaUrl,
        fileName: validatedData.fileName,
      })
    }

    console.log('Resultado do envio:', result)

    if (!result.success) {
      console.error('Erro ao enviar mensagem:', result.error)
      return NextResponse.json(
        { error: result.error || 'Erro ao enviar mensagem' },
        { status: 400 }
      )
    }

    // Salvar mensagem no banco de dados
    let contactId = null
    let groupId = null

    if (validatedData.isGroup && validatedData.groupId) {
      // Buscar o grupo
      const { data: group } = await supabase
        .from('whatsapp_groups')
        .select('id')
        .eq('id', validatedData.groupId)
        .eq('user_id', user.id)
        .single()

      groupId = group?.id || null
    } else {
      // Buscar o contato
      const { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .eq('phone', validatedData.phone)
        .single()

      contactId = contact?.id || null
    }

    const { error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        contact_id: contactId,
        group_id: groupId,
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
      console.error('Erro de validação Zod:', error.issues)
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          })),
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
