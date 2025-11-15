# 🚀 Configuração Rápida - Atualização Automática do Nginx

## Passo a Passo Simples

### 1. No Servidor (onde o nginx está rodando)

```bash
# 1. Instalar Python e requests (se não tiver)
sudo apt update
sudo apt install python3 python3-pip -y
pip3 install requests

# 2. Copiar o script para o servidor
# (Copie o arquivo scripts/server/update_nginx_ips.py para o servidor)

# 3. Dar permissão
chmod +x update_nginx_ips.py

# 4. Configurar variáveis de ambiente
export SUPABASE_URL="https://zamksbryvuuaxxwszdgc.supabase.co"
export SUPABASE_ANON_KEY="sua_chave_aqui"
export NGINX_CONF_PATH="/etc/nginx/nginx.conf"

# 5. Testar manualmente
sudo python3 update_nginx_ips.py
```

### 2. Configurar Cron Job (Atualização a cada 5 minutos)

```bash
sudo crontab -e
```

Adicione esta linha:
```cron
*/5 * * * * export SUPABASE_URL="https://zamksbryvuuaxxwszdgc.supabase.co" && export SUPABASE_ANON_KEY="sua_chave_aqui" && export NGINX_CONF_PATH="/etc/nginx/nginx.conf" && /usr/bin/python3 /caminho/completo/para/update_nginx_ips.py >> /var/log/nginx-ips-update.log 2>&1
```

### 3. Configurar Webhook (Atualização Imediata - Opcional)

Crie um endpoint no nginx que chama o script:

```nginx
location /api/update-nginx-ips {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # Executar script
    content_by_lua_block {
        os.execute("export SUPABASE_URL='https://zamksbryvuuaxxwszdgc.supabase.co' && export SUPABASE_ANON_KEY='sua_chave' && export NGINX_CONF_PATH='/etc/nginx/nginx.conf' && /usr/bin/python3 /caminho/para/update_nginx_ips.py")
        ngx.say("OK")
    }
}
```

### 4. No Frontend (Variável de Ambiente)

Adicione no arquivo `.env`:

```env
VITE_NGINX_UPDATE_API_URL=https://seu-servidor.com/api/update-nginx-ips
```

## ✅ Como Funciona

1. **Você cria/edita/exclui um IP** na tela de admin
2. **O frontend tenta chamar a API** de atualização (se configurada)
3. **A API executa o script Python** que:
   - Busca IPs do Supabase
   - Atualiza o nginx.conf
   - Testa a configuração
   - Recarrega o nginx
4. **Se não tiver API configurada**, mostra a configuração para copiar manualmente

## 🔒 Segurança

- O script precisa rodar como `root` para editar `/etc/nginx/nginx.conf`
- Proteja o webhook com autenticação básica
- Use HTTPS
- Mantenha as chaves seguras

## 🐛 Troubleshooting

**Erro: Permission denied**
```bash
sudo python3 update_nginx_ips.py
```

**Verificar se funcionou:**
```bash
tail -f /var/log/nginx-ips-update.log
```

**Testar nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

