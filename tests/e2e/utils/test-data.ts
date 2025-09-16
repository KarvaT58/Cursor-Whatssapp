/**
 * Test data for E2E tests
 */

export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'TestPassword123!',
    name: 'Admin User',
    role: 'admin',
  },
  user: {
    email: 'user@test.com',
    password: 'TestPassword123!',
    name: 'Regular User',
    role: 'user',
  },
}

export const testContacts = [
  {
    name: 'João Silva',
    phone: '+5511999999999',
    email: 'joao@test.com',
    tags: ['cliente', 'vip'],
  },
  {
    name: 'Maria Santos',
    phone: '+5511888888888',
    email: 'maria@test.com',
    tags: ['prospecto'],
  },
  {
    name: 'Pedro Costa',
    phone: '+5511777777777',
    email: 'pedro@test.com',
    tags: ['fornecedor'],
  },
]

export const testGroups = [
  {
    name: 'Grupo de Vendas',
    description: 'Grupo para discussões de vendas',
    participants: ['+5511999999999', '+5511888888888'],
  },
  {
    name: 'Suporte Técnico',
    description: 'Grupo para suporte técnico',
    participants: ['+5511777777777', '+5511999999999'],
  },
]

export const testCampaigns = [
  {
    name: 'Campanha de Boas-vindas',
    message: 'Olá! Bem-vindo ao nosso serviço. Como podemos ajudá-lo hoje?',
    recipients: ['+5511999999999', '+5511888888888'],
  },
  {
    name: 'Promoção Especial',
    message:
      'Aproveite nossa promoção especial! Desconto de 20% em todos os produtos.',
    recipients: ['+5511999999999', '+5511888888888', '+5511777777777'],
  },
]

export const testTeamMessages = [
  {
    content: 'Bom dia equipe! Vamos começar o dia com foco nas vendas.',
    channel: 'general',
  },
  {
    content: 'Lembrem-se da reunião às 14h sobre as novas campanhas.',
    channel: 'general',
  },
]

export const zApiConfig = {
  apiKey: 'test-api-key-123',
  instanceId: 'test-instance-456',
  webhookUrl: 'https://test-webhook.com/webhook',
}
