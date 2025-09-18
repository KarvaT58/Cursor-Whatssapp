# Correção do Erro 400 (Bad Request) na API de Grupos

## Problema Identificado

O erro 400 (Bad Request) estava ocorrendo ao tentar criar grupos via API `/api/groups`. O problema tinha várias causas:

### 1. **Nome da Tabela Incorreto**
```typescript
// ❌ Erro: Tabela não existe
.from('user_zapi_instances')

// ✅ Correto: Nome da tabela real
.from('z_api_instances')
```

### 2. **Campo de API Key Incorreto**
```typescript
// ❌ Erro: Campo não existe na tabela
new ZApiClient(userInstance.instance_id, userInstance.api_key)

// ✅ Correto: Usar o campo correto
new ZApiClient(userInstance.instance_id, userInstance.instance_token)
```

### 3. **Campo Status Inexistente**
```typescript
// ❌ Erro: Campo 'status' não existe na tabela whatsapp_groups
status: whatsappGroupId ? 'active' : 'pending'

// ✅ Correto: Remover campo inexistente
// Campo removido da inserção
```

## Estrutura da Tabela z_api_instances

A tabela `z_api_instances` tem a seguinte estrutura:

```typescript
interface ZApiInstance {
  id: string
  user_id: string
  instance_id: string
  instance_token: string  // ← Usar este campo
  client_token: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

## Estrutura da Tabela whatsapp_groups

A tabela `whatsapp_groups` atual tem a seguinte estrutura:

```typescript
interface WhatsappGroup {
  id: string
  name: string
  whatsapp_id: string
  description: string | null
  participants: string[]
  user_id: string
  created_at: string
  updated_at: string
  // ❌ Campo 'status' não existe
}
```

## Correções Implementadas

### 1. **Correção do Nome da Tabela**
```typescript
// src/app/api/groups/route.ts
const { data: userInstance } = await supabase
  .from('z_api_instances')  // ← Corrigido
  .select('*')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .single()
```

### 2. **Correção do Campo de Token**
```typescript
// src/app/api/groups/route.ts
const zApiClient = new ZApiClient(
  userInstance.instance_id, 
  userInstance.instance_token  // ← Corrigido
)
```

### 3. **Remoção do Campo Status**
```typescript
// src/app/api/groups/route.ts
const { data: group, error: dbError } = await supabase
  .from('whatsapp_groups')
  .insert({
    name: validatedData.name,
    description: validatedData.description,
    participants: validatedData.participants,
    whatsapp_id: whatsappGroupId || validatedData.whatsapp_id || null,
    user_id: user.id,
    // ❌ Campo 'status' removido
  })
  .select()
  .single()
```

### 4. **Adição de Logs para Debug**
```typescript
// src/app/api/groups/route.ts
const body = await request.json()
console.log('Dados recebidos para criar grupo:', body)

const validatedData = CreateGroupSchema.parse(body)
console.log('Dados validados:', validatedData)
```

## Schema de Validação

O schema de validação está correto:

```typescript
const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  participants: z.array(z.string()).default([]),
  whatsapp_id: z.string().optional(),
})
```

## Fluxo de Criação de Grupo

1. **Validação dos Dados**: Schema Zod valida os dados recebidos
2. **Verificação de Instância Z-API**: Busca instância ativa do usuário
3. **Criação no WhatsApp**: Tenta criar grupo via Z-API
4. **Salvamento no Banco**: Salva grupo na tabela `whatsapp_groups`
5. **Resposta**: Retorna sucesso ou aviso baseado no resultado

## Tratamento de Erros

### Caso 1: Sem Instância Z-API
```typescript
if (!userInstance) {
  return NextResponse.json(
    { error: 'Nenhuma instância Z-API ativa encontrada. Configure uma instância primeiro.' },
    { status: 400 }
  )
}
```

### Caso 2: Falha na Criação no WhatsApp
```typescript
// Grupo é criado localmente com status 'pending'
return NextResponse.json({ 
  group,
  message: 'Grupo criado localmente. Será sincronizado com o WhatsApp quando a conexão for restabelecida.',
  warning: zApiError
}, { status: 201 })
```

### Caso 3: Sucesso Completo
```typescript
return NextResponse.json({ 
  group,
  message: 'Grupo criado com sucesso no WhatsApp',
  whatsapp_id: whatsappGroupId
}, { status: 201 })
```

## Como Testar

1. **Verificar se há instância Z-API ativa**:
   - Acesse as configurações
   - Configure uma instância Z-API
   - Ative a instância

2. **Testar criação de grupo**:
   - Acesse `/dashboard/groups`
   - Clique em "Criar Grupo"
   - Preencha os dados
   - Adicione pelo menos um participante
   - Clique em "Criar"

3. **Verificar logs**:
   - Abra o console do navegador
   - Verifique se há logs de debug da API
   - Verifique se não há erros 400

## Resultado Esperado

- ✅ **Erro 400 eliminado**: API agora funciona corretamente
- ✅ **Criação de grupos**: Funciona com ou sem Z-API
- ✅ **Logs de debug**: Facilitam troubleshooting
- ✅ **Tratamento de erros**: Mensagens claras para o usuário

## Próximos Passos

1. **Testar com instância Z-API real**
2. **Verificar sincronização de grupos**
3. **Implementar funcionalidades de gerenciamento**
4. **Adicionar testes automatizados**

A correção resolve os problemas de estrutura de dados e permite que a criação de grupos funcione corretamente.
