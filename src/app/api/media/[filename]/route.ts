import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    if (!filename) {
      return NextResponse.json({ error: 'Nome do arquivo não fornecido' }, { status: 400 });
    }

    // Inicializar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Tentar diferentes caminhos possíveis
    const possiblePaths = [
      `campaigns/media/${filename}`,
      `media/${filename}`,
      `uploads/media/${filename}`
    ];

    let fileData: any = null;
    let contentType = 'application/octet-stream';

    for (const path of possiblePaths) {
      try {
        const { data, error } = await supabase.storage
          .from('media')
          .download(path);

        if (!error && data) {
          fileData = data;
          
          // Determinar content type baseado na extensão
          const extension = filename.split('.').pop()?.toLowerCase();
          const contentTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'm4a': 'audio/mp4',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
          
          contentType = contentTypes[extension || ''] || 'application/octet-stream';
          break;
        }
      } catch (error) {
        console.log(`Tentativa de download falhou para ${path}:`, error);
        continue;
      }
    }

    if (!fileData) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    // Converter para buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Retornar arquivo com headers apropriados
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}