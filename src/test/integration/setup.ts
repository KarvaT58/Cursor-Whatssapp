import { beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Test database configuration
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

export const testSupabase = createClient(supabaseUrl, supabaseKey)

// Test data cleanup
export const cleanupTestData = async () => {
  try {
    // Clean up test data in reverse order of dependencies
    await testSupabase.from('team_messages').delete().like('content', 'TEST_%')
    await testSupabase
      .from('team_activities')
      .delete()
      .like('description', 'TEST_%')
    await testSupabase.from('team_invites').delete().like('email', 'test_%')
    await testSupabase.from('team_members').delete().like('user_id', 'test_%')
    await testSupabase.from('teams').delete().like('name', 'TEST_%')
    await testSupabase.from('campaigns').delete().like('name', 'TEST_%')
    await testSupabase.from('contacts').delete().like('name', 'TEST_%')
    
    // Clean up new test data for groups and communities
    await testSupabase.from('group_reports').delete().like('description', 'TEST_%')
    await testSupabase.from('group_messages').delete().like('content', 'TEST_%')
    await testSupabase.from('whatsapp_messages').delete().like('content', 'TEST_%')
    await testSupabase.from('whatsapp_groups').delete().like('name', 'TEST_%')
    await testSupabase.from('whatsapp_communities').delete().like('name', 'TEST_%')
    await testSupabase.from('community_groups').delete()
    await testSupabase.from('community_members').delete()
    await testSupabase.from('community_announcements').delete().like('content', 'TEST_%')
    await testSupabase.from('sync_logs').delete()
    await testSupabase.from('sync_history').delete()
    
    // Legacy cleanup
    await testSupabase.from('groups').delete().like('name', 'TEST_%')
    await testSupabase.from('messages').delete().like('content', 'TEST_%')
  } catch (error) {
    console.warn('Error cleaning up test data:', error)
  }
}

// Global test setup
beforeAll(async () => {
  // Clean up any existing test data
  await cleanupTestData()
})

afterAll(async () => {
  // Clean up test data after all tests
  await cleanupTestData()
})

beforeEach(async () => {
  // Clean up test data before each test
  await cleanupTestData()
})

// Helper function to create test user
export const createTestUser = async (userId: string = 'test-user-123') => {
  const { data, error } = await testSupabase.auth.admin.createUser({
    email: `test_${userId}@example.com`,
    password: 'testpassword123',
    user_metadata: {
      name: `TEST User ${userId}`,
    },
  })

  if (error) {
    console.warn('Error creating test user:', error)
  }

  return data?.user
}

// Helper function to create test team
export const createTestTeam = async (
  userId: string,
  teamName: string = 'TEST Team'
) => {
  const { data, error } = await testSupabase
    .from('teams')
    .insert({
      name: teamName,
      description: 'Test team for integration tests',
      owner_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.warn('Error creating test team:', error)
  }

  return data
}

// Helper function to create test contact
export const createTestContact = async (
  userId: string,
  contactName: string = 'TEST Contact'
) => {
  const { data, error } = await testSupabase
    .from('contacts')
    .insert({
      name: contactName,
      phone: '+1234567890',
      email: 'test@example.com',
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.warn('Error creating test contact:', error)
  }

  return data
}

// Helper function to create test campaign
export const createTestCampaign = async (
  userId: string,
  campaignName: string = 'TEST Campaign'
) => {
  const { data, error } = await testSupabase
    .from('campaigns')
    .insert({
      name: campaignName,
      message: 'TEST message content',
      status: 'draft',
      user_id: userId,
      total_recipients: 0,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      failed_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.warn('Error creating test campaign:', error)
  }

  return data
}

// Helper function to create test group
export const createTestGroup = async (
  userId: string,
  groupName: string = 'TEST Group'
) => {
  const { data, error } = await testSupabase
    .from('whatsapp_groups')
    .insert({
      name: groupName,
      description: 'Test group for integration tests',
      participants: ['+1234567890'],
      admins: ['+1234567890'],
      user_id: userId,
      whatsapp_id: `120363123456789012@g.us`,
      max_participants: 256,
      is_community_group: false,
      settings: {
        allow_member_invites: true,
        allow_member_messages: true,
        allow_member_media: true,
        allow_member_polls: true,
        require_admin_approval: false,
        mute_notifications: false,
      },
    })
    .select()
    .single()

  if (error) {
    console.warn('Error creating test group:', error)
  }

  return data
}

// Helper function to create test community
export const createTestCommunity = async (
  userId: string,
  communityName: string = 'TEST Community'
) => {
  const { data, error } = await testSupabase
    .from('whatsapp_communities')
    .insert({
      name: communityName,
      description: 'Test community for integration tests',
      image_url: 'https://example.com/test-image.jpg',
      whatsapp_community_id: 'whatsapp-community-test',
      announcement_group_id: 'announcement-group-test',
      max_groups: 10,
      user_id: userId,
      settings: {
        allow_member_invites: true,
        require_admin_approval: false,
        max_groups: 10,
        allow_announcements: true,
      },
    })
    .select()
    .single()

  if (error) {
    console.warn('Error creating test community:', error)
  }

  return data
}

// Helper function to create test message
export const createTestMessage = async (
  groupId: string,
  content: string = 'TEST message content'
) => {
  const { data, error } = await testSupabase
    .from('whatsapp_messages')
    .insert({
      group_id: groupId,
      content: content,
      type: 'text',
      sender_phone: '+1234567890',
      is_deleted: false,
    })
    .select()
    .single()

  if (error) {
    console.warn('Error creating test message:', error)
  }

  return data
}
