# Scripts SQL - RAMAIS-BRASILINK

Execute estes scripts no **Supabase SQL Editor** antes do primeiro deploy.

## ⚙️ Ordem de Execução

### 1️⃣ Estrutura (Criar Tabelas)
Execute primeiro para criar a estrutura do banco:

- `sql_create_departamento_ramais_table.sql`
- `sql_create_departamentos_table.sql`
- `sql_create_notificacoes_table.sql`
- `sql_create_numero_tecnicos.sql`

### 2️⃣ Dados Iniciais (Seeds)
Execute depois de criar as tabelas:

- `sql_add_departamento_pai.sql`
- `sql_add_departamento_usuario_telefonia.sql`
- `sql_add_supervisor_coordenador_departamento.sql`

### 3️⃣ Correções e Políticas (Fixes)

⚠️ Os scripts antigos que desabilitavam RLS, comparavam senha em texto puro
ou liberavam RPCs de escrita para qualquer pessoa com a anon key (os que
existiam em `scripts/fixes/`, além de `sql_solucao_completa.sql` e
`sql_update_senha_texto_simples.sql`) foram **removidos do repositório** por
serem inseguros e estarem superados. Use em vez disso:

- **`migrations/sql_security_hardening.sql`** - hash de senha (bcrypt),
  sessões de admin reais validadas no banco, RLS travando todas as tabelas
  sensíveis, e a view `ramais_publico` (sem credenciais SIP) para o
  dashboard público.
- `migrations/sql_fix_pgcrypto_search_path.sql` - correção necessária após
  o hardening (o Supabase instala o pgcrypto no schema `extensions`, não em
  `public`).

Se você ainda não trocou a senha do usuário `luccsilva07@gmail.com` pelo
painel Admin > Usuários desde o hardening: faça isso agora — a senha antiga
ficou exposta em texto puro no histórico do Git público e deve ser
considerada comprometida.

- `fixes/sql_fix_status_ramais.sql`

### 4️⃣ Scripts Utilitários
Execute conforme necessário:

- `sql_verificar_estrutura_ramais.sql` - Verificar estrutura

## 🔒 Segurança

⚠️ **IMPORTANTE:** Estes scripts não são executados automaticamente no deploy.
Devem ser executados manualmente no Supabase antes de usar a aplicação.

⚠️ Depois do hardening, o script de automação de servidor
(`scripts/server/update_traefik_ips.py`) precisa da **Service Role Key** do
Supabase (não mais a anon key), pois a tabela `ips_permitidos` deixou de ser
pública. Veja `scripts/server/TRAEFIK_SETUP.md`.

## 📍 Como Executar

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole cada script
5. Execute em ordem

## 📝 Observações

- Estes scripts já foram executados no banco atual
- Servem como backup e documentação
- Úteis para criar novos ambientes (produção, teste, etc)