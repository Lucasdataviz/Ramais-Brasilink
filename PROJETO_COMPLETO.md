# 📋 Resumo Completo do Projeto - Ramais Brasilink

## 🎯 O Que É Este Projeto?

**Ramais Brasilink** é um sistema web moderno para gerenciamento de ramais telefônicos, departamentos, técnicos e controle de acesso por IP. O sistema permite visualizar, gerenciar e organizar informações de telefonia de forma intuitiva e profissional.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca JavaScript para interfaces
- **TypeScript 5.8.3** - Superset do JavaScript com tipagem estática
- **Vite 5.4.19** - Build tool e dev server rápido
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI baseados em Radix UI
- **React Router DOM 6.30.1** - Roteamento para SPA
- **Lucide React 0.462.0** - Biblioteca de ícones

### Backend & Banco de Dados
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL (banco de dados)
  - Realtime subscriptions (atualizações em tempo real)
  - REST API automática
  - Autenticação

### Infraestrutura
- **Docker** - Containerização
- **Nginx** - Servidor web e proxy reverso
- **Coolify** - Plataforma de deploy e gerenciamento

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Processador CSS
- **Autoprefixer** - Adiciona prefixos CSS automaticamente

---

## 📦 Estrutura do Projeto

```
Ramais-Brasilink/
├── src/
│   ├── components/          # Componentes React
│   │   ├── admin/          # Componentes do painel admin
│   │   ├── ui/             # Componentes UI (shadcn)
│   │   └── ...
│   ├── pages/              # Páginas da aplicação
│   │   ├── Index.tsx       # Dashboard principal
│   │   ├── Admin.tsx       # Painel administrativo
│   │   ├── AdminLogin.tsx  # Tela de login
│   │   └── Tecnicos.tsx    # Página de técnicos
│   ├── lib/                # Bibliotecas e utilitários
│   │   ├── supabase.ts     # Cliente Supabase e funções
│   │   ├── types.ts        # Tipos TypeScript
│   │   ├── icons.ts        # Ícones compartilhados
│   │   └── utils.ts        # Funções utilitárias
│   ├── hooks/              # React Hooks customizados
│   │   └── useRealtimeData.ts  # Hook para dados em tempo real
│   └── main.tsx            # Ponto de entrada
├── scripts/
│   ├── migrations/         # Scripts SQL de migração
│   ├── seeds/              # Scripts SQL de seed
│   ├── fixes/              # Scripts SQL de correção
│   └── server/             # Scripts do servidor
│       ├── update_nginx_ips.py  # Atualização automática do nginx
│       └── README.md
├── public/                 # Arquivos estáticos
├── nginx.conf              # Configuração do Nginx
├── Dockerfile              # Configuração Docker
└── package.json            # Dependências e scripts
```

---

## 🎨 Funcionalidades Principais

### 1. Dashboard Principal (`/`)
- **Visualização de Ramais**: Cards organizados por departamento
- **Busca**: Filtro por nome, ramal ou departamento
- **Agrupamento**: Ramais agrupados hierarquicamente (pais e filhos)
- **Tema**: Suporte a modo claro/escuro
- **Notícias**: Faixa de notícias no topo
- **Sincronização em Tempo Real**: Atualizações automáticas via Supabase Realtime

### 2. Painel Administrativo (`/admin`)
- **Gerenciamento de Ramais**: CRUD completo
- **Gerenciamento de Usuários**: Criação, edição e controle de acesso
- **Gerenciamento de Departamentos**: 
  - Criação com ícones e cores personalizadas
  - Hierarquia (departamentos pais e filhos)
  - Vinculação de ramais
  - Supervisor e coordenador
- **Gerenciamento de Técnicos**: 
  - Cadastro por cidade
  - Função e telefone
  - Cidades: Rio Verde, Viçosa, Tianguá, Frecheirinha, Infraestrutura, Araquém, Tecno
- **Gerenciamento de IPs Permitidos**:
  - Whitelist de IPs
  - Geração automática de configuração do nginx
  - Atualização automática (se configurado)
- **Logs de Auditoria**: Histórico de todas as ações

### 3. Página de Técnicos (`/tecnicos`)
- Listagem de técnicos por cidade
- Filtros e busca
- Informações de contato

### 4. Sistema de Login (`/admin/login`)
- Autenticação segura
- Interface profissional
- Controle de acesso

---

## 🔌 Integrações

### 1. Supabase
- **Banco de Dados PostgreSQL**: Armazena todos os dados
- **Realtime**: Sincronização automática de mudanças
- **REST API**: Endpoints automáticos para todas as tabelas
- **Autenticação**: Sistema de login e controle de acesso

### 2. Nginx
- **Servidor Web**: Serve os arquivos estáticos
- **Proxy Reverso**: Gerencia requisições
- **Whitelist de IPs**: Controle de acesso por IP
- **SPA Support**: Redirecionamento para index.html

### 3. Coolify
- **Deploy Automático**: CI/CD integrado
- **Gerenciamento de Containers**: Docker automatizado
- **Variáveis de Ambiente**: Configuração centralizada
- **SSL/HTTPS**: Certificados automáticos

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

1. **ramais**
   - Informações de ramais telefônicos
   - Campos: id, nome, ramal, departamento, servidor_sip, usuario, dominio, login, senha, status

2. **departamentos**
   - Organização hierárquica
   - Campos: id, nome, cor, icone, ordem, ativo, departamento_pai, supervisor, coordenador

3. **usuario_telefonia**
   - Usuários do sistema
   - Campos: id, nome, email, senha (hash), role, departamento, ativo

4. **numero_tecnicos**
   - Cadastro de técnicos
   - Campos: id, nome, telefone, descricao, tipo (cidade)

5. **ips_permitidos**
   - Whitelist de IPs
   - Campos: id, ip, descricao, ativo

6. **notificacoes**
   - Sistema de notificações
   - Campos: id, tipo, titulo, mensagem, created_at, expires_at, ativo

7. **audit_logs**
   - Logs de auditoria
   - Campos: id, user_id, action, entity_type, entity_id, old_data, new_data, ip_address

---

## 🚀 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build para desenvolvimento
npm run preview      # Preview do build de produção
npm run lint         # Executa o linter
```

### Produção
- Build automático via Coolify
- Deploy automático via Git
- SSL automático via Coolify

---

## 🔐 Variáveis de Ambiente

### Frontend
```env
VITE_SUPABASE_URL=https://zamksbryvuuaxxwszdgc.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
VITE_APP_ENV=production
VITE_NGINX_UPDATE_API_URL=https://seu-servidor.com/api/update-nginx-ips
```

### Servidor (para script de atualização do nginx)
```env
SUPABASE_URL=https://zamksbryvuuaxxwszdgc.supabase.co
SUPABASE_ANON_KEY=sua_chave_aqui
NGINX_CONF_PATH=/etc/nginx/conf.d/default.conf
```

---

## 📝 Tarefas e Funcionalidades Implementadas

### ✅ Gerenciamento de Ramais
- [x] Listagem de ramais
- [x] Criação de ramais
- [x] Edição de ramais
- [x] Exclusão de ramais
- [x] Filtro por departamento
- [x] Status ativo/inativo
- [x] Sincronização em tempo real

### ✅ Gerenciamento de Departamentos
- [x] Criação com ícones personalizados
- [x] Cores personalizadas
- [x] Hierarquia (pais e filhos)
- [x] Vinculação de ramais
- [x] Supervisor e coordenador
- [x] Ordenação customizada
- [x] Status ativo/inativo

### ✅ Gerenciamento de Usuários
- [x] Criação de usuários
- [x] Edição de usuários
- [x] Controle de acesso (roles)
- [x] Autenticação
- [x] Logs de auditoria

### ✅ Gerenciamento de Técnicos
- [x] Cadastro por cidade
- [x] Múltiplas cidades suportadas
- [x] Função e telefone
- [x] Badges coloridas por cidade

### ✅ Controle de Acesso por IP
- [x] Whitelist de IPs
- [x] Geração automática de config nginx
- [x] Atualização automática (via script)
- [x] Importação automática de IPs iniciais

### ✅ Interface e UX
- [x] Design responsivo
- [x] Tema claro/escuro
- [x] Animações suaves
- [x] Feedback visual (toasts)
- [x] Loading states
- [x] Tratamento de erros

### ✅ Sincronização em Tempo Real
- [x] Supabase Realtime para ramais
- [x] Supabase Realtime para departamentos
- [x] Atualizações automáticas na dashboard

### ✅ Segurança
- [x] Autenticação
- [x] Controle de acesso por IP
- [x] Hash de senhas (bcrypt)
- [x] Logs de auditoria
- [x] Headers de segurança no nginx

---

## 🔄 Fluxo de Dados

1. **Usuário acessa a aplicação**
   - Frontend carrega dados do Supabase
   - Inscreve-se em mudanças via Realtime

2. **Usuário faz alteração no admin**
   - Frontend envia requisição ao Supabase
   - Supabase atualiza o banco de dados
   - Realtime notifica outros clientes
   - Dashboard atualiza automaticamente

3. **Atualização de IPs**
   - Usuário cria/edita IP no admin
   - Frontend tenta chamar API de atualização
   - Script Python atualiza nginx.conf
   - Nginx é recarregado automaticamente

---

## 📚 Documentação Adicional

- `README_PRODUCAO.md` - Guia de produção
- `COOLIFY_SETUP.md` - Guia específico para Coolify
- `scripts/server/README.md` - Documentação dos scripts
- `scripts/server/SETUP_RAPIDO.md` - Setup rápido
- `CHANGELOG.md` - Histórico de mudanças

---

## 🎯 Próximas Melhorias (Sugestões)

- [ ] Exportação de dados (CSV, PDF)
- [ ] Relatórios e estatísticas
- [ ] Notificações push
- [ ] API REST completa
- [ ] Integração com sistemas de telefonia (Asterisk, FreeSWITCH)
- [ ] Dashboard com gráficos
- [ ] Backup automático
- [ ] Multi-tenant

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação nos arquivos README
2. Verifique os logs do sistema
3. Consulte a documentação do Supabase
4. Consulte a documentação do Coolify

---

## 📄 Licença

Este projeto é privado e de uso interno da Brasilink.

---

**Última atualização:** 2024
**Versão:** 1.0.0
**Mantido por:** Equipe Brasilink

