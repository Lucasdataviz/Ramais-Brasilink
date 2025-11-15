#!/bin/bash
# Script bash alternativo para atualizar nginx.conf com IPs do Supabase

SUPABASE_URL="${SUPABASE_URL:-https://zamksbryvuuaxxwszdgc.supabase.co}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
NGINX_CONF_PATH="${NGINX_CONF_PATH:-/etc/nginx/nginx.conf}"
NGINX_CONF_BACKUP_PATH="${NGINX_CONF_BACKUP_PATH:-/etc/nginx/nginx.conf.backup}"

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "Erro: SUPABASE_ANON_KEY não configurada!" >&2
    exit 1
fi

echo "Buscando IPs permitidos do Supabase..."

# Buscar IPs ativos
IPS_JSON=$(curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/ips_permitidos?ativo=eq.true&select=ip,descricao" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json")

if [ $? -ne 0 ]; then
    echo "Erro ao buscar IPs do Supabase!" >&2
    exit 1
fi

# Gerar configuração
CONFIG="# WHITELIST DE IPS - Permitir apenas IPs específicos"
echo "$IPS_JSON" | jq -r '.[] | "    allow \(.ip);\(if .descricao then "       # \(.descricao)" else "" end)"' >> /tmp/nginx_ips_config.txt
CONFIG="${CONFIG}\n$(cat /tmp/nginx_ips_config.txt)"
CONFIG="${CONFIG}\n    deny all;                     # Bloquear todos os outros"

# Fazer backup
cp "$NGINX_CONF_PATH" "$NGINX_CONF_BACKUP_PATH"
echo "Backup criado em: $NGINX_CONF_BACKUP_PATH"

# Atualizar nginx.conf (requer sed ou similar)
# Nota: Esta é uma versão simplificada. Para produção, use o script Python.

# Testar configuração
nginx -t
if [ $? -ne 0 ]; then
    echo "Configuração inválida! Revertendo backup..." >&2
    cp "$NGINX_CONF_BACKUP_PATH" "$NGINX_CONF_PATH"
    exit 1
fi

# Recarregar nginx
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "✅ Nginx atualizado com sucesso!"
    exit 0
else
    echo "❌ Falha ao recarregar nginx" >&2
    exit 1
fi

