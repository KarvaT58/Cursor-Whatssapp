# WhatsApp Professional SaaS

Um SaaS completo para gerenciamento profissional de WhatsApp com funcionalidades avançadas de comunicação, campanhas em massa e gerenciamento de equipes.

## 🚀 Funcionalidades

- **Dashboard em tempo real** com métricas e estatísticas
- **Chat do WhatsApp em tempo real** integrado com Z-API
- **Sistema de grupos** do WhatsApp
- **Sistema de contatos** integrado ao Supabase
- **Campanhas e disparo em massa** com filas Redis/BullMQ
- **Chat interno** entre membros da equipe
- **Sistema de equipe** com chat em tempo real
- **Configurações Z-API** via frontend (múltiplas instâncias)
- **Autenticação** via e-mail/senha (Supabase Auth)

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), TypeScript, shadcn/ui
- **Backend**: NestJS (serverless no Vercel)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Tempo Real**: Supabase Realtime + Redis (BullMQ)
- **Integração**: Z-API para WhatsApp
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta no Z-API
- Conta no Vercel

## 🚀 Configuração

1. **Clone o repositório**

```bash
git clone <repository-url>
cd whatsapp-professional
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
Z_API_URL=https://api.z-api.io
```

4. **Configure o banco de dados**
   Execute o SQL do arquivo `supabase-migration.sql` no seu projeto Supabase.

5. **Execute o projeto**

```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── dashboard/         # Dashboard principal
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   └── forms/            # Formulários
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   └── z-api/            # Integração Z-API
├── providers/            # Context providers
└── types/                # Definições TypeScript
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier

## 🚀 Deploy no Vercel

1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente** no painel do Vercel
3. **Deploy automático** será executado a cada push

## 📊 Sistema de Múltiplas Instâncias Z-API

O sistema permite configurar múltiplas instâncias do Z-API através da interface web:

- **ID da Instância**: Identificador único da instância
- **Token da Instância**: Token de autenticação da instância
- **Token do Cliente**: Token do cliente Z-API
- **Nome**: Nome personalizado para a instância
- **Status**: Ativo/Inativo

## 🔐 Autenticação e Segurança

- **Row Level Security (RLS)** configurado no Supabase
- **Middleware de autenticação** para rotas protegidas
- **Validação de dados** com TypeScript
- **Tratamento de erros** robusto

## 📈 Monitoramento

- **Vercel Analytics** para performance
- **Supabase Dashboard** para banco de dados
- **Logs estruturados** para debugging

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:

- Email: suporte@whatsapp-professional.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/whatsapp-professional/issues)
