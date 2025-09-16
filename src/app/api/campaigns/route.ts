import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateCampaignData, CampaignFilters } from '@/types/campaigns'
import { z } from 'zod'

const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  recipients: z
    .array(z.string())
    .min(1, 'Pelo menos um destinatário é obrigatório'),
  scheduled_at: z.string().optional(),
  status: z
    .enum(['draft', 'scheduled', 'running', 'completed', 'failed'])
    .optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('campaigns')
      .select(
        `
        *,
        contacts:recipients
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,message.ilike.%${search}%`)
    }

    if (date_from) {
      query = query.gte('created_at', date_from)
    }

    if (date_to) {
      query = query.lte('created_at', date_to)
    }

    // Get total count
    const { count } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // Fetch contact details for recipients
    const campaignsWithContacts = await Promise.all(
      campaigns.map(async (campaign) => {
        if (campaign.recipients && campaign.recipients.length > 0) {
          const { data: contacts } = await supabase
            .from('contacts')
            .select('id, name, phone, email')
            .in('id', campaign.recipients)
            .eq('user_id', user.id)

          return {
            ...campaign,
            contacts: contacts || [],
          }
        }
        return {
          ...campaign,
          contacts: [],
        }
      })
    )

    return NextResponse.json({
      campaigns: campaignsWithContacts,
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error in campaigns GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateCampaignSchema.parse(body)

    const campaignData = {
      ...validatedData,
      user_id: user.id,
      status: validatedData.status || 'draft',
      stats: {
        total: validatedData.recipients.length,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
      },
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in campaigns POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
