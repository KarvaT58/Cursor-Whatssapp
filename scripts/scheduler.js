/**
 * Scheduler para executar campanhas agendadas
 * Este script deve ser executado a cada minuto via cron job
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_IGNITER_API_URL || 'http://localhost:3000';
const SCHEDULER_ENDPOINT = '/api/campaigns/scheduler';

async function runScheduler() {
  try {
    console.log(`🕐 [${new Date().toISOString()}] Executando scheduler...`);
    
    const url = `${API_URL}${SCHEDULER_ENDPOINT}`;
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const response = await new Promise((resolve, reject) => {
      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Campaign-Scheduler/1.0'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.end();
    });

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      console.log(`✅ Scheduler executado: ${result.message}`);
      
      if (result.results && result.results.length > 0) {
        result.results.forEach(r => {
          console.log(`  📊 ${r.campaign}: ${r.success ? '✅' : '❌'} ${r.message}`);
        });
      }
    } else {
      console.error(`❌ Erro no scheduler: ${response.statusCode} - ${response.data}`);
    }

  } catch (error) {
    console.error(`❌ Erro ao executar scheduler:`, error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runScheduler();
}

module.exports = { runScheduler };
