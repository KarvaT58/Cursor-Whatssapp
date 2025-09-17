import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { z } from 'zod'

const SyncContactsSchema = z.object({
  instanceId: z.string().min(1, 'Instance ID é obrigatório'),
})

// POST /api/contacts/sync - Sincronizar contatos do WhatsApp via Z-API
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
    const { instanceId } = SyncContactsSchema.parse(body)

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

    // Obter contatos do WhatsApp
    const contactsResult = await zApiClient.getContacts()

    if (!contactsResult.success) {
      return NextResponse.json(
        { error: contactsResult.error || 'Erro ao obter contatos do WhatsApp' },
        { status: 400 }
      )
    }

    const whatsappContacts = contactsResult.data?.contacts || []
    const syncResults = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{
        phone: string
        error: string
      }>,
    }

    // Processar cada contato do WhatsApp
    for (const whatsappContact of whatsappContacts) {
      try {
        const { phone, name, pushname } = whatsappContact

        if (!phone || !name) {
          syncResults.skipped++
          continue
        }

        // Verificar se já existe contato com o mesmo telefone
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id, name')
          .eq('user_id', user.id)
          .eq('phone', phone)
          .single()

        if (existingContact) {
          // Atualizar contato existente se o nome for diferente
          if (existingContact.name !== (pushname || name)) {
            const { error: updateError } = await supabase
              .from('contacts')
              .update({
                name: pushname || name,
                whatsapp_id: phone,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingContact.id)

            if (updateError) {
              syncResults.errors.push({
                phone,
                error: `Erro ao atualizar: ${updateError.message}`,
              })
            } else {
              syncResults.updated++
            }
          } else {
            syncResults.skipped++
          }
        } else {
          // Criar novo contato
          const { error: insertError } = await supabase
            .from('contacts')
            .insert({
              name: pushname || name,
              phone,
              whatsapp_id: phone,
              user_id: user.id,
              tags: ['whatsapp'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (insertError) {
            syncResults.errors.push({
              phone,
              error: `Erro ao criar: ${insertError.message}`,
            })
          } else {
            syncResults.imported++
          }
        }
      } catch (error) {
        syncResults.errors.push({
          phone: whatsappContact.phone || 'unknown',
          error: `Erro de processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        })
      }
    }

    return NextResponse.json({
      message: 'Sincronização de contatos concluída',
      results: syncResults,
      total: whatsappContacts.length,
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

    console.error('Erro no endpoint POST /api/contacts/sync:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
