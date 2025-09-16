# Implementation Plan

## Fase 1: Configuração Inicial e Autenticação

- [ ] 1. Configurar projeto Next.js com App Router e TypeScript
  - Inicializar projeto Next.js 14 com TypeScript
  - Configurar App Router e estrutura de pastas
  - Instalar e configurar shadcn/ui
  - Configurar ESLint, Prettier e Husky
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Configurar Supabase e autenticação
  - Criar projeto no Supabase
  - Configurar Supabase Auth (email/password)
  - Criar tabela users no Supabase
  - Implementar cliente Supabase no frontend
  - Configurar middleware de autenticação
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

- [ ] 3. Implementar tela de login com shadcn/ui
  - Adicionar componente login-02 do shadcn/ui
  - Customizar formulário de login
  - Implementar validação de formulário
  - Conectar com Supabase Auth
  - Implementar redirecionamento após login
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Configurar deploy no Vercel
  - Conectar repositório GitHub ao Vercel
  - Configurar variáveis de ambiente
  - Configurar domínio personalizado
  - Testar deploy automático
  - _Requirements: Regras fixas - deploy no Vercel_

## Fase 2: Dashboard e Navegação

- [ ] 5. Implementar dashboard principal
  - Adicionar componente dashboard-01 do shadcn/ui
  - Customizar layout do dashboard
  - Implementar sidebar com navegação personalizada
  - Criar componentes de métricas básicas
  - Implementar responsividade
  - _Requirements: 2.1, 2.3_

- [ ] 6. Configurar Supabase Realtime
  - Configurar Supabase Realtime no projeto
  - Implementar hooks para tempo real
  - Criar provider de contexto para Realtime
  - Testar conexão em tempo real
  - _Requirements: 2.2, 10.1, 10.2, 10.3_

- [ ] 7. Implementar sistema de roteamento protegido
  - Criar middleware de autenticação
  - Implementar redirecionamento para rotas protegidas
  - Configurar layout de dashboard
  - Implementar logout funcional
  - _Requirements: 1.4, 1.5_

## Fase 3: Sistema de Contatos

- [ ] 8. Criar estrutura de banco para contatos
  - Criar tabela contacts no Supabase
  - Implementar RLS (Row Level Security)
  - Criar tipos TypeScript para contatos
  - Configurar índices para performance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Implementar interface de contatos
  - Criar componente ContactList
  - Implementar ContactForm para adicionar/editar
  - Criar ContactCard para exibição
  - Implementar busca e filtros
  - Adicionar funcionalidade de importação
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Implementar sincronização de contatos
  - Criar API endpoints para CRUD de contatos
  - Implementar validação de dados
  - Configurar Realtime para atualizações
  - Testar operações CRUD
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

## Fase 4: Integração Z-API

- [ ] 11. Configurar integração Z-API
  - Criar cliente Z-API
  - Implementar autenticação com Z-API
  - Criar tipos TypeScript para Z-API
  - Implementar tratamento de erros
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Implementar configurações Z-API
  - Criar tabela z_api_configs no Supabase
  - Implementar interface de configuração
  - Criar formulário de configuração
  - Implementar teste de conexão
  - Adicionar validação de credenciais
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Implementar webhook Z-API
  - Criar endpoint para receber webhooks
  - Implementar processamento de eventos
  - Configurar validação de webhook
  - Implementar logs de webhook
  - _Requirements: 3.3, 3.4, 3.5_

## Fase 5: Chat WhatsApp

- [ ] 14. Criar estrutura para mensagens WhatsApp
  - Criar tabela whatsapp_messages no Supabase
  - Implementar RLS para mensagens
  - Criar tipos TypeScript para mensagens
  - Configurar índices para performance
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 15. Implementar interface de chat WhatsApp
  - Criar componente WhatsAppChat
  - Implementar MessageList com scroll infinito
  - Criar MessageInput com suporte a mídia
  - Implementar ContactSelector
  - Adicionar indicadores de status
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 16. Implementar funcionalidades de chat
  - Implementar envio de mensagens via Z-API
  - Configurar recebimento em tempo real
  - Implementar indicador de digitação
  - Adicionar status de entrega/leitura
  - Implementar histórico de conversas
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## Fase 6: Sistema de Grupos

- [ ] 17. Criar estrutura para grupos WhatsApp
  - Criar tabela whatsapp_groups no Supabase
  - Implementar RLS para grupos
  - Criar tipos TypeScript para grupos
  - Configurar relacionamentos com mensagens
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 18. Implementar interface de grupos
  - Criar componente GroupList
  - Implementar GroupForm para criar/editar
  - Criar GroupCard para exibição
  - Implementar gerenciamento de participantes
  - Adicionar sincronização com WhatsApp
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 19. Implementar chat de grupos
  - Integrar chat com sistema de grupos
  - Implementar envio para grupos via Z-API
  - Configurar recebimento de mensagens de grupo
  - Implementar gerenciamento de participantes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

## Fase 7: Sistema de Campanhas

- [x] 20. Configurar Redis e BullMQ
  - Configurar Redis no Vercel
  - Implementar BullMQ para filas
  - Criar workers para processamento
  - Configurar monitoramento de filas
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 21. Criar estrutura para campanhas
  - Criar tabela campaigns no Supabase
  - Implementar RLS para campanhas
  - Criar tipos TypeScript para campanhas
  - Configurar relacionamentos com contatos
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 22. Implementar interface de campanhas
  - Criar componente CampaignBuilder
  - Implementar CampaignList com filtros
  - Criar CampaignStats para métricas
  - Implementar MessageTemplate
  - Adicionar RecipientSelector
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 23. Implementar processamento de campanhas
  - Criar jobs para envio em massa
  - Implementar agendamento de campanhas
  - Configurar rate limiting
  - Implementar retry logic
  - Adicionar monitoramento de progresso
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

## Fase 8: Chat Interno da Equipe

- [ ] 24. Criar estrutura para equipes
  - Criar tabela teams no Supabase
  - Implementar RLS para equipes
  - Criar tipos TypeScript para equipes
  - Configurar relacionamentos com usuários
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 25. Criar estrutura para mensagens da equipe
  - Criar tabela team_messages no Supabase
  - Implementar RLS para mensagens da equipe
  - Criar tipos TypeScript para mensagens da equipe
  - Configurar Realtime para chat interno
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 26. Implementar interface de chat interno
  - Criar componente TeamChat
  - Implementar TeamMessageList
  - Criar TeamMessageInput
  - Implementar OnlineMembers
  - Adicionar notificações em tempo real
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 27. Implementar gerenciamento de equipes
  - Criar interface para adicionar/remover membros
  - Implementar sistema de permissões
  - Configurar convites para equipe
  - Implementar logs de atividades
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

## Fase 9: Tempo Real e Sincronização

- [ ] 28. Implementar sincronização completa
  - Configurar Realtime para todas as funcionalidades
  - Implementar hooks customizados para tempo real
  - Configurar reconexão automática
  - Implementar indicadores de status de conexão
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 29. Implementar notificações em tempo real
  - Configurar notificações push
  - Implementar badges de notificação
  - Criar sistema de alertas
  - Configurar preferências de notificação
  - _Requirements: 2.2, 3.3, 7.3, 10.1, 10.2_

- [ ] 30. Otimizar performance em tempo real
  - Implementar debouncing para atualizações
  - Configurar paginação para listas grandes
  - Implementar cache inteligente
  - Otimizar queries do Supabase
  - _Requirements: 2.2, 10.1, 10.2, 10.3, 10.4, 10.5_

## Fase 10: Testes e Deploy Final

- [ ] 31. Implementar testes unitários
  - Criar testes para componentes React
  - Implementar testes para hooks customizados
  - Criar testes para utilitários
  - Configurar coverage reports
  - _Requirements: Todos os requisitos_

- [ ] 32. Implementar testes de integração
  - Criar testes para API endpoints
  - Implementar testes para operações de banco
  - Testar integração com Z-API
  - Configurar testes de Realtime
  - _Requirements: Todos os requisitos_

- [ ] 33. Implementar testes E2E
  - Criar testes para fluxos de autenticação
  - Implementar testes para chat WhatsApp
  - Testar campanhas em massa
  - Configurar testes de gerenciamento de equipes
  - _Requirements: Todos os requisitos_

- [ ] 34. Configurar monitoramento e logs
  - Implementar logging estruturado
  - Configurar alertas de erro
  - Implementar métricas de performance
  - Configurar dashboards de monitoramento
  - _Requirements: Todos os requisitos_

- [ ] 35. Deploy final e documentação
  - Executar build final no Vercel
  - Testar todas as funcionalidades em produção
  - Criar documentação de usuário
  - Configurar backup e recovery
  - _Requirements: Regras fixas - build e commit após cada tarefa_
