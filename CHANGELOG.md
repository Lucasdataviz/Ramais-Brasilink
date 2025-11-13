# Changelog - Ramais Brasilink

## Mudanças Implementadas

### 1. Preparação para Produção (Coolify)
- ✅ Criado arquivo `README_PRODUCAO.md` com instruções para deploy no Coolify
- ✅ Scripts npm configurados para produção (`npm run build`)
- ✅ Variáveis de ambiente documentadas

### 2. Departamentos - Nova Estrutura
- ✅ Removidos campos de usuários e ramais (nome, senha, servidor) do formulário de criação
- ✅ Adicionado seletor de ramais existentes (múltipla seleção)
- ✅ Adicionados campos de supervisor e coordenador
- ✅ Adicionado seletor de ícones predefinidos (100+ ícones)
- ✅ Adicionado seletor de cores (16 cores predefinidas + seletor manual)
- ✅ Tabela exibe apenas: Ícone, Nome, Ramais vinculados, Supervisor, Coordenador, Status
- ✅ Suporte para criar departamentos vazios (sem ramais)
- ✅ Vincular/desvincular ramais existentes a departamentos

### 3. Supervisão e Coordenação
- ✅ Campos `supervisor` e `coordenador` adicionados na tabela `departamentos`
- ✅ SQL para adicionar campos (`sql_add_supervisor_coordenador_departamentos.sql`)
- ✅ Interface atualizada para exibir supervisor e coordenador

### 4. Status Ativo/Inativo
- ✅ Permitido criar registros com status ativo ou inativo diretamente
- ✅ Select de status disponível em todos os formulários de criação/edição
- ✅ SQL para corrigir problemas de status (`sql_fix_status_ramais.sql`)
- ✅ Status padrão definido como 'ativo' em todos os formulários

### 5. Correção do Botão na Aba de Usuários
- ✅ Corrigido problema do botão de toggle status não funcionar
- ✅ Adicionado `preventDefault` e `stopPropagation` no evento onClick
- ✅ Corrigida lógica de verificação de status (ativo/inativo)

### 6. Ícones e Cores nos Cards
- ✅ Adicionados 100+ ícones predefinidos
- ✅ Seletor de cores com 16 cores predefinidas
- ✅ Seletor manual de cores (input type="color")
- ✅ Possibilidade de digitar emoji personalizado
- ✅ Ícones e cores exibidos nos cards de departamentos

### 7. Técnicos - Nova Funcionalidade
- ✅ Criada tabela `numero_tecnicos` no banco de dados
- ✅ SQL para criar tabela (`sql_create_numero_tecnicos.sql`)
- ✅ Componente `TecnicosManager` criado
- ✅ Interface para gerenciar técnicos (CRUD completo)
- ✅ Campos: Nome, Número, Descrição, Status
- ✅ Aba "Técnicos" adicionada no painel administrativo

### 8. Banco de Dados
- ✅ SQL para criar tabela `departamentos` (`sql_create_departamentos_table.sql`)
- ✅ SQL para criar tabela `departamento_ramais` (opcional) (`sql_create_departamento_ramais_table.sql`)
- ✅ SQL para criar tabela `numero_tecnicos` (`sql_create_numero_tecnicos.sql`)
- ✅ SQL para adicionar campos supervisor/coordenador (`sql_add_supervisor_coordenador_departamentos.sql`)
- ✅ SQL para corrigir problemas de status (`sql_fix_status_ramais.sql`)

### 9. Interface e UX
- ✅ Melhorada a interface de gerenciamento de departamentos
- ✅ Adicionado ScrollArea para listas longas
- ✅ Adicionado Checkbox para seleção múltipla de ramais
- ✅ Melhorada a visualização de ramais vinculados nos cards
- ✅ Adicionados badges para supervisor e coordenador

## Arquivos Modificados

### Componentes
- `src/components/admin/DepartamentosManager.tsx` - Completamente reescrito
- `src/components/admin/UsersManager.tsx` - Corrigido botão de toggle status
- `src/components/admin/TecnicosManager.tsx` - Novo componente
- `src/pages/Admin.tsx` - Adicionada aba de técnicos

### Bibliotecas
- `src/lib/types.ts` - Adicionadas interfaces `NumeroTecnico` e campos `supervisor`/`coordenador` em `Departamento`
- `src/lib/supabase.ts` - Adicionadas funções para gerenciar técnicos

### SQL
- `sql_create_numero_tecnicos.sql` - Novo
- `sql_create_departamentos_table.sql` - Novo
- `sql_create_departamento_ramais_table.sql` - Novo
- `sql_add_supervisor_coordenador_departamentos.sql` - Novo
- `sql_fix_status_ramais.sql` - Novo

### Documentação
- `README_PRODUCAO.md` - Novo
- `CHANGELOG.md` - Este arquivo

## Próximos Passos

1. **Executar SQLs no Supabase:**
   - Execute os arquivos SQL na ordem documentada no `README_PRODUCAO.md`

2. **Verificar Status no Banco de Dados:**
   - Verifique se o campo `status` na tabela `ramais` está como `text` e não `boolean`
   - Execute `sql_fix_status_ramais.sql` se necessário

3. **Configurar Variáveis de Ambiente:**
   - Crie arquivo `.env` com as variáveis necessárias
   - Configure no Coolify se for fazer deploy

4. **Testar Funcionalidades:**
   - Criar departamentos com ícones e cores
   - Vincular ramais existentes a departamentos
   - Adicionar supervisor e coordenador
   - Criar técnicos
   - Verificar se o status está funcionando corretamente

## Notas Importantes

- O sistema mantém compatibilidade com a estrutura antiga (departamentos baseados em ramais)
- Se a tabela `departamentos` não existir, o sistema usa a função `getDepartamentosFromRamais` como fallback
- Os departamentos podem ser criados vazios (sem ramais) e os ramais podem ser vinculados depois
- O campo `status` deve ser `text` com valores 'ativo' ou 'inativo', não `boolean`

## Problemas Conhecidos

- Se o campo `status` na tabela `ramais` for `boolean`, o sistema pode não funcionar corretamente
- Execute `sql_fix_status_ramais.sql` para corrigir este problema

## Suporte

Para mais informações, consulte:
- `README_PRODUCAO.md` - Guia de produção e deploy
- Documentação do Supabase
- Documentação do Coolify

