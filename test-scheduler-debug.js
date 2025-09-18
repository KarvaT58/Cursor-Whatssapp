/**
 * Script para testar o scheduler com debug detalhado
 */

const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:3000';
const SCHEDULER_ENDPOINT = '/api/campaigns/scheduler';

async function testScheduler() {
  try {
    console.log('🧪 Testando scheduler com debug...');
    console.log('⏰ Horário atual:', new Date().toLocaleString('pt-BR'));
    console.log('🌐 URL:', `${API_URL}${SCHEDULER_ENDPOINT}`);
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(`${API_URL}${SCHEDULER_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Scheduler/1.0'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.end();
    });

    console.log('📊 Status:', response.statusCode);
    console.log('📋 Headers:', response.headers);
    console.log('📄 Response:', response.data);

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      console.log('✅ Resultado:', result);
    } else {
      console.error('❌ Erro:', response.statusCode, response.data);
    }

  } catch (error) {
    console.error('❌ Erro ao testar scheduler:', error.message);
  }
}

testScheduler();
