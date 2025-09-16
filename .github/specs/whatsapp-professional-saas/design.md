# Design Document

## Overview

O WhatsApp Professional SaaS é uma aplicação full-stack construída com Next.js (App Router), NestJS, Supabase e shadcn/ui. A arquitetura é projetada para suportar comunicação em tempo real, processamento de campanhas em massa e gerenciamento de equipes, com deploy exclusivo no Vercel.

### Principais Características

- **Frontend**: Next.js 14 com App Router, shadcn/ui, TypeScript
- **Backend**: NestJS serverless no Vercel
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Tempo Real**: Supabase Realtime + Redis (BullMQ)
- **Integração**: Z-API para WhatsApp
- **Deploy**: Vercel (produção e testes)

## Architecture

### Arquitetura Geral

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   Services      │
│   shadcn/ui     │    │   Serverless    │    │   (Z-API)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Redis         │    │   WhatsApp      │
│   (Auth + DB)   │    │   (BullMQ)      │    │   (via Z-API)   │
│   Realtime      │    │   (Queues)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Fluxo de Dados em Tempo Real

```
User Action → Frontend → NestJS API → Supabase Realtime → All Connected Clients
     ↓
Z-API Integration → WhatsApp → Webhook → NestJS → Supabase → Frontend Update
```

### Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── api/               # API Routes (NestJS integration)
│   └── globals.css        # Estilos globais
├── components/            # Componentes shadcn/ui customizados
│   ├── ui/               # Componentes base do shadcn
│   ├── dashboard/        # Componentes do dashboard
│   ├── chat/             # Componentes de chat
│   └── forms/            # Formulários
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   ├── z-api/            # Integração Z-API
│   └── utils.ts          # Funções utilitárias
├── hooks/                # React hooks customizados
├── types/                # Definições TypeScript
└── middleware.ts         # Middleware de autenticação
```

## Components and Interfaces

### 1. Sistema de Autenticação

```typescript
// Componentes principais
- LoginForm (shadcn/ui login-02)
- AuthProvider (Supabase Auth)
- ProtectedRoute (middleware)
- UserProfile

// Interfaces
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  team_id?: string;
  created_at: string;
  updated_at: string;
}
```

### 2. Dashboard Principal

```typescript
// Componentes principais
- DashboardLayout (shadcn/ui dashboard-01)
- Sidebar (customizada com navegação)
- MetricsCards
- RealtimeStats
- ActivityFeed

// Sidebar Navigation
const sidebarItems = [
  { name: 'Contatos', href: '/dashboard/contacts', icon: Users },
  { name: 'Grupos', href: '/dashboard/groups', icon: MessageSquare },
  { name: 'Campanhas', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Chat WhatsApp', href: '/dashboard/whatsapp', icon: MessageCircle },
  { name: 'Equipe', href: '/dashboard/team', icon: Users2 },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings }
];
```

### 3. Sistema de Chat WhatsApp

```typescript
// Componentes principais
;-WhatsAppChat -
  MessageList -
  MessageInput -
  ContactSelector -
  TypingIndicator -
  MessageStatus

// Interfaces
interface WhatsAppMessage {
  id: string
  contact_id: string
  content: string
  type: 'text' | 'image' | 'document'
  direction: 'inbound' | 'outbound'
  status: 'sent' | 'delivered' | 'read'
  timestamp: string
  whatsapp_message_id: string
}
```

### 4. Sistema de Contatos

```typescript
// Componentes principais
;-ContactList - ContactForm - ContactCard - ContactSearch - ContactImport

// Interfaces
interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  tags: string[]
  notes?: string
  last_interaction: string
  whatsapp_id: string
  user_id: string
  created_at: string
  updated_at: string
}
```

### 5. Sistema de Campanhas

```typescript
// Componentes principais
;-CampaignBuilder -
  CampaignList -
  CampaignStats -
  MessageTemplate -
  RecipientSelector -
  CampaignScheduler

// Interfaces
interface Campaign {
  id: string
  name: string
  message: string
  recipients: string[]
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed'
  scheduled_at?: string
  started_at?: string
  completed_at?: string
  stats: {
    total: number
    sent: number
    delivered: number
    read: number
    failed: number
  }
  user_id: string
  created_at: string
}
```

### 6. Chat Interno da Equipe

```typescript
// Componentes principais
;-TeamChat -
  TeamMessageList -
  TeamMessageInput -
  OnlineMembers -
  TeamChannelSelector

// Interfaces
interface TeamMessage {
  id: string
  team_id: string
  user_id: string
  content: string
  channel?: string
  created_at: string
  user: {
    name: string
    avatar?: string
  }
}
```

## Data Models

### Supabase Schema

```sql
-- Tabela de usuários (extensão do Supabase Auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de equipes
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  last_interaction TIMESTAMP WITH TIME ZONE,
  whatsapp_id TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de grupos WhatsApp
CREATE TABLE whatsapp_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp_id TEXT UNIQUE NOT NULL,
  description TEXT,
  participants TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens WhatsApp
CREATE TABLE whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id),
  group_id UUID REFERENCES whatsapp_groups(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'document', 'audio')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de campanhas
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  recipients UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  stats JSONB DEFAULT '{"total": 0, "sent": 0, "delivered": 0, "read": 0, "failed": 0}',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens da equipe
CREATE TABLE team_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  channel TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações Z-API
CREATE TABLE z_api_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  api_key TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Redis/BullMQ Queues

```typescript
// Estrutura das filas
interface QueueConfig {
  'campaign-send': {
    campaignId: string
    recipients: string[]
    message: string
    delay?: number
  }
  'whatsapp-webhook': {
    event: string
    data: any
    timestamp: string
  }
  'message-status-update': {
    messageId: string
    status: 'delivered' | 'read' | 'failed'
    timestamp: string
  }
}
```

## Error Handling

### Estratégia de Tratamento de Erros

1. **Frontend**: Error boundaries, toast notifications, fallback UI
2. **Backend**: Global exception filters, structured error responses
3. **Database**: Constraints, triggers, rollback strategies
4. **External APIs**: Retry logic, circuit breakers, fallback mechanisms

### Tipos de Erro

```typescript
interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  userId?: string
}

// Códigos de erro específicos
const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  Z_API_CONNECTION_FAILED: 'Z_API_CONNECTION_FAILED',
  CAMPAIGN_QUOTA_EXCEEDED: 'CAMPAIGN_QUOTA_EXCEEDED',
  WHATSAPP_RATE_LIMIT: 'WHATSAPP_RATE_LIMIT',
  TEAM_PERMISSION_DENIED: 'TEAM_PERMISSION_DENIED',
}
```

## Testing Strategy

### Estratégia de Testes

1. **Unit Tests**: Componentes React, hooks, utilitários
2. **Integration Tests**: API endpoints, database operations
3. **E2E Tests**: Fluxos completos de usuário
4. **Load Tests**: Performance de campanhas em massa

### Ferramentas de Teste

- **Frontend**: Jest, React Testing Library, Playwright
- **Backend**: Jest, Supertest
- **Database**: Testcontainers para PostgreSQL
- **E2E**: Playwright com deploy no Vercel

### Cenários de Teste Críticos

1. Autenticação e autorização
2. Sincronização em tempo real
3. Envio de campanhas em massa
4. Integração com Z-API
5. Gerenciamento de equipes
6. Tratamento de falhas de rede

## Deployment e Infraestrutura

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "Z_API_KEY": "@z-api-key",
    "REDIS_URL": "@redis-url"
  }
}
```

### Monitoramento

- **Vercel Analytics**: Performance e erros
- **Supabase Dashboard**: Database e Realtime
- **Redis Cloud**: Queue monitoring
- **Custom Logs**: Structured logging para debugging

### Backup e Recovery

- **Database**: Supabase automatic backups
- **Redis**: Persistence configurada
- **Files**: Vercel edge storage
- **Code**: GitHub como source of truth
