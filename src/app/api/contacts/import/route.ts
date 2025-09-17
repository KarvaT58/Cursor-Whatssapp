import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { processPhoneForStorage, arePhoneNumbersEqual } from '@/lib/phone-utils'

// Schema para importação de contatos
const ImportContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notas muito longas').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
})

const ImportContactsSchema = z.object({
  contacts: z
    .array(ImportContactSchema)
    .min(1, 'Pelo menos um contato é necessário')
    .max(1000, 'Máximo de 1000 contatos por importação'),
  overwrite: z.boolean().optional().default(false),
})

// POST /api/contacts/import - Importar contatos em massa
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
    const { contacts, overwrite } = ImportContactsSchema.parse(body)

    const results = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{
        index: number
        error: string
        contact: Record<string, unknown>
      }>,
    }

    // Buscar todos os contatos existentes UMA VEZ (fora do loop)
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('id, phone')
      .eq('user_id', user.id)

    // Validar e preparar contatos para inserção
    const contactsToInsert: Array<Record<string, unknown>> = []
    const contactsToUpdate: Array<{
      id: string
      data: Record<string, unknown>
    }> = []

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]

      try {
        // Validar e normalizar telefone
        const phoneValidation = processPhoneForStorage(contact.phone)

        if (!phoneValidation.isValid) {
          results.errors.push({
            index: i,
            error: `Telefone inválido: ${phoneValidation.error}`,
            contact,
          })
          continue
        }

        // Verificar se já existe contato com o mesmo telefone (usando comparação normalizada)
        const existingContact = existingContacts?.find((existing) =>
          arePhoneNumbersEqual(existing.phone, phoneValidation.normalized!)
        )

        if (existingContact) {
          if (overwrite) {
            // Preparar para atualização
            contactsToUpdate.push({
              id: existingContact.id,
              data: {
                ...contact,
                phone: phoneValidation.normalized!,
                updated_at: new Date().toISOString(),
              },
            })
          } else {
            // Pular contato existente
            results.skipped++
          }
        } else {
          // Preparar para inserção
          contactsToInsert.push({
            ...contact,
            phone: phoneValidation.normalized!,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        results.errors.push({
          index: i,
          error: `Erro de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          contact,
        })
      }
    }

    // Executar atualizações em lote
    if (contactsToUpdate.length > 0) {
      for (const updateData of contactsToUpdate) {
        const { error: updateError } = await supabase
          .from('contacts')
          .update(updateData.data)
          .eq('id', updateData.id)
          .eq('user_id', user.id)

        if (updateError) {
          results.errors.push({
            index: -1,
            error: `Erro ao atualizar contato: ${updateError.message}`,
            contact: updateData.data,
          })
        } else {
          results.updated++
        }
      }
    }

    // Executar inserções em lote
    if (contactsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('contacts')
        .insert(contactsToInsert)

      if (insertError) {
        results.errors.push({
          index: -1,
          error: `Erro ao inserir contatos: ${insertError.message}`,
          contact: {},
        })
      } else {
        results.imported = contactsToInsert.length
      }
    }

    return NextResponse.json({
      message: 'Importação concluída',
      results,
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

    console.error('Erro no endpoint POST /api/contacts/import:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
