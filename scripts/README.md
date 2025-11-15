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
Execute para configurar permissões e corrigir dados:

- `sql_fix_rls_policies.sql`
- `sql_fix_ramais_usuario_telefonia.sql`
- `sql_fix_status_ramais.sql`

### 4️⃣ Scripts Utilitários
Execute conforme necessário:

- `sql_solucao_completa.sql` - Solução completa (se precisar resetar tudo)
- `sql_update_senha_texto_simples.sql` - Atualizar senhas
- `sql_verificar_estrutura_ramais.sql` - Verificar estrutura

## 🔒 Segurança

⚠️ **IMPORTANTE:** Estes scripts não são executados automaticamente no deploy.
Devem ser executados manualmente no Supabase antes de usar a aplicação.

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