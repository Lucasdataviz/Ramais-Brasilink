# Ramais Brasilink

Sistema interno para gerenciar ramais telefônicos, departamentos, técnicos e filas de atendimento da Brasilink, com um dashboard público de consulta e um painel administrativo.

## Stack

- **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Realtime, RPC)
- **Deploy:** Docker + Coolify (proxy reverso via Traefik)

## Rodando localmente

```bash
npm install
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção (saída em dist/)
npm run preview      # preview do build de produção
npm run lint          # linter
```

Crie um `.env` na raiz com:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua_anon_key>
```

## Estrutura

```
src/
├── components/
│   ├── admin/      # telas do painel administrativo
│   ├── dashboard/  # Header, Footer, cards do dashboard público
│   └── ui/         # componentes shadcn/ui
├── pages/          # Index (dashboard), Admin, AdminLogin, Tecnicos
├── lib/            # cliente Supabase, tipos, utilitários
└── hooks/          # hooks (dados em tempo real, etc.)

scripts/
├── migrations/     # migrações SQL (rodar sql_security_hardening.sql é obrigatório)
├── seeds/          # dados iniciais
├── fixes/          # correções pontuais de schema
└── server/         # automação de servidor (whitelist de IP via Traefik)
```

## Banco de dados

O schema e as políticas de segurança (RLS, sessões de admin, hash de senha) vivem em `scripts/`. Veja `scripts/README.md` para a ordem de execução — em particular, **`scripts/migrations/sql_security_hardening.sql` precisa estar aplicado** antes de usar o sistema em produção; sem ele, o login e o controle de acesso não funcionam como esperado.

## Deploy

A aplicação sobe via Docker (`Dockerfile`) atrás do Coolify, que usa **Traefik** como proxy reverso — não Nginx puro. O `nginx.conf` do container só serve os arquivos estáticos e cabeçalhos de segurança; a whitelist de IP é feita por labels do Traefik, geradas a partir da tabela `ips_permitidos` (ver `scripts/server/TRAEFIK_SETUP.md`).

Variáveis de ambiente no Coolify:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua_anon_key>
```

Para a automação de IP (`scripts/server/update_traefik_ips.py`), use a variável de servidor `SUPABASE_SERVICE_ROLE_KEY` (não a anon key) — a tabela `ips_permitidos` não é pública.

## Histórico

Ver `CHANGELOG.md`.
