# Scripts de Atualização Automática do Nginx

Estes scripts atualizam automaticamente o `nginx.conf` com os IPs permitidos do banco de dados Supabase.

## Opção 1: Script Python (Recomendado)

### Instalação

1. **Instalar dependências:**
```bash
pip3 install requests
```

2. **Configurar variáveis de ambiente:**
```bash
export SUPABASE_URL="https://zamksbryvuuaxxwszdgc.supabase.co"
export SUPABASE_ANON_KEY="sua_chave_aqui"
export NGINX_CONF_PATH="/etc/nginx/nginx.conf"
```

3. **Dar permissão de execução:**
```bash
chmod +x scripts/server/update_nginx_ips.py
```

4. **Testar manualmente:**
```bash
sudo python3 scripts/server/update_nginx_ips.py
```

### Configurar como Cron Job (Atualização Automática)

Para atualizar automaticamente a cada 5 minutos:

```bash
sudo crontab -e
```

Adicione:
```cron
*/5 * * * * /usr/bin/python3 /caminho/para/projeto/scripts/server/update_nginx_ips.py >> /var/log/nginx-ips-update.log 2>&1
```

### Configurar como Webhook (Atualização Imediata)

1. **Criar endpoint webhook no servidor:**
```bash
# Criar arquivo webhook
sudo nano /usr/local/bin/nginx-ips-webhook.sh
```

Conteúdo:
```bash
#!/bin/bash
export SUPABASE_URL="https://zamksbryvuuaxxwszdgc.supabase.co"
export SUPABASE_ANON_KEY="sua_chave_aqui"
export NGINX_CONF_PATH="/etc/nginx/nginx.conf"
/usr/bin/python3 /caminho/para/projeto/scripts/server/update_nginx_ips.py
```

2. **Dar permissão:**
```bash
sudo chmod +x /usr/local/bin/nginx-ips-webhook.sh
```

3. **Configurar nginx para receber webhook:**
```nginx
location /api/update-nginx-ips {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://127.0.0.1:8080/webhook;
}
```

4. **Criar serviço systemd (opcional):**
```ini
[Unit]
Description=Nginx IPs Update Webhook
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 -m http.server 8080 --bind 127.0.0.1
Restart=always

[Install]
WantedBy=multi-user.target
```

## Opção 2: Usar Supabase Edge Functions

1. **Criar Edge Function no Supabase:**
   - Acesse o dashboard do Supabase
   - Vá em Edge Functions
   - Crie uma nova função chamada `update-nginx-ips`

2. **Configurar webhook no frontend:**
   - Quando criar/editar/deletar IP, chamar a Edge Function
   - A Edge Function executa o script no servidor

## Integração com o Frontend

O frontend já está preparado para chamar uma API. Adicione a URL da API nas variáveis de ambiente:

```env
VITE_NGINX_UPDATE_API_URL=https://seu-servidor.com/api/update-nginx-ips
```

## Segurança

⚠️ **IMPORTANTE:**
- O script precisa rodar como root para editar `/etc/nginx/nginx.conf`
- Proteja o webhook com autenticação
- Use HTTPS para todas as comunicações
- Mantenha as chaves do Supabase seguras

## Troubleshooting

### Erro: "Permission denied"
```bash
sudo chmod +x scripts/server/update_nginx_ips.py
sudo python3 scripts/server/update_nginx_ips.py
```

### Erro: "nginx: command not found"
```bash
# Adicione o caminho do nginx ao PATH
export PATH=$PATH:/usr/sbin
```

### Verificar logs
```bash
tail -f /var/log/nginx-ips-update.log
```

### Testar manualmente
```bash
# Ver IPs atuais no banco
curl "${SUPABASE_URL}/rest/v1/ips_permitidos?ativo=eq.true" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"

# Testar nginx
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx
```

