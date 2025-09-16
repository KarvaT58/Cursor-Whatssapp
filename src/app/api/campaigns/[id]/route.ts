import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateCampaignData } from '@/types/campaigns'
import { z } from 'zod'

const UpdateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  recipients: z.array(z.string()).optional(),
  status: z
    .enum(['draft', 'scheduled', 'running', 'completed', 'failed'])
    .optional(),
  scheduled_at: z.string().optional(),
  stats: z
    .object({
      total: z.number(),
      sent: z.number(),
      delivered: z.number(),
      read: z.number(),
      failed: z.number(),
    })
    .optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(
        `
        *,
        contacts:recipients
      `
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching campaign:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      )
    }

    // Fetch contact details for recipients
    let contacts: Array<{
      id: string
      name: string
      phone: string
      email?: string
    }> = []
    if (campaign.recipients && campaign.recipients.length > 0) {
      const { data: contactData } = await supabase
        .from('contacts')
        .select('id, name, phone, email')
        .in('id', campaign.recipients)
        .eq('user_id', user.id)

      contacts = contactData || []
    }

    return NextResponse.json({
      ...campaign,
      contacts,
    })
  } catch (error) {
    console.error('Error in campaign GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = UpdateCampaignSchema.parse(body)

    // Check if campaign exists and belongs to user
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in campaign PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if campaign exists and belongs to user
    const { data: existingCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Don't allow deletion of running campaigns
    if (existingCampaign.status === 'running') {
      return NextResponse.json(
        { error: 'Cannot delete running campaign' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting campaign:', error)
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in campaign DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
