/**
 * Script para testar o scheduler de campanhas
 */

const { runScheduler } = require('./scripts/scheduler');

console.log('🧪 Testando scheduler de campanhas...');
console.log('⏰ Horário atual:', new Date().toLocaleString('pt-BR'));

runScheduler()
  .then(() => {
    console.log('✅ Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  });
