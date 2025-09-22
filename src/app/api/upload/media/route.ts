import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    console.log('📤 Upload request:', { fileName: file.name, fileType: file.type, fileSize: file.size, requestedType: type });

    // Validar tipo de arquivo
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime', 'video/x-msvideo'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg', 'audio/x-wav', 'audio/webm', 'audio/aac'],
      document: [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain', 
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream', // Para arquivos sem MIME type específico
        'application/zip',
        'application/x-zip-compressed'
      ]
    };

    console.log('🔍 Validando tipo de arquivo:', { 
      fileType: file.type, 
      requestedType: type, 
      allowedTypes: allowedTypes[type as keyof typeof allowedTypes] 
    });

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      console.error('❌ Tipo de arquivo não permitido:', { fileType: file.type, requestedType: type });
      return NextResponse.json({ 
        error: `Tipo de arquivo não permitido para ${type}. Tipo recebido: ${file.type}` 
      }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 10MB permitido.' 
      }, { status: 400 });
    }

    // Inicializar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}.${fileExtension}`;
    const filePath = `campaigns/media/${fileName}`;

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('📤 Fazendo upload para Supabase Storage:', { filePath, contentType: file.type });

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Erro no upload para Supabase:', error);
      return NextResponse.json({ 
        error: `Erro ao fazer upload do arquivo: ${error.message}` 
      }, { status: 500 });
    }

    console.log('✅ Upload para Supabase bem-sucedido:', data);

    // Obter URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    console.log('🔗 URL pública gerada:', urlData.publicUrl);

    const response = { 
      url: urlData.publicUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
      path: filePath
    };

    console.log('📤 Resposta final do upload:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
