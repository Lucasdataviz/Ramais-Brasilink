# 🚀 Configuração Traefik + Coolify - Atualização Automática de IPs

## ⚠️ IMPORTANTE: Coolify usa Traefik, não Nginx!

O Coolify usa **Traefik** como proxy reverso, não Nginx. A configuração é diferente!

---

## 📋 Como Funciona no Coolify

### 1. Traefik no Coolify

O Coolify gerencia o Traefik automaticamente. Para adicionar IP Whitelist, você precisa:

1. **Adicionar Labels Docker** no seu serviço
2. **Ou usar arquivo de configuração dinâmica** do Traefik

---

## 🔧 Opção 1: Via Labels Docker (Recomendado no Coolify)

### Passo a Passo:

1. **No Coolify, vá no seu serviço**
2. **Vá em "Environment" ou "Labels"**
3. **Adicione estas labels:**

```yaml
traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange=168.228.178.187,168.228.176.19
traefik.http.routers.seu-servico.middlewares=ipwhitelist
```

**Substitua:**
- `seu-servico` pelo nome do seu router no Traefik
- Os IPs pela lista de IPs permitidos (separados por vírgula)

### Atualizar IPs Automaticamente:

O script `update_traefik_ips.py` gera um arquivo com as labels atualizadas:

```bash
# Executar script
python3 scripts/server/update_traefik_ips.py

# O script gera: /data/coolify/proxy/ipwhitelist-labels.txt
# Copie as labels e cole no Coolify
```

---

## 🔧 Opção 2: Via Arquivo de Configuração Dinâmica

### 1. Configurar Traefik para ler arquivo dinâmico

No Coolify, adicione volume para configuração dinâmica:

```yaml
volumes:
  - /data/coolify/proxy/traefik/dynamic:/etc/traefik/dynamic:ro
```

### 2. Criar arquivo de configuração

O script `update_traefik_ips.py` cria automaticamente:

```yaml
# /etc/traefik/dynamic/ipwhitelist.yml
http:
  middlewares:
    ipwhitelist:
      ipWhiteList:
        sourceRange:
          - 168.228.178.187
          - 168.228.176.19
```

### 3. Aplicar middleware no seu serviço

No Coolify, adicione label:

```yaml
traefik.http.routers.seu-servico.middlewares=ipwhitelist
```

---

## 🚀 Script de Atualização Automática

### Instalação

```bash
# 1. Instalar dependências
pip3 install requests pyyaml

# 2. Configurar variáveis
export SUPABASE_URL="https://zamksbryvuuaxxwszdgc.supabase.co"
export SUPABASE_ANON_KEY="sua_chave_aqui"
export TRAEFIK_DYNAMIC_CONFIG_PATH="/data/coolify/proxy/traefik/dynamic/ipwhitelist.yml"
export COOLIFY_PROXY_PATH="/data/coolify/proxy"

# 3. Dar permissão
chmod +x scripts/server/update_traefik_ips.py

# 4. Testar
python3 scripts/server/update_traefik_ips.py
```

### Configurar Cron Job

```bash
sudo crontab -e
```

Adicione:
```cron
*/5 * * * * export SUPABASE_URL="..." && export SUPABASE_ANON_KEY="..." && /usr/bin/python3 /caminho/para/update_traefik_ips.py >> /var/log/traefik-ips-update.log 2>&1
```

---

## 📝 Configuração no Coolify

### Método 1: Labels no Serviço

1. Acesse seu serviço no Coolify
2. Vá em "Environment" ou "Docker Labels"
3. Adicione:

```
traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange=IP1,IP2,IP3
traefik.http.routers.ramais-brasilink.middlewares=ipwhitelist
```

### Método 2: Via Arquivo (Requer acesso ao servidor)

1. Execute o script para gerar o arquivo
2. Monte o volume no Traefik
3. O Traefik detecta mudanças automaticamente

---

## 🔄 Integração com Frontend

O frontend já está configurado para chamar a API de atualização. Configure:

```env
VITE_NGINX_UPDATE_API_URL=https://seu-servidor.com/api/update-traefik-ips
```

**Nota:** O nome da variável ainda é `NGINX_UPDATE_API_URL` por compatibilidade, mas funciona com Traefik também.

---

## 🆚 Diferenças: Nginx vs Traefik

| Nginx | Traefik |
|-------|---------|
| Arquivo: `nginx.conf` | Labels Docker ou arquivo YAML |
| Comando: `nginx -t` | Detecção automática |
| Reload: `systemctl reload nginx` | Detecção automática ou API |
| Sintaxe: `allow IP; deny all;` | `ipWhiteList.sourceRange: [IPs]` |

---

## ✅ Checklist

- [ ] Script `update_traefik_ips.py` instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Labels adicionadas no Coolify
- [ ] Volume montado (se usar arquivo)
- [ ] Cron job configurado (opcional)
- [ ] Testado manualmente

---

## 🐛 Troubleshooting

### Labels não funcionam
- Verifique se o nome do router está correto
- Verifique se o Traefik está configurado no Coolify
- Veja logs: `docker logs traefik`

### Arquivo não é detectado
- Verifique permissões do arquivo
- Verifique se o volume está montado corretamente
- Veja logs: `docker logs traefik`

### IPs não são bloqueados
- Verifique se o middleware está aplicado ao router correto
- Teste com `curl -H "X-Forwarded-For: IP_TESTE" https://seu-site.com`
- Veja logs do Traefik

---

## 📚 Referências

- [Traefik IP Whitelist](https://doc.traefik.io/traefik/middlewares/http/ipwhitelist/)
- [Coolify Documentation](https://coolify.io/docs)
- [Docker Labels](https://docs.docker.com/config/labels-custom-metadata/)

