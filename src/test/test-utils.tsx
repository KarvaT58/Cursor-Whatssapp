import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { RealtimeProvider } from '@/providers/realtime-provider'
import { AuthProvider } from '@/providers/auth-provider'

// Mock providers for testing
const MockRealtimeProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="realtime-provider">{children}</div>
)

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">{children}</div>
)

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withProviders?: boolean
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <RealtimeProvider>{children}</RealtimeProvider>
    </AuthProvider>
  )
}

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { withProviders = false, ...renderOptions } = options

  if (withProviders) {
    return render(ui, { wrapper: AllTheProviders, ...renderOptions })
  }

  return render(ui, renderOptions)
}

// Mock data generators
export const mockCampaign = {
  id: '1',
  name: 'Test Campaign',
  message: 'Test message',
  status: 'draft' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1',
  total_recipients: 100,
  sent_count: 0,
  delivered_count: 0,
  read_count: 0,
  failed_count: 0,
}

export const mockContact = {
  id: '1',
  name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1',
}

export const mockGroup = {
  id: '1',
  name: 'Test Group',
  description: 'Test group description',
  participant_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1',
}

export const mockTeam = {
  id: '1',
  name: 'Test Team',
  description: 'Test team description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  owner_id: 'user-1',
}

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Helper functions
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const createMockSupabaseResponse = <T,>(
  data: T,
  error: unknown = null
) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
