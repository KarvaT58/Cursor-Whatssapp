import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Verificar se é uma mensagem de grupo
    if (body.type === 'message' && body.groupId) {
      const { groupId, message, phone, timestamp, messageId } = body

      // Buscar o grupo no banco
      const { data: group, error: groupError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('whatsapp_id', groupId)
        .single()

      if (groupError || !group) {
        console.log('Grupo não encontrado:', groupId)
        return NextResponse.json({
          success: false,
          error: 'Grupo não encontrado',
        })
      }

      // Verificar se o remetente é um participante do grupo
      const isParticipant = group.participants?.includes(phone)
      if (!isParticipant) {
        console.log('Remetente não é participante do grupo:', phone)
        return NextResponse.json({
          success: false,
          error: 'Remetente não autorizado',
        })
      }

      // Salvar a mensagem no banco
      const { error: messageError } = await supabase
        .from('whatsapp_messages')
        .insert({
          content: message,
          direction: 'inbound',
          type: 'text',
          status: 'delivered',
          group_id: group.id,
          whatsapp_message_id: messageId,
          created_at: new Date(timestamp).toISOString(),
        })

      if (messageError) {
        console.error('Erro ao salvar mensagem:', messageError)
        return NextResponse.json({
          success: false,
          error: 'Erro ao salvar mensagem',
        })
      }

      return NextResponse.json({ success: true })
    }

    // Verificar se é uma mensagem individual
    if (body.type === 'message' && body.phone && !body.groupId) {
      const { phone, message, timestamp, messageId } = body

      // Buscar o contato no banco
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', phone)
        .single()

      if (contactError || !contact) {
        console.log('Contato não encontrado:', phone)
        return NextResponse.json({
          success: false,
          error: 'Contato não encontrado',
        })
      }

      // Salvar a mensagem no banco
      const { error: messageError } = await supabase
        .from('whatsapp_messages')
        .insert({
          content: message,
          direction: 'inbound',
          type: 'text',
          status: 'delivered',
          contact_id: contact.id,
          whatsapp_message_id: messageId,
          created_at: new Date(timestamp).toISOString(),
        })

      if (messageError) {
        console.error('Erro ao salvar mensagem:', messageError)
        return NextResponse.json({
          success: false,
          error: 'Erro ao salvar mensagem',
        })
      }

      return NextResponse.json({ success: true })
    }

    // Verificar se é um status de mensagem
    if (body.type === 'message-status') {
      const { messageId, status } = body

      // Atualizar o status da mensagem
      const { error: updateError } = await supabase
        .from('whatsapp_messages')
        .update({ status })
        .eq('whatsapp_message_id', messageId)

      if (updateError) {
        console.error('Erro ao atualizar status da mensagem:', updateError)
        return NextResponse.json({
          success: false,
          error: 'Erro ao atualizar status',
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true, message: 'Webhook recebido' })
  } catch (error) {
    console.error('Erro no webhook Z-API:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
