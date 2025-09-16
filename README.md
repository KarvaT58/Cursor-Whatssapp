# 📱 WhatsApp Professional SaaS

Uma plataforma SaaS completa para gerenciamento profissional de WhatsApp, oferecendo recursos avançados para campanhas em massa, gerenciamento de equipes e automação de mensagens.

## 🚀 Funcionalidades

### 📢 Campanhas em Massa

- Criação e gerenciamento de campanhas
- Agendamento de envios
- Templates de mensagem personalizáveis
- Rate limiting inteligente
- Relatórios detalhados de performance

### 👥 Gerenciamento de Contatos

- Importação em lote (CSV/Excel)
- Organização por tags e grupos
- Histórico de conversas
- Sincronização com grupos WhatsApp

### 💬 Chat WhatsApp

- Interface de chat em tempo real
- Envio de mídia e documentos
- Status de mensagens (enviada, entregue, lida)
- Integração com Z-API

### 👥 Gerenciamento de Equipes

- Criação e gerenciamento de equipes
- Sistema de permissões
- Chat interno
- Logs de atividades

### 📊 Monitoramento e Analytics

- Dashboard de métricas em tempo real
- Health checks de serviços
- Logs estruturados
- Alertas automáticos

## 🛠️ Tecnologias

### Frontend

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de UI
- **Lucide React** - Ícones

### Backend

- **Next.js API Routes** - API RESTful
- **Supabase** - Database e autenticação
- **Redis** - Cache e filas
- **BullMQ** - Processamento de jobs
- **Z-API** - Integração WhatsApp

### Monitoramento

- **Sentry** - Error tracking
- **Winston** - Logging estruturado
- **Health Checks** - Monitoramento de serviços
- **Métricas** - Performance e business metrics

### Testes

- **Vitest** - Testes unitários
- **Playwright** - Testes E2E
- **Testing Library** - Testes de componentes

## 🚀 Deploy

### Pré-requisitos

- Node.js 18+
- Conta no Vercel
- Projeto Supabase
- Instância Redis
- Conta Z-API

### Deploy no Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Configurar projeto
vercel link

# Configurar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add REDIS_URL
vercel env add Z_API_URL
vercel env add Z_API_TOKEN
vercel env add NEXT_PUBLIC_SENTRY_DSN

# Deploy
vercel --prod
```

### Variáveis de Ambiente

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Z-API
Z_API_URL=your_z_api_url
Z_API_TOKEN=your_z_api_token

# Redis
REDIS_URL=your_redis_url

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# App
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
```

## 📚 Documentação

### Guias de Usuário

- [Guia do Usuário](docs/USER_GUIDE.md) - Manual completo para usuários
- [Documentação da API](docs/API_DOCUMENTATION.md) - Referência da API
- [Guia de Deploy](docs/DEPLOYMENT_GUIDE.md) - Instruções de deploy

### Monitoramento

- [Sistema de Monitoramento](src/lib/monitoring/README.md) - Documentação técnica

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Todos os testes
npm run test:all
```

### Cobertura de Testes

- **335 testes E2E** com Playwright
- **Testes unitários** para componentes
- **Testes de integração** para APIs
- **Testes de performance** e monitoramento

## 🔧 Desenvolvimento

### Instalação

```bash
# Clonar repositório
git clone https://github.com/your-org/whatsapp-professional.git

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
npm run test         # Testes unitários
npm run test:e2e     # Testes E2E
```

## 📊 Monitoramento

### Health Checks

- **URL**: `/api/health`
- **Serviços monitorados**: Database, Redis, Z-API, External services
- **Métricas**: Response time, uptime, status

### Métricas

- **URL**: `/api/metrics`
- **Tipos**: Performance, Business, User, Campaign
- **Dashboard**: `/dashboard/monitoring`

### Logs

- **URL**: `/api/logs`
- **Tipos**: Audit, Error, Performance
- **Filtros**: Por usuário, equipe, período

## 🔄 Backup e Recovery

### Backup Automático

```bash
# Executar backup
./scripts/backup.sh

# Backup inclui:
# - Database (PostgreSQL)
# - Arquivos estáticos
# - Supabase Storage
# - Redis data
# - Configurações
```

### Restore

```bash
# Restaurar backup
./scripts/restore.sh backup_file.tar.gz

# Restore inclui:
# - Database restoration
# - File restoration
# - Storage restoration
# - Redis restoration
```

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── dashboard/      # Páginas do dashboard
│   └── login/          # Páginas de autenticação
├── components/         # Componentes React
│   ├── ui/            # Componentes base
│   ├── campaigns/     # Componentes de campanhas
│   ├── contacts/      # Componentes de contatos
│   ├── teams/         # Componentes de equipes
│   └── monitoring/    # Componentes de monitoramento
├── hooks/             # Custom hooks
├── lib/               # Utilitários e configurações
│   ├── logging/       # Sistema de logging
│   ├── metrics/       # Sistema de métricas
│   ├── monitoring/    # Sistema de monitoramento
│   └── supabase/      # Configuração Supabase
├── providers/         # Context providers
├── types/             # Definições TypeScript
└── test/              # Testes
```

### Fluxo de Dados

```
Frontend (Next.js) → API Routes → Supabase → Redis → Z-API → WhatsApp
```

## 🔒 Segurança

### Autenticação

- **Supabase Auth** - Autenticação segura
- **JWT Tokens** - Tokens de acesso
- **Row Level Security** - Segurança a nível de linha

### Autorização

- **Sistema de permissões** por equipe
- **Roles**: Admin, Manager, User
- **Audit logs** para todas as ações

### Proteção

- **Rate limiting** em APIs
- **CORS** configurado
- **HTTPS** obrigatório
- **Input validation** com Zod

## 📈 Performance

### Otimizações

- **Next.js Image** - Otimização de imagens
- **Redis Cache** - Cache de dados
- **CDN** - Entrega de conteúdo
- **Lazy Loading** - Carregamento sob demanda

### Métricas

- **Web Vitals** - CLS, FID, FCP, LCP, TTFB
- **API Response Time** - Tempo de resposta
- **Database Queries** - Performance de queries
- **Real-time Updates** - Latência de atualizações

## 🆘 Suporte

### Contato

- **Email**: suporte@whatsapp-professional.com
- **Documentação**: https://docs.whatsapp-professional.com
- **GitHub Issues**: https://github.com/your-org/whatsapp-professional/issues

### Recursos

- **FAQ**: Perguntas frequentes
- **Tutoriais**: Guias passo a passo
- **API Docs**: Documentação da API
- **Community**: Fórum da comunidade

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas

- [x] Sistema de autenticação
- [x] Gerenciamento de contatos
- [x] Campanhas em massa
- [x] Chat WhatsApp
- [x] Gerenciamento de equipes
- [x] Sistema de monitoramento
- [x] Logs estruturados
- [x] Testes E2E
- [x] Deploy automatizado
- [x] Backup e recovery

### 🚀 Próximas Funcionalidades

- [ ] Integração com mais provedores WhatsApp
- [ ] Analytics avançados
- [ ] Automação de workflows
- [ ] API webhooks
- [ ] Aplicativo mobile

---

**Desenvolvido com ❤️ para profissionais que precisam de uma solução robusta de WhatsApp Business**
