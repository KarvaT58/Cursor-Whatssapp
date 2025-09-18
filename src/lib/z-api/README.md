# Cliente Z-API para Grupos WhatsApp

Este módulo fornece uma integração completa com a Z-API para gerenciamento de grupos WhatsApp, implementando todas as funcionalidades necessárias para o sistema de grupos.

## Funcionalidades Implementadas

### 🔍 Busca de Grupos
- **searchGroups()** - Buscar grupos com filtros avançados
- **getGroupInfo()** - Obter informações detalhadas de um grupo
- **getGroups()** - Listar todos os grupos

### 🏘️ Gerenciamento de Comunidades
- **searchCommunities()** - Buscar comunidades com filtros
- **getCommunityInfo()** - Obter informações detalhadas de uma comunidade
- **getCommunities()** - Listar todas as comunidades

### ✏️ Atualização de Grupos
- **updateGroupName()** - Atualizar nome do grupo
- **updateGroupDescription()** - Atualizar descrição do grupo
- **updateGroupImage()** - Atualizar imagem do grupo

### ✏️ Atualização de Comunidades
- **updateCommunityName()** - Atualizar nome da comunidade
- **updateCommunityDescription()** - Atualizar descrição da comunidade
- **updateCommunityImage()** - Atualizar imagem da comunidade
- **deactivateCommunity()** - Desativar comunidade

### 👥 Gerenciamento de Participantes
- **getGroupParticipants()** - Obter lista de participantes
- **addGroupParticipants()** - Adicionar participantes ao grupo
- **removeGroupParticipants()** - Remover participantes do grupo

### 👑 Gerenciamento de Administradores
- **getGroupAdmins()** - Obter lista de administradores
- **promoteGroupAdmin()** - Promover participante a administrador
- **demoteGroupAdmin()** - Remover privilégios de administrador

### 👥 Gerenciamento de Membros da Comunidade
- **getCommunityMembers()** - Obter lista de membros da comunidade
- **addCommunityMember()** - Adicionar membro à comunidade
- **removeCommunityMember()** - Remover membro da comunidade
- **promoteCommunityMember()** - Promover membro a administrador
- **demoteCommunityMember()** - Remover privilégios de administrador

### 🏗️ Operações de Grupo
- **createGroup()** - Criar novo grupo
- **leaveGroup()** - Sair do grupo

### 🏗️ Operações de Comunidade
- **createCommunity()** - Criar nova comunidade

### 📢 Grupo de Avisos
- **getCommunityAnnouncementGroup()** - Obter grupo de avisos da comunidade
- **createCommunityAnnouncementGroup()** - Criar grupo de avisos para a comunidade
- **sendCommunityAnnouncement()** - Enviar anúncio para toda a comunidade
- **sendCommunityAnnouncementToGroups()** - Enviar anúncio para grupos específicos

### 🔗 Vinculação de Grupos
- **getCommunityGroups()** - Obter grupos da comunidade
- **addGroupToCommunity()** - Adicionar grupo à comunidade
- **removeGroupFromCommunity()** - Remover grupo da comunidade
- **setGroupAsAnnouncementGroup()** - Definir grupo como grupo de avisos
- **unsetGroupAsAnnouncementGroup()** - Remover grupo de avisos

### 🔗 Links de Convite
- **getGroupInviteLink()** - Obter link de convite atual
- **generateGroupInviteLink()** - Gerar novo link de convite
- **revokeGroupInviteLink()** - Revogar link de convite
- **acceptGroupInvite()** - Aceitar convite de grupo

### 🔗 Links de Convite da Comunidade
- **getCommunityInviteLink()** - Obter link de convite da comunidade
- **generateCommunityInviteLink()** - Gerar novo link de convite da comunidade
- **revokeCommunityInviteLink()** - Revogar link de convite da comunidade
- **acceptCommunityInvite()** - Aceitar convite da comunidade

### 💬 Mensagens de Grupo
- **sendGroupMessage()** - Enviar mensagem para grupo
- **getGroupMessages()** - Obter mensagens do grupo
- **deleteGroupMessage()** - Apagar mensagem do grupo

### 📊 Estatísticas
- **getGroupStats()** - Obter estatísticas do grupo
- **getCommunityStats()** - Obter estatísticas da comunidade
- **getCommunityAnnouncementStats()** - Obter estatísticas de anúncios da comunidade

## Uso

### Cliente Z-API Direto

```typescript
import { ZApiClient } from '@/lib/z-api'

// Criar cliente
const client = new ZApiClient(instanceId, instanceToken, clientToken)

// Buscar grupos
const groups = await client.searchGroups({
  name: 'Meu Grupo',
  limit: 10
})

// Atualizar nome do grupo
await client.updateGroupName('groupId', 'Novo Nome')

// Adicionar participantes
await client.addGroupParticipants('groupId', ['5511999999999'])

// Criar comunidade
const community = await client.createCommunity({
  name: 'Minha Comunidade',
  description: 'Descrição da comunidade'
})

// Enviar anúncio para toda a comunidade
await client.sendCommunityAnnouncement('communityId', {
  content: 'Anúncio importante!',
  type: 'text'
})

// Adicionar grupo à comunidade
await client.addGroupToCommunity('communityId', {
  groupId: 'groupId',
  isAnnouncementGroup: true
})
```

### Hook useZApiGroups

```typescript
import { useZApiGroups } from '@/hooks/use-z-api-groups'

function GroupManager() {
  const {
    groups,
    isLoading,
    error,
    searchGroups,
    updateGroupName,
    addGroupParticipants,
    createGroup
  } = useZApiGroups()

  // Buscar grupos
  const handleSearch = async () => {
    const results = await searchGroups({
      name: 'Meu Grupo',
      limit: 20
    })
    console.log('Grupos encontrados:', results)
  }

  // Atualizar nome
  const handleUpdateName = async (groupId: string, newName: string) => {
    const success = await updateGroupName(groupId, newName)
    if (success) {
      console.log('Nome atualizado com sucesso!')
    }
  }

  // Criar grupo
  const handleCreateGroup = async () => {
    const group = await createGroup({
      name: 'Novo Grupo',
      description: 'Descrição do grupo',
      participants: ['5511999999999', '5511888888888']
    })
    
    if (group) {
      console.log('Grupo criado:', group)
    }
  }

  return (
    <div>
      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      
      <button onClick={handleSearch}>Buscar Grupos</button>
      <button onClick={handleCreateGroup}>Criar Grupo</button>
      
      {groups.map(group => (
        <div key={group.id}>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <button onClick={() => handleUpdateName(group.id, 'Nome Atualizado')}>
            Atualizar Nome
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Hook useZApiCommunities

```typescript
import { useZApiCommunities } from '@/hooks/use-z-api-communities'

function CommunityManager() {
  const {
    communities,
    isLoading,
    error,
    searchCommunities,
    createCommunity,
    sendCommunityAnnouncement,
    addGroupToCommunity
  } = useZApiCommunities()

  // Buscar comunidades
  const handleSearch = async () => {
    const results = await searchCommunities({
      name: 'Minha Comunidade',
      limit: 20
    })
    console.log('Comunidades encontradas:', results)
  }

  // Criar comunidade
  const handleCreateCommunity = async () => {
    const community = await createCommunity({
      name: 'Nova Comunidade',
      description: 'Descrição da comunidade'
    })
    
    if (community) {
      console.log('Comunidade criada:', community)
    }
  }

  // Enviar anúncio
  const handleSendAnnouncement = async (communityId: string) => {
    const success = await sendCommunityAnnouncement(communityId, {
      content: 'Anúncio importante para todos!',
      type: 'text'
    })
    
    if (success) {
      console.log('Anúncio enviado com sucesso!')
    }
  }

  return (
    <div>
      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      
      <button onClick={handleSearch}>Buscar Comunidades</button>
      <button onClick={handleCreateCommunity}>Criar Comunidade</button>
      
      {communities.map(community => (
        <div key={community.id}>
          <h3>{community.name}</h3>
          <p>{community.description}</p>
          <button onClick={() => handleSendAnnouncement(community.id)}>
            Enviar Anúncio
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Tipos TypeScript

### ZApiGroup
```typescript
interface ZApiGroup {
  id: string
  name: string
  description?: string
  imageUrl?: string
  inviteLink?: string
  inviteLinkExpiresAt?: string
  maxParticipants: number
  isCommunityGroup: boolean
  communityId?: string
  settings: ZApiGroupSettings
  participants: ZApiGroupParticipant[]
  admins: ZApiGroupParticipant[]
  createdAt: string
  updatedAt: string
}
```

### ZApiGroupParticipant
```typescript
interface ZApiGroupParticipant {
  id: string
  phone: string
  name?: string
  isAdmin: boolean
  isCreator: boolean
  joinedAt: string
  leftAt?: string
  status: 'active' | 'pending' | 'banned'
}
```

### ZApiGroupMessage
```typescript
interface ZApiGroupMessage {
  id: string
  groupId: string
  senderPhone: string
  content: string
  messageType: 'text' | 'image' | 'document' | 'audio' | 'poll'
  whatsappMessageId?: string
  replyToMessageId?: string
  isAnnouncement: boolean
  isDeleted: boolean
  deletedBy?: string
  deletedAt?: string
  createdAt: string
}
```

### ZApiCommunity
```typescript
interface ZApiCommunity {
  id: string
  name: string
  description?: string
  imageUrl?: string
  whatsappCommunityId?: string
  announcementGroupId?: string
  maxGroups: number
  settings: ZApiCommunitySettings
  groups: ZApiCommunityGroup[]
  members: ZApiCommunityMember[]
  createdAt: string
  updatedAt: string
}
```

### ZApiCommunityMember
```typescript
interface ZApiCommunityMember {
  id: string
  communityId: string
  phone: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  invitedBy?: string
  isActive: boolean
}
```

### ZApiCommunityAnnouncement
```typescript
interface ZApiCommunityAnnouncement {
  id: string
  communityId: string
  sentBy: string
  content: string
  type: 'text' | 'image' | 'document'
  sentAt: string
  recipientsCount: number
  status: 'pending' | 'sent' | 'failed'
}
```

## Tratamento de Erros

Todos os métodos retornam um objeto `ZApiResponse` com:

```typescript
interface ZApiResponse {
  success: boolean
  message?: string
  data?: Record<string, unknown>
  error?: string
}
```

### Exemplo de Tratamento de Erro

```typescript
const response = await client.updateGroupName('groupId', 'Novo Nome')

if (!response.success) {
  console.error('Erro:', response.error)
  // Tratar erro
} else {
  console.log('Sucesso:', response.message)
  // Processar sucesso
}
```

## Configuração

### Variáveis de Ambiente

```env
Z_API_URL=https://api.z-api.io
```

### Instância Z-API

O cliente requer uma instância Z-API ativa configurada no banco de dados:

```typescript
// Configurar instância
const instance = {
  instance_id: 'sua-instance-id',
  instance_token: 'seu-instance-token',
  client_token: 'seu-client-token',
  name: 'Minha Instância',
  is_active: true
}
```

## Requisitos Atendidos

### RF001: Gerenciamento Básico de Grupos
- ✅ RF001.1 - Busca de Grupos
- ✅ RF001.2 - Atualização Granular de Grupos

### RF002: Gerenciamento de Participantes
- ✅ RF002.1 - Adicionar Participantes
- ✅ RF002.2 - Remover Participantes

### RF003: Sistema de Administração
- ✅ RF003.1 - Promover Administradores
- ✅ RF003.2 - Remover Administradores

### RF007: Sistema de Links de Convite
- ✅ RF007.1 - Gerar Links de Convite
- ✅ RF007.2 - Aceitar Convites

### RF008: Sistema de Comunidades
- ✅ RF008.1 - Criar Comunidades
- ✅ RF008.2 - Grupo de Avisos
- ✅ RF008.3 - Gerenciamento de Comunidades
- ✅ RF008.4 - Vinculação de Grupos

## Integração com Sistema Existente

O cliente Z-API se integra perfeitamente com:

- **Hooks existentes** - useGroupParticipants, useGroupAdmins, etc.
- **Componentes React** - GroupForm, ParticipantManager, etc.
- **APIs do sistema** - Endpoints de grupos e comunidades
- **Banco de dados** - Sincronização com Supabase

## Próximos Passos

1. **Testes** - Implementar testes unitários e de integração
2. **Sincronização** - Implementar sincronização bidirecional
3. **Comunidades** - Estender para suporte a comunidades
4. **Monitoramento** - Adicionar logs e métricas
5. **Cache** - Implementar cache para melhor performance
