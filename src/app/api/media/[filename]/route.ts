import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // Validar nome do arquivo para segurança
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Nome de arquivo inválido' },
        { status: 400 }
      )
    }
    
    // Construir caminho do arquivo
    const filePath = join(process.cwd(), 'public', 'uploads', 'media', filename)
    
    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      console.log(`Arquivo não encontrado: ${filePath}`)
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }
    
    // Ler o arquivo
    const fileBuffer = await readFile(filePath)
    
    // Determinar o tipo de conteúdo baseado na extensão
    const extension = filename.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'mp3':
        contentType = 'audio/mpeg'
        break
      case 'wav':
        contentType = 'audio/wav'
        break
      case 'ogg':
        contentType = 'audio/ogg'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'mp4':
        contentType = 'video/mp4'
        break
      case 'avi':
        contentType = 'video/x-msvideo'
        break
      case 'mov':
        contentType = 'video/quicktime'
        break
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'doc':
        contentType = 'application/msword'
        break
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case 'xls':
        contentType = 'application/vnd.ms-excel'
        break
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
      case 'txt':
        contentType = 'text/plain'
        break
    }
    
    // Retornar o arquivo com os headers corretos
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache por 1 dia
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    })
    
  } catch (error) {
    console.error('Erro ao servir arquivo de mídia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
