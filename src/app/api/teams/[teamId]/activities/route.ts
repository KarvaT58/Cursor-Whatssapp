import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const getActivitiesSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)

    const { search, type, date, limit, offset } = getActivitiesSchema.parse({
      search: searchParams.get('search'),
      type: searchParams.get('type'),
      date: searchParams.get('date'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is member of the team
    const { data: teamMember, error: memberError } = await supabase
      .from('users')
      .select('team_id, role')
      .eq('id', user.id)
      .eq('team_id', teamId)
      .single()

    if (memberError || !teamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build query
    let query = supabase
      .from('team_activities')
      .select(
        `
        *,
        user:users!team_activities_user_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('team_id', teamId)

    // Apply filters
    if (search) {
      query = query.or(
        `description.ilike.%${search}%,user.name.ilike.%${search}%`
      )
    }

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (date && date !== 'all') {
      const now = new Date()
      let dateFilter: Date

      switch (date) {
        case 'today':
          dateFilter = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          )
          break
        case 'yesterday':
          dateFilter = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
          )
          break
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateFilter = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          )
          break
        default:
          dateFilter = new Date(0)
      }

      query = query.gte('created_at', dateFilter.toISOString())
    }

    // Execute query
    const {
      data: activities,
      error: activitiesError,
      count,
    } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    const formattedActivities =
      activities?.map((activity) => ({
        ...activity,
        userName: activity.user?.name || activity.user?.email || 'Unknown',
        userEmail: activity.user?.email || '',
        metadata: {
          ...activity.metadata,
          avatarUrl: activity.user?.avatar_url,
        },
      })) || []

    return NextResponse.json({
      activities: formattedActivities,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Error in GET /api/teams/[teamId]/activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
