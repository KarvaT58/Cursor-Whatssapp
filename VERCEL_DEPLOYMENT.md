# Guia de Deploy no Vercel - WhatsApp Professional

## Configurações Necessárias

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no painel do Vercel:

#### Obrigatórias:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

#### Opcionais:
```
TZ=America/Sao_Paulo
NODE_ENV=production
VERCEL_URL=seu-app.vercel.app
VERCEL_ENV=production
```

### 2. Configurações de Build

O projeto já está configurado com:
- ✅ `next.config.ts` otimizado para Vercel
- ✅ `vercel.json` com timeouts adequados
- ✅ Headers de segurança configurados
- ✅ Sistema de mídia otimizado para URLs públicas

### 3. Funcionalidades Configuradas

#### Sistema de Mídia
- ✅ URLs de mídia convertidas automaticamente para URLs públicas
- ✅ Rota `/api/media/[filename]` para servir arquivos
- ✅ Headers de cache otimizados
- ✅ Validação de segurança de nomes de arquivo

#### Scheduler de Campanhas
- ✅ Timeout de 300 segundos configurado
- ✅ Timezone do Brasil configurado
- ✅ Logs otimizados para produção

#### APIs
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Timeouts adequados para cada endpoint

### 4. Estrutura de Arquivos

```
public/
  uploads/
    media/          # Arquivos de mídia das campanhas
      *.jpg
      *.png
      *.mp4
      *.mp3
      *.pdf
      etc.
```

### 5. Comandos de Deploy

```bash
# Deploy automático via Git
git push origin main

# Deploy manual
vercel --prod

# Verificar logs
vercel logs
```

### 6. Monitoramento

#### Logs do Vercel
- Acesse o painel do Vercel
- Vá para "Functions" → "View Function Logs"
- Monitore execuções do scheduler

#### Métricas Importantes
- ✅ Tempo de execução das funções
- ✅ Taxa de erro das APIs
- ✅ Uso de memória
- ✅ Timeouts

### 7. Troubleshooting

#### Problemas Comuns

**1. Timeout de Função**
- Verifique se `maxDuration` está configurado no `vercel.json`
- Monitore logs para identificar gargalos

**2. Mídia Não Carrega**
- Verifique se `NEXT_PUBLIC_APP_URL` está configurada
- Confirme se arquivos estão em `public/uploads/media/`
- Teste URL diretamente: `https://seu-app.vercel.app/api/media/nome-do-arquivo.jpg`

**3. Erro de Timezone**
- Confirme se `TZ=America/Sao_Paulo` está configurado
- Verifique se `date-fns-tz` está atualizado

**4. Erro de Supabase**
- Confirme se todas as chaves estão configuradas
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` tem permissões adequadas

### 8. Otimizações Implementadas

#### Performance
- ✅ Compressão habilitada
- ✅ Cache de imagens otimizado
- ✅ Headers de cache configurados
- ✅ Bundle otimizado

#### Segurança
- ✅ Headers de segurança
- ✅ Validação de arquivos
- ✅ CORS configurado
- ✅ Sanitização de inputs

#### Monitoramento
- ✅ Logs estruturados
- ✅ Métricas de performance
- ✅ Tratamento de erros

### 9. Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Arquivos de mídia em `public/uploads/media/`
- [ ] Teste de upload de mídia
- [ ] Teste de envio de campanha
- [ ] Teste do scheduler
- [ ] Verificação de logs
- [ ] Teste de URLs de mídia
- [ ] Verificação de timezone
- [ ] Teste de performance

### 10. Suporte

Para problemas específicos:
1. Verifique logs no painel do Vercel
2. Teste endpoints individualmente
3. Confirme configurações de ambiente
4. Verifique status do Supabase
5. Monitore métricas de performance
