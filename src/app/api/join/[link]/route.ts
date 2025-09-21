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
    
    // Primeira consulta: buscar o group_link
    const { data: groupLinks, error: linkError } = await supabase
      .from('group_links')
      .select('*')
      .like('universal_link', `%/join/${universalLink}`)

    console.log('📋 Resultado da consulta group_links:', { groupLinks, linkError })

    if (linkError) {
      console.error('❌ Erro na consulta group_links:', linkError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar link universal',
        details: linkError.message
      }, { status: 500 })
    }

    if (!groupLinks || groupLinks.length === 0) {
      console.log('❌ Link universal não encontrado no banco')
      return NextResponse.json({ 
        success: false, 
        error: 'Link universal não encontrado' 
      }, { status: 404 })
    }

    const groupLink = groupLinks[0]
    console.log('📋 Group link encontrado:', groupLink)

    // Segunda consulta: buscar a group_family (dados básicos primeiro)
    const { data: groupFamiliesData, error: familyError } = await supabase
      .from('group_families')
      .select('name, base_name, total_participants')
      .eq('id', groupLink.group_family)

    console.log('📋 Resultado da consulta group_families:', { groupFamiliesData, familyError })

    if (familyError) {
      console.error('❌ Erro na consulta group_families:', familyError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar dados da família do grupo',
        details: familyError.message
      }, { status: 500 })
    }

    if (!groupFamiliesData || groupFamiliesData.length === 0) {
      console.error('❌ group_families não encontrada para o ID:', groupLink.group_family)
      return NextResponse.json({ 
        success: false, 
        error: 'Família do grupo não encontrada' 
      }, { status: 404 })
    }

    const groupFamilies = groupFamiliesData[0] // Pega o primeiro resultado

    // Terceira consulta: buscar os grupos da família
    const { data: whatsappGroups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, participants')
      .in('id', groupLink.active_groups || [])

    console.log('📋 Resultado da consulta whatsapp_groups:', { whatsappGroups, groupsError })

    if (groupsError) {
      console.warn('⚠️ Erro ao buscar grupos:', groupsError)
    }

    const activeGroups = whatsappGroups || []
    const availableSpots = activeGroups.reduce(
      (total: number, group: any) => total + (2 - (group.participants?.length || 0)), // eslint-disable-line @typescript-eslint/no-explicit-any
      0
    )

    console.log('✅ Link universal encontrado:', groupFamilies.name)
    return NextResponse.json({
      success: true,
      data: {
        familyName: groupFamilies.name,
        baseName: groupFamilies.base_name,
        totalParticipants: groupFamilies.total_participants,
        activeGroups: activeGroups.length,
        availableSpots: availableSpots
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
