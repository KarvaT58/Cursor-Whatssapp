import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Função para parsear linha CSV corretamente
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

const BlacklistImportSchema = z.object({
  phone: z.string().min(10).max(20).transform((val) => {
    // Remove formatação e mantém apenas números
    return val.replace(/\D/g, '')
  }),
  reason: z.string().optional(),
})

// POST /api/blacklist/import - Importar números via CSV
export async function POST(request: NextRequest) {
  try {
    console.log('📥 IMPORTANDO BLACKLIST VIA CSV ===')
    
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const csvFile = formData.get('csv') as File

    if (!csvFile) {
      return NextResponse.json({ error: 'Arquivo CSV é obrigatório' }, { status: 400 })
    }

    // Verificar se é um arquivo CSV
    if (!csvFile.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Arquivo deve ser um CSV' }, { status: 400 })
    }

    // Ler o conteúdo do arquivo
    const csvContent = await csvFile.text()
    console.log('Conteúdo do CSV:', csvContent.substring(0, 200) + '...')
    
    const lines = csvContent.split('\n').filter(line => line.trim())
    console.log('Linhas encontradas:', lines.length)

    if (lines.length < 2) {
      return NextResponse.json({ 
        success: false,
        error: 'CSV deve ter pelo menos um cabeçalho e uma linha de dados' 
      }, { status: 400 })
    }

    // Parsear o cabeçalho
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    console.log('Cabeçalho encontrado:', header)
    
    const phoneIndex = header.findIndex(h => h.toLowerCase() === 'phone')
    const reasonIndex = header.findIndex(h => h.toLowerCase() === 'reason')
    
    console.log('Índices:', { phoneIndex, reasonIndex })

    if (phoneIndex === -1) {
      return NextResponse.json({ 
        success: false,
        error: 'CSV deve ter uma coluna "phone"' 
      }, { status: 400 })
    }

    // Processar linhas de dados
    const entries = []
    const errors = []
    let imported = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        // Parsear linha CSV (melhorado para lidar com aspas)
        const values = parseCSVLine(line)
        const phone = values[phoneIndex]
        const reason = reasonIndex !== -1 ? values[reasonIndex] : undefined

        console.log(`Linha ${i + 1}:`, { phone, reason, values })

        if (!phone) {
          errors.push(`Linha ${i + 1}: Número de telefone é obrigatório`)
          continue
        }

        // Validar dados
        const validatedData = BlacklistImportSchema.parse({
          phone,
          reason: reason || undefined,
        })

        // Verificar se já existe
        const { data: existingEntry } = await supabase
          .from('blacklist')
          .select('id')
          .eq('phone', validatedData.phone)
          .eq('user_id', user.id)
          .single()

        if (existingEntry) {
          errors.push(`Linha ${i + 1}: Número ${phone} já está na blacklist`)
          continue
        }

        entries.push({
          phone: validatedData.phone,
          reason: validatedData.reason || null,
          user_id: user.id
        })

        imported++

      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Linha ${i + 1}: ${error.errors[0].message}`)
        } else {
          errors.push(`Linha ${i + 1}: Erro ao processar dados`)
        }
      }
    }

    // Inserir no banco de dados
    if (entries.length > 0) {
      const { error: insertError } = await supabase
        .from('blacklist')
        .insert(entries)

      if (insertError) {
        console.error('Erro ao inserir blacklist:', insertError)
        return NextResponse.json(
          { error: 'Erro ao salvar números na blacklist' },
          { status: 500 }
        )
      }
    }

    console.log(`✅ Importação concluída: ${imported} números importados, ${errors.length} erros`)

    return NextResponse.json({
      success: true,
      imported,
      errors: errors.length,
      errorDetails: errors,
      message: `${imported} números importados com sucesso${errors.length > 0 ? `, ${errors.length} erros encontrados` : ''}`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação na importação:', error.errors)
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro de validação nos dados', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Erro na importação da blacklist:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}
