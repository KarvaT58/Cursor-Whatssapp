#!/bin/bash

# WhatsApp Professional - Script de Backup
# Este script realiza backup completo do sistema

set -e

# Configurações
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="whatsapp-professional-backup-$DATE"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificar se as variáveis de ambiente estão configuradas
check_env() {
    log "Verificando variáveis de ambiente..."
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL não está configurada"
    fi
    
    if [ -z "$SUPABASE_URL" ]; then
        error "SUPABASE_URL não está configurada"
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        error "SUPABASE_SERVICE_ROLE_KEY não está configurada"
    fi
    
    log "Variáveis de ambiente verificadas com sucesso"
}

# Criar diretório de backup
create_backup_dir() {
    log "Criando diretório de backup..."
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    log "Diretório criado: $BACKUP_DIR/$BACKUP_NAME"
}

# Backup do banco de dados
backup_database() {
    log "Iniciando backup do banco de dados..."
    
    # Backup usando pg_dump
    if command -v pg_dump &> /dev/null; then
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
        log "Backup do banco de dados concluído"
    else
        warning "pg_dump não encontrado, pulando backup do banco"
    fi
    
    # Backup usando Supabase CLI (alternativo)
    if command -v supabase &> /dev/null; then
        log "Fazendo backup via Supabase CLI..."
        supabase db dump --db-url "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_NAME/supabase_dump.sql"
        log "Backup via Supabase CLI concluído"
    fi
}

# Backup de arquivos estáticos
backup_static_files() {
    log "Iniciando backup de arquivos estáticos..."
    
    # Backup de uploads (se existir)
    if [ -d "./uploads" ]; then
        cp -r ./uploads "$BACKUP_DIR/$BACKUP_NAME/"
        log "Backup de uploads concluído"
    fi
    
    # Backup de logs (se existir)
    if [ -d "./logs" ]; then
        cp -r ./logs "$BACKUP_DIR/$BACKUP_NAME/"
        log "Backup de logs concluído"
    fi
    
    # Backup de configurações
    if [ -f ".env.local" ]; then
        cp .env.local "$BACKUP_DIR/$BACKUP_NAME/"
        log "Backup de configurações concluído"
    fi
}

# Backup de dados do Supabase Storage
backup_supabase_storage() {
    log "Iniciando backup do Supabase Storage..."
    
    # Usar Supabase CLI para backup do storage
    if command -v supabase &> /dev/null; then
        supabase storage download --bucket-name "uploads" --local-path "$BACKUP_DIR/$BACKUP_NAME/storage/" || warning "Falha no backup do storage"
        log "Backup do Supabase Storage concluído"
    else
        warning "Supabase CLI não encontrado, pulando backup do storage"
    fi
}

# Backup de configurações do Redis
backup_redis() {
    log "Iniciando backup do Redis..."
    
    if [ -n "$REDIS_URL" ] && command -v redis-cli &> /dev/null; then
        # Backup das chaves do Redis
        redis-cli -u "$REDIS_URL" --rdb "$BACKUP_DIR/$BACKUP_NAME/redis.rdb" || warning "Falha no backup do Redis"
        log "Backup do Redis concluído"
    else
        warning "Redis CLI não encontrado ou REDIS_URL não configurada"
    fi
}

# Criar arquivo de metadados
create_metadata() {
    log "Criando arquivo de metadados..."
    
    cat > "$BACKUP_DIR/$BACKUP_NAME/metadata.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "environment": "${NODE_ENV:-development}",
  "database_url": "${DATABASE_URL}",
  "supabase_url": "${SUPABASE_URL}",
  "backup_size": "$(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)",
  "files": [
    $(find "$BACKUP_DIR/$BACKUP_NAME" -type f -printf '"%P",\n' | sed '$s/,$//')
  ]
}
EOF
    
    log "Arquivo de metadados criado"
}

# Compactar backup
compress_backup() {
    log "Compactando backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    log "Backup compactado: ${BACKUP_NAME}.tar.gz"
    log "Tamanho do backup: $(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)"
}

# Upload para armazenamento remoto (opcional)
upload_to_remote() {
    if [ -n "$BACKUP_S3_BUCKET" ] && command -v aws &> /dev/null; then
        log "Fazendo upload para S3..."
        aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" "s3://$BACKUP_S3_BUCKET/backups/"
        log "Upload para S3 concluído"
    fi
    
    if [ -n "$BACKUP_GCS_BUCKET" ] && command -v gsutil &> /dev/null; then
        log "Fazendo upload para Google Cloud Storage..."
        gsutil cp "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" "gs://$BACKUP_GCS_BUCKET/backups/"
        log "Upload para GCS concluído"
    fi
}

# Limpeza de backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos..."
    
    # Manter apenas os últimos 7 backups
    cd "$BACKUP_DIR"
    ls -t *.tar.gz | tail -n +8 | xargs -r rm -f
    
    log "Limpeza de backups antigos concluída"
}

# Função principal
main() {
    log "Iniciando backup do WhatsApp Professional..."
    
    check_env
    create_backup_dir
    backup_database
    backup_static_files
    backup_supabase_storage
    backup_redis
    create_metadata
    compress_backup
    upload_to_remote
    cleanup_old_backups
    
    log "Backup concluído com sucesso!"
    log "Arquivo: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
}

# Executar script
main "$@"
