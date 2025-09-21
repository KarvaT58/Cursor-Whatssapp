import { NextRequest, NextResponse } from 'next/server'
import { GroupLinkSystem } from '@/lib/group-link-system'
import { z } from 'zod'

const JoinGroupSchema = z.object({
  phone: z.string().min(10).max(20).transform((val) => {
    // Remove formatação e mantém apenas números
    return val.replace(/\D/g, '')
  }),
  name: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { link: string } }
) {
  try {
    console.log('🔗 PROCESSANDO ENTRADA VIA LINK UNIVERSAL ===')
    console.log('URL:', request.url)
    console.log('Method:', request.method)

    const resolvedParams = await params
    const universalLink = resolvedParams.link
    console.log('Universal Link:', universalLink)

    if (!universalLink) {
      return NextResponse.json({ error: 'Link universal é obrigatório' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = JoinGroupSchema.parse(body)
    console.log('Dados validados:', validatedData)

    // Reconstruir o link completo
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const fullUniversalLink = `${baseUrl}/join/${universalLink}`

    // Buscar informações do link para obter o número do sistema
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { data: groupLinks, error: linkError } = await supabase
      .from('group_links')
      .select(`
        *,
        group_families (
          system_phone
        )
      `)
      .like('universal_link', `%/join/${universalLink}`)

    const groupLink = groupLinks?.[0] // Pega o primeiro resultado

    if (linkError || !groupLink) {
      return NextResponse.json({
        success: false,
        error: 'Link universal não encontrado'
      }, { status: 404 })
    }

    // Processar entrada via sistema de links
    const groupLinkSystem = new GroupLinkSystem()
    const result = await groupLinkSystem.processUniversalLinkEntry(
      fullUniversalLink,
      validatedData.phone,
      validatedData.name,
      groupLink.group_families.system_phone
    )

    if (result.success) {
      console.log('✅ Participante adicionado com sucesso via link universal')
      return NextResponse.json({
        success: true,
        message: 'Participante adicionado ao grupo com sucesso!',
        data: result.data
      })
    } else {
      console.log('❌ Erro ao adicionar participante:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Erro ao processar entrada via link universal:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { link: string } }
) {
  try {
    console.log('🔗 VERIFICANDO LINK UNIVERSAL ===')
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)
    
    const resolvedParams = await params
    const universalLink = resolvedParams.link
    console.log('Universal Link:', universalLink)

    if (!universalLink) {
      console.log('❌ Link universal não fornecido')
      return NextResponse.json({ error: 'Link universal é obrigatório' }, { status: 400 })
    }

    // Buscar pelo link usando LIKE para encontrar independente da URL base
    console.log('🔍 Conectando ao Supabase...')
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    console.log('✅ Supabase client criado')

    console.log('🔍 Buscando link universal no banco...')
    const { data: groupLinks, error: linkError } = await supabase
      .from('group_links')
      .select(`
        *,
        group_families (
          name,
          base_name,
          total_participants,
          whatsapp_groups (
            id,
            name,
            participants
          )
        )
      `)
      .like('universal_link', `%/join/${universalLink}`)

    console.log('📋 Resultado da consulta:', { groupLinks, linkError })

    const groupLink = groupLinks?.[0] // Pega o primeiro resultado

    if (linkError) {
      console.error('❌ Erro na consulta ao banco:', linkError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar link universal',
        details: linkError.message
      }, { status: 500 })
    }

    if (!groupLink) {
      console.log('❌ Link universal não encontrado no banco')
      return NextResponse.json({ 
        success: false, 
        error: 'Link universal não encontrado' 
      }, { status: 404 })
    }

    // Verificar se group_families existe
    if (!groupLink.group_families) {
      console.error('❌ group_families é null para o link:', universalLink)
      console.log('📋 Dados do groupLink:', JSON.stringify(groupLink, null, 2))
      return NextResponse.json({ 
        success: false, 
        error: 'Dados do grupo não encontrados' 
      }, { status: 500 })
    }

    console.log('✅ Link universal encontrado:', groupLink.group_families.name)
    return NextResponse.json({
      success: true,
      data: {
        familyName: groupLink.group_families.name,
        baseName: groupLink.group_families.base_name,
        totalParticipants: groupLink.group_families.total_participants,
        activeGroups: groupLink.group_families.whatsapp_groups?.length || 0,
        availableSpots: groupLink.group_families.whatsapp_groups?.reduce(
          (total: number, group: any) => total + (2 - (group.participants?.length || 0)), // eslint-disable-line @typescript-eslint/no-explicit-any
          0
        ) || 0
      }
    })

  } catch (error) {
    console.error('❌ Erro ao verificar link universal:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
