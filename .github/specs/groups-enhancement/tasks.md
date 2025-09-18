# Tasks: Sistema de Grupos WhatsApp - Implementação Completa

## Fase 1: Endpoints Básicos da Z-API para Grupos

### 1.1 Implementar Busca de Grupos
- [x] Criar endpoint `GET /api/groups/search` 
- [x] Implementar filtros por nome, participantes, descrição
- [x] Adicionar paginação e ordenação
- [x] Integrar com interface de busca no frontend
- [x] _Requisitos: Funcionalidade básica de busca de grupos_

### 1.2 Endpoints Específicos para Atualização
- [x] Criar endpoint `PATCH /api/groups/[id]/name` para atualizar nome
- [x] Criar endpoint `PATCH /api/groups/[id]/description` para atualizar descrição
- [x] Criar endpoint `PATCH /api/groups/[id]/image` para atualizar imagem
- [x] Implementar validações específicas para cada endpoint
- [x] _Requisitos: Atualizações granulares de grupos_

### 1.3 Gerenciamento de Participantes via Z-API
- [x] Criar endpoint `POST /api/groups/[id]/participants` para adicionar participantes
- [x] Criar endpoint `DELETE /api/groups/[id]/participants` para remover participantes
- [x] Implementar validação de números de telefone
- [x] Adicionar logs de auditoria para mudanças de participantes
- [x] _Requisitos: Gerenciamento avançado de participantes_

## Fase 2: Sistema de Administração de Grupos

### 2.1 Gerenciamento de Administradores
- [x] Criar endpoint `POST /api/groups/[id]/admins` para promover admin
- [x] Criar endpoint `DELETE /api/groups/[id]/admins` para remover admin
- [x] Implementar sistema de permissões baseado em roles
- [x] Criar interface para gerenciar administradores
- [x] _Requisitos: Controle de administração de grupos_

### 2.2 Sistema de Aprovação de Participantes
- [x] Criar endpoint `POST /api/groups/[id]/approve` para aprovar participantes
- [x] Criar endpoint `POST /api/groups/[id]/reject` para rejeitar participantes
- [x] Implementar fila de participantes pendentes
- [x] Criar interface para gerenciar aprovações
- [x] _Requisitos: Controle de entrada em grupos_

### 2.3 Funcionalidade de Sair do Grupo
- [x] Criar endpoint `POST /api/groups/[id]/leave` para sair do grupo
- [x] Implementar validação de permissões
- [x] Adicionar notificação para outros membros
- [x] _Requisitos: Funcionalidade básica de saída_

## Fase 3: Sistema de Menções e Interações

### 3.1 Sistema de Menções
- [x] Implementar funcionalidade de menção de membros (@membro)
- [x] Implementar funcionalidade de menção de grupo (@grupo)
- [x] Criar autocomplete para menções
- [x] Adicionar notificações para membros mencionados
- [x] _Requisitos: Sistema de menções avançado_

### 3.2 Sistema de Reações
- [x] Implementar reações com emojis para mensagens
- [x] Criar endpoint `POST /api/messages/[id]/reactions`
- [x] Implementar contadores de reações
- [x] Criar interface para visualizar reações
- [x] _Requisitos: Sistema de reações do WhatsApp_

### 3.3 Sistema de Enquetes
- [x] Implementar criação de enquetes em grupos
- [x] Criar endpoint `POST /api/groups/[id]/polls`
- [x] Implementar sistema de votação
- [x] Criar interface para visualizar resultados
- [x] _Requisitos: Sistema de enquetes do WhatsApp_

## Fase 4: Sistema de Links de Convite

### 4.1 Gerenciamento de Links de Convite
- [x] Criar endpoint `GET /api/groups/[id]/invite-link` para obter link
- [x] Criar endpoint `POST /api/groups/[id]/invite-link` para criar link
- [x] Criar endpoint `DELETE /api/groups/[id]/invite-link` para revogar link
- [x] Implementar expiração de links de convite
- [x] Implementar limite de usos por link
- [x] Criar interface para gerenciar links
- [x] _Requisitos: Sistema de convites para grupos_

### 4.2 Aceitar Convites
- [x] Criar endpoint `POST /api/groups/join` para aceitar convite
- [x] Implementar validação de links de convite
- [x] Implementar verificação de expiração e limite de usos
- [x] Adicionar notificação de novo membro
- [x] _Requisitos: Funcionalidade de aceitar convites_

## Fase 5: Sistema de Comunidades WhatsApp

### 5.1 Estrutura de Comunidades
- [x] Criar tabela `whatsapp_communities` no Supabase
- [x] Implementar relacionamento entre comunidades e grupos
- [x] Criar tipos TypeScript para comunidades
- [x] Configurar RLS para comunidades
- [x] _Requisitos: Base para sistema de comunidades_

### 5.2 Gerenciamento de Comunidades
- [x] Criar endpoint `POST /api/communities` para criar comunidade
- [x] Criar endpoint `GET /api/communities` para listar comunidades
- [x] Criar endpoint `PUT /api/communities/[id]` para atualizar comunidade
- [x] Criar endpoint `DELETE /api/communities/[id]` para desativar comunidade
- [x] _Requisitos: CRUD básico de comunidades_

### 5.3 Grupo de Avisos
- [x] Implementar criação automática de grupo de avisos
- [x] Criar endpoint para envio de mensagens para toda a comunidade
- [x] Implementar sistema de permissões para grupo de avisos
- [x] Criar interface para gerenciar grupo de avisos
- [x] _Requisitos: Sistema de anúncios da comunidade_

### 5.4 Vinculação de Grupos
- [x] Criar endpoint `POST /api/communities/[id]/groups` para vincular grupo
- [x] Criar endpoint `DELETE /api/communities/[id]/groups` para desvincular grupo
- [x] Implementar validação de permissões
- [x] Criar interface para gerenciar grupos da comunidade
- [x] _Requisitos: Gerenciamento de grupos em comunidades_

## Fase 6: Funcionalidades Avançadas

### 6.1 Sistema de Moderação
- [x] Implementar funcionalidade para administradores apagarem mensagens
- [x] Criar endpoint `DELETE /api/groups/[id]/messages/[messageId]` para apagar mensagem
- [x] Implementar sistema de denúncias
- [x] Criar interface de moderação
- [x] _Requisitos: Sistema de moderação de conteúdo_

### 6.2 Chamadas de Áudio em Grupo
- [x] Implementar suporte a chamadas de áudio (até 32 participantes)
- [x] Criar endpoint `POST /api/groups/[id]/audio-call`
- [x] Implementar sistema de convites para chamadas
- [x] Criar interface para gerenciar chamadas
- [x] _Requisitos: Sistema de chamadas de áudio_

### 6.3 Compartilhamento de Arquivos Grandes
- [x] Implementar suporte a arquivos de até 2GB
- [x] Criar sistema de upload com progress
- [x] Implementar compressão de arquivos
- [x] Criar interface para gerenciar arquivos
- [x] _Requisitos: Sistema de arquivos grandes_

## Fase 7: Interface de Usuário

### 7.1 Componentes de Comunidades
- [x] Criar componente `CommunityForm` para criar/editar comunidades
- [x] Criar componente `CommunityList` para listar comunidades
- [x] Criar componente `CommunityCard` para exibir comunidade
- [x] Criar componente `CommunityGroups` para gerenciar grupos
- [x] _Requisitos: Interface para comunidades_

### 7.2 Componentes de Moderação
- [x] Criar componente `ModerationPanel` para administradores
- [x] Criar componente `MessageActions` para ações em mensagens
- [x] Criar componente `ParticipantManager` avançado
- [x] Criar componente `AdminSettings` para configurações
- [x] _Requisitos: Interface de moderação_

### 7.3 Componentes de Interação
- [ ] Criar componente `MentionInput` para menções
- [ ] Criar componente `ReactionPicker` para reações
- [ ] Criar componente `PollCreator` para enquetes
- [ ] Criar componente `FileUploader` para arquivos grandes
- [ ] _Requisitos: Interface de interações avançadas_

## Fase 8: Integração com Z-API

### 8.1 Cliente Z-API para Grupos
- [ ] Implementar métodos para buscar grupos via Z-API
- [ ] Implementar métodos para atualizar nome/descrição via Z-API
- [ ] Implementar métodos para gerenciar participantes via Z-API
- [ ] Implementar métodos para gerenciar administradores via Z-API
- [ ] _Requisitos: Integração completa com Z-API_

### 8.2 Cliente Z-API para Comunidades
- [ ] Implementar métodos para criar comunidades via Z-API
- [ ] Implementar métodos para gerenciar comunidades via Z-API
- [ ] Implementar métodos para grupo de avisos via Z-API
- [ ] Implementar métodos para vincular grupos via Z-API
- [ ] _Requisitos: Integração com comunidades via Z-API_

### 8.3 Sincronização Avançada
- [ ] Implementar sincronização bidirecional de grupos
- [ ] Implementar sincronização de comunidades
- [ ] Implementar sincronização de participantes
- [ ] Implementar sincronização de administradores
- [ ] _Requisitos: Sincronização completa com WhatsApp_

## Fase 9: Testes e Documentação

### 9.1 Testes Unitários
- [ ] Criar testes para endpoints de grupos
- [ ] Criar testes para endpoints de comunidades
- [ ] Criar testes para funcionalidades de moderação
- [ ] Criar testes para sistema de menções
- [ ] _Requisitos: Cobertura de testes completa_

### 9.2 Testes de Integração
- [ ] Criar testes de integração com Z-API
- [ ] Criar testes de sincronização
- [ ] Criar testes de realtime
- [ ] Criar testes de performance
- [ ] _Requisitos: Testes de integração robustos_

### 9.3 Documentação
- [ ] Documentar todos os endpoints de grupos
- [ ] Documentar endpoints de comunidades
- [ ] Criar guias de uso para administradores
- [ ] Criar documentação da API
- [ ] _Requisitos: Documentação completa_

## Fase 10: Otimização e Performance

### 10.1 Otimização de Queries
- [ ] Otimizar queries de grupos com muitos participantes
- [ ] Implementar cache para metadados de grupos
- [ ] Otimizar sincronização em lote
- [ ] Implementar paginação eficiente
- [ ] _Requisitos: Performance otimizada_

### 10.2 Monitoramento
- [ ] Implementar logs de auditoria para grupos
- [ ] Implementar métricas de uso de grupos
- [ ] Implementar alertas para problemas de sincronização
- [ ] Implementar dashboard de monitoramento
- [ ] _Requisitos: Monitoramento completo_

## Prioridades de Implementação

### 🔴 Prioridade Crítica (Fase 1-2)
- Endpoints básicos da Z-API
- Sistema de administração de grupos
- Gerenciamento de participantes

### 🟡 Prioridade Alta (Fase 3-4)
- Sistema de menções
- Links de convite
- Sistema de reações

### 🟢 Prioridade Média (Fase 5-6)
- Sistema de comunidades
- Funcionalidades avançadas
- Sistema de moderação

### 🔵 Prioridade Baixa (Fase 7-10)
- Interface de usuário
- Testes e documentação
- Otimização e performance

## Estimativa de Tempo

- **Fase 1-2**: 2-3 semanas
- **Fase 3-4**: 2-3 semanas  
- **Fase 5-6**: 3-4 semanas
- **Fase 7-8**: 2-3 semanas
- **Fase 9-10**: 1-2 semanas

**Total estimado: 10-15 semanas**

## Notas Importantes

1. **Dependências**: Algumas funcionalidades dependem de outras (ex: comunidades dependem de grupos)
2. **Z-API**: Verificar disponibilidade de endpoints na Z-API antes de implementar
3. **WhatsApp**: Algumas funcionalidades podem ter limitações do próprio WhatsApp
4. **Testes**: Implementar testes em paralelo com o desenvolvimento
5. **Documentação**: Manter documentação atualizada durante o desenvolvimento
