'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileImage, FileVideo, FileAudio, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploadProps {
  value: string; // URL da mídia
  onChange: (url: string, fileName: string) => void;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  className?: string;
}

export function MediaUpload({ value, onChange, mediaType, className }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-4 w-4" />;
      case 'video': return <FileVideo className="h-4 w-4" />;
      case 'audio': return <FileAudio className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileImage className="h-4 w-4" />;
    }
  };

  const getAcceptTypes = (type: string) => {
    switch (type) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'document': return '.pdf,.doc,.docx,.txt,.xlsx,.xls';
      default: return '*/*';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Arquivo selecionado:', { name: file.name, type: file.type, size: file.size, mediaType });
    
    setIsUploading(true);
    setUploadedFile(file);

    try {
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', mediaType);

      console.log('📤 Iniciando upload para:', '/api/upload/media');

      // Fazer upload do arquivo
      const response = await fetch('/api/upload/media', {
        method: 'POST',
        body: formData,
      });

      console.log('📤 Resposta do upload:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload bem-sucedido:', data);
        onChange(data.url, file.name);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro no upload:', { status: response.status, error: errorData });
        alert(`Erro ao fazer upload do arquivo: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      alert(`Erro ao fazer upload do arquivo: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onChange('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-gray-700">Arquivo de Mídia</Label>
      
      {!value && !uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center space-y-2">
            {getMediaIcon(mediaType)}
            <div className="text-sm text-gray-600">
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Ou arraste e solte o arquivo aqui
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getMediaIcon(mediaType)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile?.name || 'Arquivo carregado'}
                </p>
                {value && (
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {value}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                <Upload className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes(mediaType)}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
