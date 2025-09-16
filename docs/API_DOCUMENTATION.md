# 🔌 WhatsApp Professional - Documentação da API

## 📋 Visão Geral

A API do WhatsApp Professional oferece endpoints RESTful para integração com sistemas externos, automação de campanhas e gerenciamento de dados.

## 🔐 Autenticação

### Bearer Token

```http
Authorization: Bearer <seu_token>
```

### Headers Obrigatórios

```http
Content-Type: application/json
Authorization: Bearer <seu_token>
```

## 📊 Endpoints Principais

### Base URL

```
https://api.whatsapp-professional.com/v1
```

## 👥 Usuários

### GET /users/profile

Obter perfil do usuário atual

**Resposta:**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "João Silva",
  "avatar": "https://example.com/avatar.jpg",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### PUT /users/profile

Atualizar perfil do usuário

**Body:**

```json
{
  "name": "João Silva",
  "avatar": "https://example.com/avatar.jpg"
}
```

## 📱 Contatos

### GET /contacts

Listar contatos

**Query Parameters:**

- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)
- `search`: Busca por nome ou número
- `tags`: Filtro por tags

**Resposta:**

```json
{
  "data": [
    {
      "id": "contact_123",
      "name": "Maria Santos",
      "phone": "+5511999999999",
      "email": "maria@example.com",
      "tags": ["cliente", "vip"],
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### POST /contacts

Criar novo contato

**Body:**

```json
{
  "name": "Maria Santos",
  "phone": "+5511999999999",
  "email": "maria@example.com",
  "tags": ["cliente", "vip"]
}
```

### PUT /contacts/{id}

Atualizar contato

### DELETE /contacts/{id}

Excluir contato

### POST /contacts/import

Importar contatos em lote

**Body (multipart/form-data):**

- `file`: Arquivo CSV/Excel
- `mapping`: Mapeamento dos campos

## 📢 Campanhas

### GET /campaigns

Listar campanhas

**Query Parameters:**

- `status`: Filtro por status
- `page`: Número da página
- `limit`: Itens por página

**Resposta:**

```json
{
  "data": [
    {
      "id": "campaign_123",
      "name": "Campanha Black Friday",
      "status": "active",
      "message": "Oferta especial!",
      "recipients_count": 1000,
      "sent_count": 850,
      "delivered_count": 800,
      "created_at": "2025-01-01T00:00:00Z",
      "scheduled_at": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### POST /campaigns

Criar nova campanha

**Body:**

```json
{
  "name": "Campanha Black Friday",
  "message": "Oferta especial!",
  "recipients": ["contact_123", "contact_456"],
  "scheduled_at": "2025-01-01T10:00:00Z",
  "settings": {
    "rate_limit": 10,
    "retry_attempts": 3
  }
}
```

### GET /campaigns/{id}

Obter detalhes da campanha

### PUT /campaigns/{id}

Atualizar campanha

### DELETE /campaigns/{id}

Excluir campanha

### POST /campaigns/{id}/start

Iniciar campanha

### POST /campaigns/{id}/pause

Pausar campanha

### POST /campaigns/{id}/stop

Parar campanha

### GET /campaigns/{id}/metrics

Obter métricas da campanha

**Resposta:**

```json
{
  "campaign_id": "campaign_123",
  "total_recipients": 1000,
  "sent": 850,
  "delivered": 800,
  "read": 600,
  "failed": 50,
  "delivery_rate": 94.12,
  "read_rate": 75.0,
  "failure_rate": 5.88
}
```

## 💬 Mensagens

### GET /messages

Listar mensagens

**Query Parameters:**

- `contact_id`: Filtro por contato
- `campaign_id`: Filtro por campanha
- `status`: Filtro por status
- `date_from`: Data inicial
- `date_to`: Data final

### POST /messages/send

Enviar mensagem individual

**Body:**

```json
{
  "contact_id": "contact_123",
  "message": "Olá! Como posso ajudar?",
  "type": "text",
  "media_url": "https://example.com/image.jpg"
}
```

### GET /messages/{id}

Obter detalhes da mensagem

## 👥 Equipes

### GET /teams

Listar equipes do usuário

### POST /teams

Criar nova equipe

**Body:**

```json
{
  "name": "Equipe de Vendas",
  "description": "Equipe responsável pelas vendas",
  "settings": {
    "permissions": {
      "campaigns": "manage",
      "contacts": "read",
      "messages": "send"
    }
  }
}
```

### GET /teams/{id}

Obter detalhes da equipe

### PUT /teams/{id}

Atualizar equipe

### DELETE /teams/{id}

Excluir equipe

### POST /teams/{id}/members

Adicionar membro à equipe

**Body:**

```json
{
  "user_id": "user_123",
  "role": "member"
}
```

### DELETE /teams/{id}/members/{user_id}

Remover membro da equipe

### GET /teams/{id}/messages

Listar mensagens da equipe

### POST /teams/{id}/messages

Enviar mensagem para a equipe

## 📊 Monitoramento

### GET /health

Verificar saúde do sistema

**Resposta:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "services": [
    {
      "service": "database",
      "status": "healthy",
      "response_time": 50
    },
    {
      "service": "z-api",
      "status": "healthy",
      "response_time": 200
    }
  ],
  "uptime": 86400,
  "version": "1.0.0"
}
```

### GET /metrics

Obter métricas do sistema

**Query Parameters:**

- `type`: Tipo de métrica (performance, business)
- `team_id`: Filtro por equipe
- `user_id`: Filtro por usuário
- `start_date`: Data inicial
- `end_date`: Data final

### GET /logs

Obter logs do sistema

**Query Parameters:**

- `type`: Tipo de log (audit, error, performance)
- `user_id`: Filtro por usuário
- `team_id`: Filtro por equipe
- `start_date`: Data inicial
- `end_date`: Data final
- `limit`: Número de registros

## 🔧 Z-API Integration

### GET /z-api/status

Verificar status da integração Z-API

**Resposta:**

```json
{
  "connected": true,
  "instance_id": "instance_123",
  "status": "connected",
  "phone": "+5511999999999",
  "last_seen": "2025-01-01T00:00:00Z"
}
```

### POST /z-api/qr-code

Obter QR Code para conexão

### POST /z-api/disconnect

Desconectar instância

### POST /z-api/restart

Reiniciar instância

## 📈 Webhooks

### Configurar Webhook

```json
{
  "url": "https://seu-site.com/webhook",
  "events": [
    "message.sent",
    "message.delivered",
    "message.read",
    "campaign.completed"
  ],
  "secret": "seu_secret_key"
}
```

### Eventos Disponíveis

- `message.sent`: Mensagem enviada
- `message.delivered`: Mensagem entregue
- `message.read`: Mensagem lida
- `message.failed`: Falha no envio
- `campaign.started`: Campanha iniciada
- `campaign.completed`: Campanha concluída
- `campaign.paused`: Campanha pausada
- `contact.created`: Contato criado
- `contact.updated`: Contato atualizado

### Exemplo de Payload

```json
{
  "event": "message.delivered",
  "timestamp": "2025-01-01T00:00:00Z",
  "data": {
    "message_id": "msg_123",
    "contact_id": "contact_123",
    "campaign_id": "campaign_123",
    "status": "delivered",
    "delivered_at": "2025-01-01T00:00:00Z"
  }
}
```

## 🚨 Códigos de Erro

### HTTP Status Codes

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Não encontrado
- `429`: Rate limit excedido
- `500`: Erro interno do servidor

### Códigos de Erro Personalizados

```json
{
  "error": {
    "code": "INVALID_PHONE_NUMBER",
    "message": "Número de telefone inválido",
    "details": {
      "field": "phone",
      "value": "123"
    }
  }
}
```

## 🔒 Rate Limiting

### Limites por Endpoint

- **GET /contacts**: 100 requests/minuto
- **POST /campaigns**: 10 requests/minuto
- **POST /messages/send**: 50 requests/minuto
- **GET /metrics**: 200 requests/minuto

### Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 Exemplos de Uso

### Criar Campanha com Webhook

```bash
curl -X POST https://api.whatsapp-professional.com/v1/campaigns \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campanha Teste",
    "message": "Olá! Esta é uma mensagem de teste.",
    "recipients": ["contact_123", "contact_456"],
    "webhook_url": "https://seu-site.com/webhook"
  }'
```

### Enviar Mensagem Individual

```bash
curl -X POST https://api.whatsapp-professional.com/v1/messages/send \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "contact_123",
    "message": "Olá! Como posso ajudar?",
    "type": "text"
  }'
```

### Obter Métricas de Campanha

```bash
curl -X GET https://api.whatsapp-professional.com/v1/campaigns/campaign_123/metrics \
  -H "Authorization: Bearer seu_token"
```

## 🔧 SDKs e Bibliotecas

### JavaScript/Node.js

```bash
npm install whatsapp-professional-sdk
```

```javascript
const WhatsAppProfessional = require('whatsapp-professional-sdk')

const client = new WhatsAppProfessional({
  apiKey: 'seu_token',
  baseURL: 'https://api.whatsapp-professional.com/v1',
})

// Criar campanha
const campaign = await client.campaigns.create({
  name: 'Campanha Teste',
  message: 'Olá!',
  recipients: ['contact_123'],
})
```

### Python

```bash
pip install whatsapp-professional
```

```python
from whatsapp_professional import Client

client = Client(api_key='seu_token')

# Criar campanha
campaign = client.campaigns.create(
    name='Campanha Teste',
    message='Olá!',
    recipients=['contact_123']
)
```

### PHP

```bash
composer require whatsapp-professional/php-sdk
```

```php
use WhatsAppProfessional\Client;

$client = new Client('seu_token');

// Criar campanha
$campaign = $client->campaigns()->create([
    'name' => 'Campanha Teste',
    'message' => 'Olá!',
    'recipients' => ['contact_123']
]);
```

## 📞 Suporte

### Documentação

- **API Docs**: https://docs.whatsapp-professional.com/api
- **Postman Collection**: [Download](https://api.whatsapp-professional.com/postman.json)
- **OpenAPI Spec**: [Download](https://api.whatsapp-professional.com/openapi.json)

### Contato

- **Email**: api@whatsapp-professional.com
- **Slack**: #api-support
- **GitHub**: https://github.com/whatsapp-professional/api

---

_Última atualização: Setembro 2025_
