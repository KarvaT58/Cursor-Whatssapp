import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const BlacklistSchema = z.object({
  phone: z.string().min(10).max(20).transform((val) => {
    // Remove formatação e mantém apenas números
    return val.replace(/\D/g, '')
  }),
  reason: z.string().optional(),
})

// GET /api/blacklist - Listar blacklist do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: blacklist, error } = await supabase
      .from('blacklist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar blacklist:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar blacklist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: blacklist })

  } catch (error) {
    console.error('Erro na API de blacklist:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/blacklist - Adicionar número à blacklist
export async function POST(request: NextRequest) {
  try {
    console.log('🚫 ADICIONANDO NÚMERO À BLACKLIST ===')
    
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Dados recebidos:', body)
    
    const validatedData = BlacklistSchema.parse(body)
    console.log('Dados validados:', validatedData)

    // Verificar se o número já está na blacklist
    const { data: existingEntry, error: checkError } = await supabase
      .from('blacklist')
      .select('id')
      .eq('phone', validatedData.phone)
      .eq('user_id', user.id)
      .single()

    if (existingEntry) {
      return NextResponse.json({
        success: false,
        error: 'Número já está na blacklist'
      }, { status: 400 })
    }

    const { data: blacklistEntry, error: insertError } = await supabase
      .from('blacklist')
      .insert({
        phone: validatedData.phone,
        reason: validatedData.reason || null,
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao adicionar à blacklist:', insertError)
      return NextResponse.json(
        { error: 'Erro ao adicionar à blacklist' },
        { status: 500 }
      )
    }

    console.log('✅ Número adicionado à blacklist com sucesso')
    return NextResponse.json({
      success: true,
      data: blacklistEntry,
      message: 'Número adicionado à blacklist com sucesso'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação:', error.errors)
      return NextResponse.json(
        { 
          success: false,
          error: 'Dados inválidos', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de blacklist:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}
