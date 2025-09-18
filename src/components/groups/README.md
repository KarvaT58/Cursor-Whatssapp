# Componentes de Interação para Grupos

Este diretório contém os componentes de interação avançada para grupos WhatsApp, implementados conforme os requisitos do sistema de grupos.

## Componentes Implementados

### 1. MentionInput

Componente para inserir menções de usuários e grupos em mensagens.

**Características:**
- Suporte a menções de usuários individuais
- Suporte a menção do grupo inteiro (apenas para administradores)
- Autocompletar com busca por nome ou telefone
- Validação de permissões
- Interface intuitiva com sugestões

**Uso:**
```tsx
import { MentionInput } from '@/components/groups/mention-input'

<MentionInput
  value={message}
  onChange={(value, mentions) => setMessage(value)}
  participants={groupParticipants}
  currentUserIsAdmin={isAdmin}
  allowGroupMention={true}
/>
```

### 2. FileUploader

Componente para upload de arquivos grandes (até 2GB).

**Características:**
- Suporte a arquivos de até 2GB
- Drag & drop
- Compressão automática
- Preview de arquivos
- Validação de tipos e tamanhos
- Progresso de upload em tempo real

**Uso:**
```tsx
import { FileUploader } from '@/components/groups/file-uploader'

<FileUploader
  onFileSelect={(file) => handleFileSelect(file)}
  onUploadComplete={(file, result) => handleUploadComplete(file, result)}
  maxSize={2 * 1024 * 1024 * 1024} // 2GB
  acceptedTypes={['image/*', 'video/*', 'application/pdf']}
  autoCompress={true}
/>
```

### 3. ReactionPicker

Componente para selecionar reações com emojis.

**Características:**
- 20 emojis mais comuns
- Suporte a emojis personalizados
- Interface popover intuitiva
- Indicador de reação atual

**Uso:**
```tsx
import { ReactionPicker } from '@/components/groups/reaction-picker'

<ReactionPicker
  onReactionSelect={(emoji) => handleReaction(emoji)}
  currentReaction={userReaction}
  disabled={isLoading}
/>
```

### 4. PollCreator

Componente para criar enquetes em grupos.

**Características:**
- Até 12 opções
- Múltipla escolha opcional
- Expiração configurável
- Validação robusta
- Interface responsiva

**Uso:**
```tsx
import { PollCreator } from '@/components/groups/poll-creator'

<PollCreator
  groupId={groupId}
  onPollCreated={(poll) => handlePollCreated(poll)}
  onCancel={() => setShowPollCreator(false)}
/>
```

### 5. MessageReactions

Componente para exibir e gerenciar reações em mensagens.

**Características:**
- Exibição de reações com contadores
- Adição/remoção de reações
- Integração com ReactionPicker
- Atualização em tempo real

**Uso:**
```tsx
import { MessageReactions } from '@/components/groups/message-reactions'

<MessageReactions
  groupId={groupId}
  messageId={messageId}
  className="mt-2"
/>
```

## Requisitos Atendidos

### RF004: Sistema de Menções
- ✅ Menção de membros individuais
- ✅ Menção do grupo inteiro (apenas admins)
- ✅ Autocompletar com busca
- ✅ Validação de permissões

### RF005: Sistema de Reações
- ✅ Reações com emojis
- ✅ Múltiplas reações por mensagem
- ✅ Contadores de reações
- ✅ Alteração de reações

### RF006: Sistema de Enquetes
- ✅ Criação de enquetes
- ✅ Validação de opções
- ✅ Configuração de expiração
- ✅ Múltipla escolha opcional

### RF010.2: Arquivos Grandes
- ✅ Suporte a arquivos de até 2GB
- ✅ Sistema de upload com progresso
- ✅ Compressão automática
- ✅ Validação de tipos e tamanhos

## Integração

Todos os componentes estão integrados ao sistema de grupos e podem ser utilizados em conjunto para criar uma experiência de interação rica e completa.

### Dependências

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (ícones)
- Componentes UI (shadcn/ui)

### Hooks Relacionados

- `useMessageReactions` - Para gerenciar reações
- `useGroupPolls` - Para gerenciar enquetes
- `useGroupFiles` - Para gerenciar arquivos

## Testes

Cada componente deve ser testado com:
- Diferentes tamanhos de tela (responsividade)
- Estados de carregamento
- Cenários de erro
- Validações de entrada
- Integração com APIs

## Acessibilidade

Todos os componentes seguem as diretrizes de acessibilidade:
- Navegação por teclado
- Screen readers
- Contraste adequado
- Foco visível
- Labels descritivos
