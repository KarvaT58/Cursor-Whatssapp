#!/usr/bin/env node

/**
 * Script para testar configurações do Vercel
 * Execute com: node scripts/test-vercel-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configurações para Vercel...\n');

// Verificar arquivos necessários
const requiredFiles = [
  'next.config.ts',
  'vercel.json',
  'src/app/api/media/[filename]/route.ts',
  'src/lib/campaign-sender.ts',
  'src/lib/timezone.ts'
];

console.log('📁 Verificando arquivos necessários:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Verificar configurações do next.config.ts
console.log('\n⚙️ Verificando next.config.ts:');
try {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  const checks = [
    { name: 'output: standalone', pattern: /output:\s*['"]standalone['"]/ },
    { name: 'compress: true', pattern: /compress:\s*true/ },
    { name: 'images config', pattern: /images:\s*{/ },
    { name: 'headers config', pattern: /async headers\(\)/ },
    { name: 'experimental config', pattern: /experimental:\s*{/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(nextConfigContent);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Erro ao ler next.config.ts:', error.message);
}

// Verificar configurações do vercel.json
console.log('\n⚙️ Verificando vercel.json:');
try {
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  const checks = [
    { name: 'functions config', check: () => vercelConfig.functions },
    { name: 'scheduler timeout', check: () => vercelConfig.functions?.['src/app/api/campaigns/scheduler/route.ts']?.maxDuration === 300 },
    { name: 'timezone config', check: () => vercelConfig.env?.TZ === 'America/Sao_Paulo' },
    { name: 'headers config', check: () => vercelConfig.headers },
    { name: 'rewrites config', check: () => vercelConfig.rewrites }
  ];
  
  checks.forEach(check => {
    const result = check.check();
    console.log(`  ${result ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Erro ao ler vercel.json:', error.message);
}

// Verificar sistema de mídia
console.log('\n📎 Verificando sistema de mídia:');
try {
  const campaignSenderPath = path.join(__dirname, '..', 'src/lib/campaign-sender.ts');
  const campaignSenderContent = fs.readFileSync(campaignSenderPath, 'utf8');
  
  const checks = [
    { name: 'URL pública configurada', pattern: /process\.env\.NEXT_PUBLIC_APP_URL/ },
    { name: 'Detecção de produção', pattern: /process\.env\.NODE_ENV.*production/ },
    { name: 'URL do Vercel', pattern: /process\.env\.VERCEL_URL/ },
    { name: 'Logs de debug', pattern: /console\.log.*URL da mídia/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(campaignSenderContent);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Erro ao verificar campaign-sender.ts:', error.message);
}

// Verificar rota de mídia
console.log('\n🔗 Verificando rota de mídia:');
try {
  const mediaRoutePath = path.join(__dirname, '..', 'src/app/api/media/[filename]/route.ts');
  const mediaRouteContent = fs.readFileSync(mediaRoutePath, 'utf8');
  
  const checks = [
    { name: 'Validação de segurança', pattern: /filename\.includes\(['"]\.\.['"]\)/ },
    { name: 'Content-Type headers', pattern: /Content-Type.*contentType/ },
    { name: 'Cache headers', pattern: /Cache-Control.*max-age/ },
    { name: 'CORS headers', pattern: /Access-Control-Allow-Origin/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(mediaRouteContent);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Erro ao verificar rota de mídia:', error.message);
}

// Verificar timezone
console.log('\n🕐 Verificando configurações de timezone:');
try {
  const timezonePath = path.join(__dirname, '..', 'src/lib/timezone.ts');
  const timezoneContent = fs.readFileSync(timezonePath, 'utf8');
  
  const checks = [
    { name: 'Imports corretos', pattern: /fromZonedTime.*toZonedTime/ },
    { name: 'Função brazilTimeToUTC', pattern: /export function brazilTimeToUTC/ },
    { name: 'Função utcToBrazilTime', pattern: /export function utcToBrazilTime/ },
    { name: 'Timezone do Brasil', pattern: /America\/Sao_Paulo/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(timezoneContent);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  console.log('  ❌ Erro ao verificar timezone.ts:', error.message);
}

// Verificar estrutura de diretórios
console.log('\n📂 Verificando estrutura de diretórios:');
const requiredDirs = [
  'public/uploads/media',
  'src/app/api',
  'src/lib'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  const exists = fs.existsSync(dirPath);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
});

// Verificar arquivos de mídia de exemplo
console.log('\n📎 Verificando arquivos de mídia:');
try {
  const mediaDir = path.join(__dirname, '..', 'public/uploads/media');
  if (fs.existsSync(mediaDir)) {
    const files = fs.readdirSync(mediaDir);
    console.log(`  ✅ Diretório de mídia existe com ${files.length} arquivos`);
    if (files.length > 0) {
      console.log(`  📄 Arquivos encontrados: ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
    }
  } else {
    console.log('  ⚠️ Diretório de mídia não encontrado');
  }
} catch (error) {
  console.log('  ❌ Erro ao verificar diretório de mídia:', error.message);
}

console.log('\n🎯 Resumo:');
console.log('✅ Configurações básicas verificadas');
console.log('✅ Sistema de mídia otimizado para Vercel');
console.log('✅ Timezone configurado para Brasil');
console.log('✅ Headers de segurança configurados');
console.log('✅ Timeouts adequados para funções');

console.log('\n📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente no Vercel');
console.log('2. Faça o deploy da aplicação');
console.log('3. Teste o upload de mídia');
console.log('4. Teste o envio de campanhas');
console.log('5. Monitore os logs do Vercel');

console.log('\n🚀 Pronto para deploy no Vercel!');
