# E2E Tests Documentation

Este diretório contém os testes end-to-end (E2E) para o WhatsApp Professional SaaS, implementados com Playwright.

## Estrutura dos Testes

```
tests/e2e/
├── fixtures/           # Fixtures e configurações de teste
│   └── auth.fixture.ts # Fixture de autenticação
├── pages/             # Page Object Models (futuro)
├── utils/             # Utilitários e helpers
│   ├── auth-helper.ts # Helper para autenticação
│   ├── page-helpers.ts # Helpers gerais para páginas
│   └── test-data.ts   # Dados de teste
├── auth.spec.ts       # Testes de autenticação
├── whatsapp-chat.spec.ts # Testes do chat WhatsApp
├── campaigns.spec.ts  # Testes de campanhas
├── team-management.spec.ts # Testes de gerenciamento de equipe
├── full-flow.spec.ts  # Testes de fluxo completo
├── test-setup.ts      # Configuração global dos testes
└── README.md          # Esta documentação
```

## Como Executar os Testes

### Pré-requisitos

1. **Servidor de desenvolvimento rodando**: Execute `npm run dev` em um terminal separado
2. **Banco de dados configurado**: Certifique-se de que o Supabase está configurado
3. **Dados de teste**: Os testes usam dados mockados, mas podem precisar de dados reais no banco

### Comandos Disponíveis

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar com interface gráfica
npm run test:e2e:ui

# Executar em modo headed (com browser visível)
npm run test:e2e:headed

# Executar em modo debug
npm run test:e2e:debug

# Visualizar relatório de testes
npm run test:e2e:report

# Executar todos os tipos de teste (unit + integration + e2e)
npm run test:all
```

### Executar Testes Específicos

```bash
# Executar apenas testes de autenticação
npx playwright test auth.spec.ts

# Executar apenas testes de chat WhatsApp
npx playwright test whatsapp-chat.spec.ts

# Executar com filtro de nome
npx playwright test --grep "should login successfully"
```

## Configuração

### Variáveis de Ambiente

Os testes usam as seguintes variáveis de ambiente:

- `PLAYWRIGHT_BASE_URL`: URL base da aplicação (padrão: http://localhost:3000)
- `CI`: Indica se está rodando em CI/CD (afeta retries e workers)

### Configuração do Playwright

O arquivo `playwright.config.ts` na raiz do projeto contém:

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Reporter**: HTML, JSON, JUnit
- **Screenshots**: Apenas em falhas
- **Videos**: Apenas em falhas
- **Trace**: Apenas em retry
- **Web Server**: Inicia automaticamente o servidor de desenvolvimento

## Estrutura dos Testes

### Fixtures

#### Auth Fixture

- `authHelper`: Helper para operações de autenticação
- `pageHelpers`: Helpers gerais para interação com páginas
- `authenticatedPage`: Página já autenticada para testes

### Helpers

#### AuthHelper

```typescript
await authHelper.login('user') // Login como usuário
await authHelper.logout() // Logout
await authHelper.isAuthenticated() // Verificar se está autenticado
```

#### PageHelpers

```typescript
await pageHelpers.waitForPageLoad() // Aguardar carregamento
await pageHelpers.fillField(selector, value) // Preencher campo
await pageHelpers.clickAndWait(selector) // Clicar e aguardar
await pageHelpers.waitForToast() // Aguardar notificação
```

### Dados de Teste

O arquivo `test-data.ts` contém:

- Usuários de teste (admin, user)
- Contatos de exemplo
- Grupos de exemplo
- Campanhas de exemplo
- Mensagens de equipe de exemplo
- Configurações Z-API de teste

## Cenários de Teste

### 1. Autenticação (`auth.spec.ts`)

- ✅ Exibição da página de login
- ✅ Validação de credenciais
- ✅ Login bem-sucedido
- ✅ Logout
- ✅ Redirecionamento para rotas protegidas
- ✅ Manutenção de sessão
- ✅ Validação de formulário

### 2. Chat WhatsApp (`whatsapp-chat.spec.ts`)

- ✅ Interface do chat
- ✅ Lista de contatos
- ✅ Seleção de contato
- ✅ Envio de mensagens
- ✅ Indicadores de status
- ✅ Indicador de digitação
- ✅ Histórico de mensagens
- ✅ Busca de mensagens
- ✅ Busca de contatos
- ✅ Informações do contato
- ✅ Timestamps
- ✅ Reações (se implementado)
- ✅ Mensagens de mídia (se implementado)
- ✅ Status online
- ✅ Tratamento de erros

### 3. Campanhas (`campaigns.spec.ts`)

- ✅ Interface de campanhas
- ✅ Criação de campanha
- ✅ Lista de campanhas
- ✅ Edição de campanha
- ✅ Agendamento de campanha
- ✅ Execução de campanha
- ✅ Estatísticas de campanha
- ✅ Progresso de campanha
- ✅ Exclusão de campanha
- ✅ Filtros por status
- ✅ Busca de campanhas
- ✅ Validação de formulário
- ✅ Tratamento de erros
- ✅ Templates de campanha
- ✅ Rate limiting

### 4. Gerenciamento de Equipe (`team-management.spec.ts`)

- ✅ Interface de equipe
- ✅ Chat da equipe
- ✅ Envio de mensagens da equipe
- ✅ Lista de membros
- ✅ Status online
- ✅ Histórico de mensagens
- ✅ Timestamps
- ✅ Indicadores de digitação
- ✅ Busca de mensagens
- ✅ Log de atividades
- ✅ Permissões de equipe
- ✅ Adição de membros (admin)
- ✅ Remoção de membros (admin)
- ✅ Atualização de roles (admin)
- ✅ Notificações
- ✅ Estatísticas da equipe
- ✅ Tratamento de erros
- ✅ Canais da equipe
- ✅ Atualizações em tempo real
- ✅ Validação de entrada
- ✅ Indicadores de presença

### 5. Fluxo Completo (`full-flow.spec.ts`)

- ✅ Jornada completa do usuário
- ✅ Múltiplas sessões de usuário
- ✅ Interrupções de rede
- ✅ Persistência de estado
- ✅ Operações concorrentes

## Boas Práticas

### 1. Seletores de Teste

Use `data-testid` para seletores estáveis:

```html
<button data-testid="send-button">Enviar</button>
```

### 2. Aguardar Elementos

Sempre aguarde elementos estarem visíveis antes de interagir:

```typescript
await expect(page.locator('[data-testid="element"]')).toBeVisible()
```

### 3. Dados de Teste

Use dados consistentes e isolados:

```typescript
const testUser = { email: 'test@example.com', password: 'Test123!' }
```

### 4. Limpeza

Limpe dados após cada teste:

```typescript
test.afterEach(async ({ page }) => {
  await page.context().clearCookies()
})
```

### 5. Screenshots

Screenshots são tirados automaticamente em falhas e salvos em `test-results/screenshots/`

## Troubleshooting

### Problemas Comuns

1. **Timeout**: Aumente o timeout se necessário
2. **Elementos não encontrados**: Verifique se os `data-testid` estão corretos
3. **Servidor não iniciado**: Execute `npm run dev` antes dos testes
4. **Dados inconsistentes**: Verifique se os dados de teste estão corretos

### Debug

```bash
# Executar em modo debug
npm run test:e2e:debug

# Executar com browser visível
npm run test:e2e:headed

# Executar teste específico
npx playwright test auth.spec.ts --debug
```

### Logs

Os testes geram logs detalhados e salvam:

- Screenshots em falhas
- Videos em falhas
- Traces para debugging
- Relatórios HTML

## Integração CI/CD

Os testes E2E são configurados para rodar em CI/CD:

- **Retries**: 2 tentativas em CI
- **Workers**: 1 worker em CI para estabilidade
- **Browsers**: Chrome, Firefox, Safari
- **Relatórios**: HTML, JSON, JUnit

### GitHub Actions

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    PLAYWRIGHT_BASE_URL: ${{ steps.deploy.outputs.url }}
```

## Manutenção

### Adicionando Novos Testes

1. Crie um novo arquivo `.spec.ts`
2. Importe as fixtures necessárias
3. Use os helpers disponíveis
4. Adicione dados de teste se necessário
5. Documente o novo teste

### Atualizando Testes

1. Mantenha os seletores estáveis
2. Atualize dados de teste quando necessário
3. Verifique se os cenários ainda são válidos
4. Execute todos os testes após mudanças

### Monitoramento

- Execute testes regularmente
- Monitore falhas intermitentes
- Atualize seletores quando a UI muda
- Mantenha dados de teste atualizados
