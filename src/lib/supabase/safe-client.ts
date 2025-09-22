import { createClient } from './server'

export async function createSafeClient() {
  try {
    const supabase = await createClient()
    
    // Verificações de segurança
    if (!supabase) {
      throw new Error('Cliente Supabase é null/undefined')
    }
    
    if (!supabase.auth) {
      throw new Error('Módulo auth do Supabase é null/undefined')
    }
    
    if (typeof supabase.auth.getUser !== 'function') {
      throw new Error('Método getUser não existe no módulo auth')
    }
    
    return supabase
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase seguro:', error)
    throw error
  }
}

export async function safeGetUser(supabase: any) {
  try {
    if (!supabase || !supabase.auth) {
      throw new Error('Cliente Supabase inválido')
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ Erro ao obter usuário:', error)
      throw error
    }
    
    return { user, error: null }
  } catch (error) {
    console.error('❌ Erro em safeGetUser:', error)
    return { user: null, error }
  }
}
