# 🚀 Guia Completo - Coolify

## ⚠️ IMPORTANTE: Coolify usa Traefik, não Nginx!

O Coolify usa **Traefik** como proxy reverso. Para atualização de IPs, veja `scripts/server/TRAEFIK_SETUP.md`

## Como Executar Comandos no Coolify

### 1. Via Interface Web do Coolify

1. **Acesse seu projeto no Coolify**
2. **Vá em "Executables" ou "One-Click Commands"**
3. **Crie um novo comando** ou use o terminal integrado

### 2. Via Terminal SSH (Recomendado)

```bash
# 1. Conecte-se ao servidor via SSH
ssh usuario@seu-servidor

# 2. Acesse o container do Coolify
# O Coolify cria containers Docker, então você precisa acessar o container específico

# Listar containers
docker ps

# Acessar o container (substitua CONTAINER_ID)
docker exec -it CONTAINER_ID /bin/sh

# Ou se o Coolify usa docker-compose
cd /data/coolify/proxy
docker-compose exec nome-do-servico /bin/sh
```

### 3. Executar Script de Atualização do Nginx

#### Opção A: Dentro do Container Nginx

```bash
# 1. Acesse o container do nginx
docker exec -it nginx-container /bin/sh

# 2. Instale Python (se não tiver)
apk add python3 py3-pip
pip3 install requests

# 3. Copie o script para o container
# (Você precisa copiar o arquivo update_nginx_ips.py para dentro do container)
docker cp scripts/server/update_nginx_ips.py nginx-container:/tmp/

# 4. Configure variáveis e execute
export SUPABASE_URL="https://zamksbryvuuaxxwszdgc.supabase.co"
export SUPABASE_ANON_KEY="sua_chave_aqui"
export NGINX_CONF_PATH="/etc/nginx/conf.d/default.conf"

python3 /tmp/update_nginx_ips.py
```

#### Opção B: Via Volume Mount (Melhor para Coolify)

1. **No Coolify, configure um volume:**
   - Vá em "Volumes" do seu projeto
   - Adicione um volume que monte o script

2. **Configure variáveis de ambiente no Coolify:**
   - Vá em "Environment Variables"
   - Adicione:
     ```
     SUPABASE_URL=https://zamksbryvuuaxxwszdgc.supabase.co
     SUPABASE_ANON_KEY=sua_chave_aqui
     NGINX_CONF_PATH=/etc/nginx/conf.d/default.conf
     ```

3. **Crie um script de inicialização:**
   - No Coolify, vá em "Post Deploy Commands"
   - Adicione:
     ```bash
     apk add python3 py3-pip
     pip3 install requests
     python3 /app/scripts/server/update_nginx_ips.py
     ```

### 4. Configurar Cron Job no Coolify

#### Via Dockerfile (Recomendado)

Adicione ao seu `Dockerfile`:

```dockerfile
# Instalar cron e Python
RUN apk add --no-cache python3 py3-pip dcron
RUN pip3 install requests

# Copiar script
COPY scripts/server/update_nginx_ips.py /usr/local/bin/
RUN chmod +x /usr/local/bin/update_nginx_ips.py

# Configurar cron
RUN echo "*/5 * * * * /usr/local/bin/update_nginx_ips.py >> /var/log/nginx-ips-update.log 2>&1" | crontab -

# Iniciar cron
CMD crond && nginx -g "daemon off;"
```

#### Via Init Script

Crie um arquivo `init.sh`:

```bash
#!/bin/sh
# Instalar dependências
apk add --no-cache python3 py3-pip dcron
pip3 install requests

# Configurar cron
echo "*/5 * * * * export SUPABASE_URL='$SUPABASE_URL' && export SUPABASE_ANON_KEY='$SUPABASE_ANON_KEY' && export NGINX_CONF_PATH='/etc/nginx/conf.d/default.conf' && /usr/local/bin/update_nginx_ips.py >> /var/log/nginx-ips-update.log 2>&1" | crontab -

# Iniciar cron e nginx
crond
exec nginx -g "daemon off;"
```

### 5. Configurar Webhook no Coolify

1. **No Coolify, vá em "Webhooks"**
2. **Crie um novo webhook:**
   - URL: `https://seu-servidor.com/api/update-nginx-ips`
   - Método: POST
   - Autenticação: Basic Auth (recomendado)

3. **Configure o nginx para receber o webhook:**

Adicione no `nginx.conf`:

```nginx
location /api/update-nginx-ips {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # Executar script
    content_by_lua_block {
        os.execute("export SUPABASE_URL='$SUPABASE_URL' && export SUPABASE_ANON_KEY='$SUPABASE_ANON_KEY' && /usr/local/bin/update_nginx_ips.py")
        ngx.say("OK")
    }
}
```

### 6. Variáveis de Ambiente no Coolify

No painel do Coolify, adicione estas variáveis:

```
VITE_SUPABASE_URL=https://zamksbryvuuaxxwszdgc.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_APP_ENV=production
VITE_NGINX_UPDATE_API_URL=https://seu-servidor.com/api/update-nginx-ips
SUPABASE_URL=https://zamksbryvuuaxxwszdgc.supabase.co
SUPABASE_ANON_KEY=sua_chave_aqui
NGINX_CONF_PATH=/etc/nginx/conf.d/default.conf
```

### 7. Build e Deploy no Coolify

1. **Tipo de Aplicação:** Static Site ou Dockerfile
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Port:** `80`
5. **Health Check:** `/` (opcional)

### 8. Verificar Logs

```bash
# Logs do container
docker logs nome-do-container

# Logs do cron
docker exec nome-do-container tail -f /var/log/nginx-ips-update.log

# Logs do nginx
docker exec nome-do-container tail -f /var/log/nginx/error.log
```

## 🔧 Comandos Úteis no Coolify

### Acessar Terminal do Container
```bash
# Via Coolify UI: Vá em "Terminal" do seu projeto
# Via SSH:
docker exec -it $(docker ps -q -f name=seu-projeto) /bin/sh
```

### Reiniciar Serviço
```bash
# Via Coolify UI: Botão "Restart"
# Via SSH:
docker restart nome-do-container
```

### Ver Variáveis de Ambiente
```bash
docker exec nome-do-container env | grep SUPABASE
```

### Testar Script Manualmente
```bash
docker exec nome-do-container python3 /usr/local/bin/update_nginx_ips.py
```

## 📝 Checklist de Configuração

- [ ] Variáveis de ambiente configuradas no Coolify
- [ ] Script `update_nginx_ips.py` copiado para o container
- [ ] Python e requests instalados no container
- [ ] Cron job configurado (se usar atualização automática)
- [ ] Webhook configurado (se usar atualização imediata)
- [ ] Permissões corretas no script
- [ ] Nginx.conf com permissão de escrita
- [ ] Logs configurados

## 🆘 Troubleshooting

### Erro: "Permission denied"
```bash
# Dar permissão ao script
docker exec nome-do-container chmod +x /usr/local/bin/update_nginx_ips.py
```

### Erro: "nginx: command not found"
```bash
# O script precisa rodar dentro do container nginx
docker exec nginx-container python3 /usr/local/bin/update_nginx_ips.py
```

### Erro: "Cannot write to nginx.conf"
```bash
# Verificar permissões
docker exec nome-do-container ls -la /etc/nginx/conf.d/
# Se necessário, ajustar permissões no Dockerfile
```

### Script não executa automaticamente
```bash
# Verificar se o cron está rodando
docker exec nome-do-container ps aux | grep cron

# Verificar logs do cron
docker exec nome-do-container cat /var/log/nginx-ips-update.log
```

