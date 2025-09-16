#!/bin/bash

# WhatsApp Professional - Script de Restore
# Este script restaura o sistema a partir de um backup

set -e

# Configurações
BACKUP_DIR="./backups"
RESTORE_DIR="./restore"

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

# Verificar argumentos
if [ $# -eq 0 ]; then
    error "Uso: $0 <arquivo_de_backup.tar.gz>"
fi

BACKUP_FILE="$1"

# Verificar se o arquivo de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    error "Arquivo de backup não encontrado: $BACKUP_FILE"
fi

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

# Extrair backup
extract_backup() {
    log "Extraindo backup..."
    
    # Criar diretório de restore
    mkdir -p "$RESTORE_DIR"
    
    # Extrair arquivo
    tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"
    
    # Encontrar diretório extraído
    EXTRACTED_DIR=$(find "$RESTORE_DIR" -maxdepth 1 -type d -name "whatsapp-professional-backup-*" | head -1)
    
    if [ -z "$EXTRACTED_DIR" ]; then
        error "Não foi possível encontrar diretório extraído"
    fi
    
    log "Backup extraído em: $EXTRACTED_DIR"
}

# Verificar metadados
check_metadata() {
    log "Verificando metadados do backup..."
    
    if [ -f "$EXTRACTED_DIR/metadata.json" ]; then
        log "Metadados encontrados:"
        cat "$EXTRACTED_DIR/metadata.json" | jq '.'
    else
        warning "Arquivo de metadados não encontrado"
    fi
}

# Restaurar banco de dados
restore_database() {
    log "Iniciando restauração do banco de dados..."
    
    # Confirmar restauração
    read -p "ATENÇÃO: Isso irá substituir todos os dados do banco atual. Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warning "Restauração do banco cancelada"
        return
    fi
    
    # Restaurar usando psql
    if [ -f "$EXTRACTED_DIR/database.sql" ] && command -v psql &> /dev/null; then
        log "Restaurando banco de dados..."
        psql "$DATABASE_URL" < "$EXTRACTED_DIR/database.sql"
        log "Banco de dados restaurado com sucesso"
    else
        warning "Arquivo de backup do banco não encontrado ou psql não disponível"
    fi
    
    # Restaurar usando Supabase CLI (alternativo)
    if [ -f "$EXTRACTED_DIR/supabase_dump.sql" ] && command -v supabase &> /dev/null; then
        log "Restaurando via Supabase CLI..."
        supabase db reset --db-url "$DATABASE_URL" < "$EXTRACTED_DIR/supabase_dump.sql"
        log "Restauração via Supabase CLI concluída"
    fi
}

# Restaurar arquivos estáticos
restore_static_files() {
    log "Iniciando restauração de arquivos estáticos..."
    
    # Restaurar uploads
    if [ -d "$EXTRACTED_DIR/uploads" ]; then
        cp -r "$EXTRACTED_DIR/uploads" ./
        log "Uploads restaurados"
    fi
    
    # Restaurar logs
    if [ -d "$EXTRACTED_DIR/logs" ]; then
        cp -r "$EXTRACTED_DIR/logs" ./
        log "Logs restaurados"
    fi
    
    # Restaurar configurações (com backup)
    if [ -f "$EXTRACTED_DIR/.env.local" ]; then
        if [ -f ".env.local" ]; then
            cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
            log "Backup do .env.local atual criado"
        fi
        cp "$EXTRACTED_DIR/.env.local" ./
        log "Configurações restauradas"
    fi
}

# Restaurar Supabase Storage
restore_supabase_storage() {
    log "Iniciando restauração do Supabase Storage..."
    
    if [ -d "$EXTRACTED_DIR/storage" ] && command -v supabase &> /dev/null; then
        # Upload para Supabase Storage
        supabase storage upload --bucket-name "uploads" --local-path "$EXTRACTED_DIR/storage/" || warning "Falha na restauração do storage"
        log "Supabase Storage restaurado"
    else
        warning "Diretório de storage não encontrado ou Supabase CLI não disponível"
    fi
}

# Restaurar Redis
restore_redis() {
    log "Iniciando restauração do Redis..."
    
    if [ -n "$REDIS_URL" ] && [ -f "$EXTRACTED_DIR/redis.rdb" ] && command -v redis-cli &> /dev/null; then
        # Confirmar restauração
        read -p "ATENÇÃO: Isso irá substituir todos os dados do Redis atual. Continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            warning "Restauração do Redis cancelada"
            return
        fi
        
        # Restaurar Redis
        redis-cli -u "$REDIS_URL" FLUSHALL
        redis-cli -u "$REDIS_URL" --rdb "$EXTRACTED_DIR/redis.rdb" || warning "Falha na restauração do Redis"
        log "Redis restaurado"
    else
        warning "Arquivo de backup do Redis não encontrado ou Redis CLI não disponível"
    fi
}

# Verificar integridade
verify_restore() {
    log "Verificando integridade da restauração..."
    
    # Verificar conexão com banco
    if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            log "Conexão com banco de dados verificada"
        else
            warning "Falha na verificação do banco de dados"
        fi
    fi
    
    # Verificar conexão com Redis
    if [ -n "$REDIS_URL" ] && command -v redis-cli &> /dev/null; then
        redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            log "Conexão com Redis verificada"
        else
            warning "Falha na verificação do Redis"
        fi
    fi
    
    # Verificar arquivos restaurados
    if [ -d "./uploads" ]; then
        log "Uploads verificados: $(find ./uploads -type f | wc -l) arquivos"
    fi
    
    if [ -d "./logs" ]; then
        log "Logs verificados: $(find ./logs -type f | wc -l) arquivos"
    fi
}

# Limpeza
cleanup() {
    log "Limpando arquivos temporários..."
    rm -rf "$RESTORE_DIR"
    log "Limpeza concluída"
}

# Função principal
main() {
    log "Iniciando restauração do WhatsApp Professional..."
    log "Arquivo de backup: $BACKUP_FILE"
    
    check_env
    extract_backup
    check_metadata
    restore_database
    restore_static_files
    restore_supabase_storage
    restore_redis
    verify_restore
    cleanup
    
    log "Restauração concluída com sucesso!"
    log "Recomendamos reiniciar a aplicação para garantir que todas as mudanças sejam aplicadas."
}

# Executar script
main "$@"
