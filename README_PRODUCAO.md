# Guia de Produção - Ramais Brasilink

## Configuração para Coolify

Este projeto está preparado para ser implantado no Coolify sem necessidade de configurações adicionais.

### Pré-requisitos

- Node.js 18+ ou superior
- npm ou yarn
- Conta no Supabase
- Conta no Coolify (opcional, para deploy)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_APP_ENV=production
```

### Instalação

```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm run build:dev` - Cria o build de desenvolvimento
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

### Deploy no Coolify

1. **Criar um novo projeto no Coolify**
   - Selecione "Static Site" ou "Node.js" (dependendo da configuração)
   - Conecte seu repositório Git

2. **Configurar variáveis de ambiente no Coolify**
   - Adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
   - Configure `VITE_APP_ENV=production`

3. **Configurar o build**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node Version: 18+ ou superior

4. **Configurar o servidor web**
   - Se usar Nginx, configure para servir os arquivos estáticos da pasta `dist`
   - Certifique-se de que todas as rotas sejam redirecionadas para `index.html` (SPA)

### Banco de Dados

Execute os seguintes arquivos SQL no Supabase na ordem:

1. `sql_create_departamentos_table.sql` - Cria a tabela de departamentos
2. `sql_add_supervisor_coordenador_departamentos.sql` - Adiciona campos de supervisor e coordenador
3. `sql_create_departamento_ramais_table.sql` - Cria tabela de relacionamento (opcional)
4. `sql_create_numero_tecnicos.sql` - Cria a tabela de técnicos

### Estrutura do Banco de Dados

#### Tabelas Principais

- `ramais` - Armazena os ramais do sistema
- `departamentos` - Armazena os departamentos
- `usuario_telefonia` - Armazena os usuários administrativos
- `numero_tecnicos` - Armazena os números dos técnicos

#### Relacionamentos

- Um departamento pode ter múltiplos ramais
- Um ramal pertence a um departamento
- Um departamento pode ter um supervisor e um coordenador
- Um técnico pode ter múltiplos números

### Funcionalidades

#### Departamentos

- Criar departamentos com ícone, cor, supervisor e coordenador
- Vincular ramais existentes a departamentos
- Ativar/desativar departamentos
- Editar departamentos

#### Ramais

- Criar ramais com status ativo/inativo
- Editar ramais
- Vincular ramais a departamentos
- Visualizar configurações SIP

#### Técnicos

- Criar técnicos com número e descrição
- Editar técnicos
- Ativar/desativar técnicos

#### Usuários

- Criar usuários administrativos
- Editar usuários
- Ativar/desativar usuários
- Vincular usuários a departamentos

### Troubleshooting

#### Problema: Status sempre desativado ao criar

**Solução**: Verifique se o campo `status` na tabela `ramais` está definido como `text` e não como `boolean`. O valor deve ser 'ativo' ou 'inativo'.

#### Problema: Botão não funciona na aba de usuários

**Solução**: Certifique-se de que o campo `ativo` na tabela `usuario_telefonia` está definido como `boolean` e não como `text`.

#### Problema: Erro ao criar departamento

**Solução**: Certifique-se de que a tabela `departamentos` existe no Supabase. Execute o arquivo `sql_create_departamentos_table.sql` se necessário.

#### Problema: Erro ao criar técnico

**Solução**: Certifique-se de que a tabela `numero_tecnicos` existe no Supabase. Execute o arquivo `sql_create_numero_tecnicos.sql` se necessário.

### Suporte

Para mais informações, consulte a documentação do Supabase e do Coolify.

