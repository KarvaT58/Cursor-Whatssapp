import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'
import { processPhoneForStorage, arePhoneNumbersEqual } from '@/lib/phone-utils'
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

    // Verificar se a instância está conectada
    const statusResult = await zApiClient.getInstanceStatus()

    if (!statusResult.success) {
      return NextResponse.json(
        {
          error: `Erro ao verificar status da instância: ${statusResult.error}`,
        },
        { status: 400 }
      )
    }

    // A Z-API retorna o status diretamente em data, não em data.status
    const isConnected =
      statusResult.data?.connected === true ||
      statusResult.data?.status === 'connected' ||
      statusResult.data?.connectionStatus === 'connected'

    if (!isConnected) {
      return NextResponse.json(
        {
          error:
            'Instância Z-API não está conectada. Conecte o WhatsApp primeiro.',
        },
        { status: 400 }
      )
    }

    // Obter contatos do WhatsApp com paginação
    let allContacts: unknown[] = []
    let page = 1
    const pageSize = 100
    let hasMore = true

    while (hasMore) {
      const contactsResult = await zApiClient.getContacts({
        page,
        pageSize,
      })

      if (!contactsResult.success) {
        return NextResponse.json(
          {
            error: contactsResult.error || 'Erro ao obter contatos do WhatsApp',
          },
          { status: 400 }
        )
      }

      // A Z-API retorna os contatos diretamente em data, não em data.contacts
      const contacts = Array.isArray(contactsResult.data)
        ? contactsResult.data
        : contactsResult.data?.contacts || []

      allContacts = allContacts.concat(contacts)

      // Se retornou menos contatos que o pageSize, não há mais páginas
      hasMore = contacts.length === pageSize
      page++

      // Limite de segurança para evitar loop infinito
      if (page > 10) {
        break
      }
    }

    const whatsappContacts = allContacts

    const syncResults = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{
        phone: string
        error: string
      }>,
    }

    // Buscar todos os contatos existentes UMA VEZ (fora do loop)
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('id, name, phone')
      .eq('user_id', user.id)

    // Processar cada contato do WhatsApp
    for (const whatsappContact of whatsappContacts) {
      try {
        // Extrair dados do contato - estrutura da Z-API
        const phone = whatsappContact.phone
        const name =
          whatsappContact.name || whatsappContact.vname || whatsappContact.short
        const pushname = whatsappContact.vname || whatsappContact.name

        if (!phone) {
          syncResults.skipped++
          continue
        }

        // Validar e normalizar número de telefone
        const phoneValidation = processPhoneForStorage(phone)
        if (!phoneValidation.isValid) {
          syncResults.skipped++
          syncResults.errors.push({
            phone,
            error: `Número inválido: ${phoneValidation.error}`,
          })
          continue
        }

        const normalizedPhone = phoneValidation.normalized!

        // Usar pushname se disponível, senão usar name
        const contactName = pushname || name || 'Contato sem nome'

        // Verificar se já existe contato com o mesmo telefone (usando comparação normalizada)
        const duplicateContact = existingContacts?.find((contact) =>
          arePhoneNumbersEqual(contact.phone, normalizedPhone)
        )

        if (duplicateContact) {
          // Atualizar contato existente se o nome for diferente
          if (duplicateContact.name !== contactName) {
            const { error: updateError } = await supabase
              .from('contacts')
              .update({
                name: contactName,
                phone: normalizedPhone,
                whatsapp_id: whatsappContact.id || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', duplicateContact.id)

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
              name: contactName,
              phone: normalizedPhone,
              whatsapp_id: whatsappContact.id || null,
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
