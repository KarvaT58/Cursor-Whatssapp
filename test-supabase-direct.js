/**
 * Teste direto do Supabase para verificar se consegue acessar os dados
 */

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  try {
    console.log('🧪 Testando acesso direto ao Supabase...');
    
    // Usar as mesmas variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔧 URL:', supabaseUrl ? 'Definida' : 'Não definida');
    console.log('🔑 Key:', supabaseKey ? 'Definida' : 'Não definida');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente não definidas');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Testar busca de agendamentos
    console.log('🔍 Buscando agendamentos...');
    const { data: schedules, error: schedulesError } = await supabase
      .from('campaign_schedules')
      .select('*')
      .eq('is_active', true)
      .eq('is_recurring', true);
    
    console.log('📊 Agendamentos:', schedules);
    console.log('❌ Erro agendamentos:', schedulesError);
    
    if (schedules && schedules.length > 0) {
      // Testar busca de campanhas
      const campaignIds = schedules.map(s => s.campaign_id);
      console.log('🔍 Buscando campanhas para IDs:', campaignIds);
      
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, status, global_interval')
        .in('id', campaignIds)
        .eq('status', 'active');
      
      console.log('📊 Campanhas:', campaigns);
      console.log('❌ Erro campanhas:', campaignsError);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testSupabase();
