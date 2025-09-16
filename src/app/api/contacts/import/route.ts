import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

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

    // Processar cada contato
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]

      try {
        // Verificar se já existe contato com o mesmo telefone
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('phone', contact.phone)
          .single()

        if (existingContact) {
          if (overwrite) {
            // Atualizar contato existente
            const { error: updateError } = await supabase
              .from('contacts')
              .update({
                ...contact,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingContact.id)
              .eq('user_id', user.id)

            if (updateError) {
              results.errors.push({
                index: i,
                error: `Erro ao atualizar: ${updateError.message}`,
                contact,
              })
            } else {
              results.updated++
            }
          } else {
            // Pular contato existente
            results.skipped++
          }
        } else {
          // Criar novo contato
          const { error: insertError } = await supabase
            .from('contacts')
            .insert({
              ...contact,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (insertError) {
            results.errors.push({
              index: i,
              error: `Erro ao criar: ${insertError.message}`,
              contact,
            })
          } else {
            results.imported++
          }
        }
      } catch (error) {
        results.errors.push({
          index: i,
          error: `Erro de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          contact,
        })
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
