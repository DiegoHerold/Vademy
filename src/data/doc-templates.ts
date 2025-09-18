export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  suggestedPath: string;
  content: string;
}

export const docTemplates: DocTemplate[] = [
  {
    id: 'readme-basic',
    name: 'README Básico',
    description: 'Template padrão para documentação inicial do projeto',
    suggestedPath: 'README.md',
    content: `---
summary: Documentação principal do projeto
---

# Nome do Projeto

Breve descrição do que o projeto faz e seu propósito principal.

## Características

- ✨ Funcionalidade principal
- 🚀 Performance otimizada
- 📱 Interface responsiva
- 🔒 Seguro e confiável

## Instalação Rápida

\`\`\`bash
# Clone o repositório
git clone <url-do-repo>

# Instale as dependências
npm install

# Execute o projeto
npm run dev
\`\`\`

## Como Usar

1. Primeiro passo
2. Segundo passo
3. Terceiro passo

## Contribuindo

Contribuições são bem-vindas! Veja nosso [guia de contribuição](CONTRIBUTING.md).

## Licença

Este projeto está sob a licença MIT.`
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Guia completo para iniciantes começarem com o projeto',
    suggestedPath: 'docs/getting-started.md',
    content: `---
summary: Guia completo para começar a usar o projeto
---

# Getting Started

Este guia vai te ajudar a configurar e usar o projeto pela primeira vez.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [ ] Node.js (versão 18 ou superior)
- [ ] npm ou yarn
- [ ] Git

## Configuração Inicial

### 1. Clone o Repositório

\`\`\`bash
git clone <url-do-repositorio>
cd nome-do-projeto
\`\`\`

### 2. Instale as Dependências

\`\`\`bash
npm install
\`\`\`

### 3. Configure o Ambiente

\`\`\`bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
\`\`\`

### 4. Execute o Projeto

\`\`\`bash
npm run dev
\`\`\`

## Próximos Passos

- [ ] Explore a [documentação da API](api-reference.md)
- [ ] Veja os [exemplos práticos](examples.md)
- [ ] Configure seu [ambiente de desenvolvimento](development.md)

## Precisa de Ajuda?

- 📖 Consulte nossa [FAQ](faq.md)
- 🐛 Reporte bugs em [Issues](issues.md)
- 💬 Participe das discussões na comunidade`
  },
  {
    id: 'installation',
    name: 'Instalação',
    description: 'Guia detalhado de instalação e configuração',
    suggestedPath: 'docs/installation.md',
    content: `---
summary: Guia detalhado de instalação e configuração do projeto
---

# Instalação

## Requisitos do Sistema

| Requisito | Versão Mínima | Recomendada |
|-----------|---------------|-------------|
| Node.js   | 16.x          | 18.x        |
| npm       | 8.x           | 9.x         |
| Memória   | 4GB           | 8GB         |

## Métodos de Instalação

### Via npm (Recomendado)

\`\`\`bash
npm install nome-do-projeto
\`\`\`

### Via Yarn

\`\`\`bash
yarn add nome-do-projeto
\`\`\`

### Instalação Manual

1. Baixe o código fonte
2. Extraia os arquivos
3. Execute a instalação:

\`\`\`bash
cd nome-do-projeto
npm install
npm run build
\`\`\`

## Configuração

### Variáveis de Ambiente

Crie um arquivo \`.env\` na raiz do projeto:

\`\`\`env
# Configurações básicas
NODE_ENV=development
PORT=3000

# Banco de dados
DATABASE_URL="file:./dev.db"

# Autenticação
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### Banco de Dados

\`\`\`bash
# Configurar o banco
npx prisma db push

# (Opcional) Popular com dados de exemplo
npm run seed
\`\`\`

## Verificação da Instalação

Execute o comando de teste para verificar se tudo está funcionando:

\`\`\`bash
npm run test
npm run dev
\`\`\`

Se tudo estiver correto, você verá a mensagem de sucesso no terminal.

## Solução de Problemas

### Erro de Permissões

\`\`\`bash
sudo npm install -g nome-do-projeto
\`\`\`

### Problemas com Dependências

\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Porta em Uso

Altere a porta no arquivo \`.env\` ou use:

\`\`\`bash
PORT=3001 npm run dev
\`\`\``
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Perguntas frequentes e suas respostas',
    suggestedPath: 'docs/faq.md',
    content: `---
summary: Perguntas frequentes sobre o projeto
---

# Perguntas Frequentes (FAQ)

## Geral

### O que é este projeto?

Este projeto é uma solução para [descreva brevemente o propósito].

### É gratuito para usar?

Sim, este projeto é open source e gratuito para uso pessoal e comercial.

### Qual a licença?

O projeto está licenciado sob a licença MIT.

## Instalação e Configuração

### Quais são os requisitos mínimos?

- Node.js 16+ 
- 4GB de RAM
- 1GB de espaço em disco

### Como atualizar para a versão mais recente?

\`\`\`bash
npm update nome-do-projeto
\`\`\`

### Posso usar com TypeScript?

Sim! O projeto tem suporte completo ao TypeScript.

## Uso e Funcionalidades

### Como faço para [funcionalidade comum]?

1. Primeiro passo
2. Segundo passo
3. Resultado esperado

### Existe limite de [recurso]?

Por padrão não há limites, mas você pode configurar limites personalizados.

### Como integrar com [serviço externo]?

Consulte nossa [documentação de integrações](integrations.md).

## Problemas Comuns

### Erro: "Cannot find module"

\`\`\`bash
npm install
\`\`\`

### Performance lenta

- Verifique se está usando a versão mais recente
- Considere aumentar a memória disponível
- Consulte nosso [guia de otimização](optimization.md)

### Problemas de autenticação

1. Verifique suas credenciais
2. Confirme as variáveis de ambiente
3. Consulte os logs para mais detalhes

## Suporte

### Onde posso obter ajuda?

- 📖 Documentação completa
- 🐛 Issues no GitHub
- 💬 Discussões da comunidade
- 📧 Email de suporte

### Como reportar um bug?

1. Verifique se já não foi reportado
2. Use o template de issue
3. Inclua informações do sistema
4. Descreva os passos para reproduzir

### Como sugerir uma funcionalidade?

Abra uma issue com a tag "feature request" e descreva detalhadamente sua sugestão.`
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Guia para resolver problemas comuns',
    suggestedPath: 'docs/troubleshooting.md',
    content: `---
summary: Guia para diagnosticar e resolver problemas comuns
---

# Troubleshooting

## Diagnóstico Inicial

Antes de começar, execute estes comandos para coletar informações:

\`\`\`bash
# Versão do Node.js
node --version

# Versão do npm
npm --version

# Informações do sistema
npm run info
\`\`\`

## Problemas de Instalação

### ❌ Erro: EACCES permission denied

**Sintomas:** Erro de permissão durante npm install

**Solução:**
\`\`\`bash
# Opção 1: Usar npx
npx nome-do-projeto

# Opção 2: Configurar npm prefix
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
\`\`\`

### ❌ Erro: Cannot resolve dependency

**Sintomas:** Conflitos de dependências

**Solução:**
\`\`\`bash
# Limpar cache
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
\`\`\`

## Problemas de Execução

### ❌ Erro: Port already in use

**Sintomas:** EADDRINUSE: address already in use :::3000

**Solução:**
\`\`\`bash
# Encontrar processo usando a porta
lsof -ti:3000

# Matar o processo
kill -9 $(lsof -ti:3000)

# Ou usar porta diferente
PORT=3001 npm run dev
\`\`\`

### ❌ Erro: Database connection failed

**Sintomas:** Não consegue conectar ao banco

**Solução:**
1. Verifique se o arquivo de banco existe
2. Confirme a DATABASE_URL no .env
3. Execute: \`npx prisma db push\`

## Problemas de Performance

### 🐌 Aplicação lenta

**Diagnóstico:**
\`\`\`bash
# Verificar uso de memória
npm run analyze

# Verificar logs
npm run logs
\`\`\`

**Soluções:**
- Aumentar memória disponível
- Otimizar queries do banco
- Implementar cache
- Verificar [guia de performance](performance.md)

### 🐌 Build demorado

**Soluções:**
\`\`\`bash
# Build incremental
npm run build:fast

# Limpar cache de build
npm run clean
\`\`\`

## Problemas de Autenticação

### ❌ Login não funciona

**Checklist:**
- [ ] NEXTAUTH_SECRET está definido
- [ ] NEXTAUTH_URL está correto
- [ ] Credenciais do Google configuradas
- [ ] Banco de dados acessível

**Debug:**
\`\`\`bash
# Habilitar logs de debug
DEBUG=nextauth* npm run dev
\`\`\`

## Problemas de Desenvolvimento

### ❌ Hot reload não funciona

**Soluções:**
\`\`\`bash
# Reiniciar servidor de desenvolvimento
npm run dev

# Verificar watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
\`\`\`

### ❌ TypeScript errors

**Soluções:**
\`\`\`bash
# Verificar tipos
npm run type-check

# Regenerar tipos do Prisma
npx prisma generate
\`\`\`

## Logs e Debug

### Habilitar logs detalhados

\`\`\`bash
# Desenvolvimento
DEBUG=* npm run dev

# Produção
NODE_ENV=production LOG_LEVEL=debug npm start
\`\`\`

### Localizar arquivos de log

- Desenvolvimento: \`logs/dev.log\`
- Produção: \`logs/production.log\`
- Erros: \`logs/error.log\`

## Quando Pedir Ajuda

Se nenhuma solução funcionou:

1. **Colete informações:**
   - Versões (Node, npm, projeto)
   - Sistema operacional
   - Logs de erro completos
   - Passos para reproduzir

2. **Onde pedir ajuda:**
   - GitHub Issues (bugs)
   - Discussions (dúvidas)
   - Discord/Slack da comunidade

3. **Template de report:**
   \`\`\`
   **Ambiente:**
   - OS: [Windows/Mac/Linux]
   - Node: [versão]
   - Projeto: [versão]
   
   **Problema:**
   [Descrição clara]
   
   **Passos para reproduzir:**
   1. ...
   2. ...
   
   **Erro:**
   [Log completo]
   
   **Tentativas:**
   [O que já tentou]
   \`\`\`

## Recursos Adicionais

- 📖 [Documentação completa](../README.md)
- 🔧 [Guia de configuração](installation.md)
- 🚀 [Guia de performance](performance.md)
- 🤝 [Como contribuir](contributing.md)`
  },
  {
    id: 'api-reference',
    name: 'API Reference',
    description: 'Documentação de referência da API',
    suggestedPath: 'docs/api-reference.md',
    content: `---
summary: Documentação completa da API do projeto
---

# API Reference

## Visão Geral

Base URL: \`https://api.exemplo.com/v1\`

Todas as requisições devem incluir o header:
\`\`\`
Content-Type: application/json
Authorization: Bearer <seu-token>
\`\`\`

## Autenticação

### POST /auth/login

Autentica um usuário e retorna um token JWT.

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "senha123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
\`\`\`

**Status Codes:**
- \`200\` - Sucesso
- \`401\` - Credenciais inválidas
- \`422\` - Dados inválidos

## Usuários

### GET /users/me

Retorna informações do usuário autenticado.

**Response:**
\`\`\`json
{
  "id": "123",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "createdAt": "2024-01-01T00:00:00Z"
}
\`\`\`

### PUT /users/me

Atualiza informações do usuário autenticado.

**Request:**
\`\`\`json
{
  "name": "Novo Nome",
  "email": "novo@example.com"
}
\`\`\`

## Repositórios

### GET /repositories

Lista repositórios do usuário.

**Query Parameters:**
- \`page\` (number): Página (padrão: 1)
- \`limit\` (number): Itens por página (padrão: 10, máx: 100)
- \`search\` (string): Termo de busca

**Response:**
\`\`\`json
{
  "repositories": [
    {
      "id": "repo-123",
      "name": "meu-projeto",
      "description": "Descrição do projeto",
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
\`\`\`

### POST /repositories

Cria um novo repositório.

**Request:**
\`\`\`json
{
  "name": "novo-projeto",
  "description": "Descrição do novo projeto",
  "isPublic": true
}
\`\`\`

### GET /repositories/:id

Retorna detalhes de um repositório específico.

### PUT /repositories/:id

Atualiza um repositório.

### DELETE /repositories/:id

Remove um repositório.

## Páginas

### GET /repositories/:repoId/pages

Lista páginas de um repositório.

### POST /repositories/:repoId/pages

Cria uma nova página.

**Request:**
\`\`\`json
{
  "title": "Nova Página",
  "path": "docs/nova-pagina.md",
  "contentMd": "# Conteúdo da página",
  "order": 1
}
\`\`\`

### PUT /pages/:id

Atualiza uma página existente.

## Busca

### GET /search

Busca global por repositórios e páginas.

**Query Parameters:**
- \`q\` (string, required): Termo de busca
- \`scope\` (string): "repos", "pages", ou "both" (padrão: "both")
- \`limit\` (number): Máximo de resultados (padrão: 20)

**Response:**
\`\`\`json
{
  "repositories": [
    {
      "id": "repo-123",
      "name": "projeto-exemplo",
      "description": "Projeto de exemplo"
    }
  ],
  "pages": [
    {
      "id": "page-456",
      "title": "Getting Started",
      "path": "docs/getting-started.md",
      "repository": {
        "name": "projeto-exemplo",
        "owner": "usuario"
      }
    }
  ]
}
\`\`\`

## Códigos de Status

| Código | Significado |
|--------|-------------|
| 200    | Sucesso |
| 201    | Criado |
| 400    | Requisição inválida |
| 401    | Não autorizado |
| 403    | Proibido |
| 404    | Não encontrado |
| 422    | Dados inválidos |
| 500    | Erro interno |

## Rate Limiting

- **Limite:** 1000 requisições por hora por usuário
- **Headers de resposta:**
  - \`X-RateLimit-Limit\`: Limite total
  - \`X-RateLimit-Remaining\`: Requisições restantes
  - \`X-RateLimit-Reset\`: Timestamp do reset

## Webhooks

### Configuração

POST /webhooks

\`\`\`json
{
  "url": "https://seu-site.com/webhook",
  "events": ["repository.created", "page.updated"],
  "secret": "seu-secret-para-validacao"
}
\`\`\`

### Eventos Disponíveis

- \`repository.created\`
- \`repository.updated\`
- \`repository.deleted\`
- \`page.created\`
- \`page.updated\`
- \`page.deleted\`

## SDKs e Bibliotecas

### JavaScript/TypeScript

\`\`\`bash
npm install @projeto/sdk
\`\`\`

\`\`\`typescript
import { ApiClient } from '@projeto/sdk';

const client = new ApiClient({
  token: 'seu-token',
  baseUrl: 'https://api.exemplo.com/v1'
});

const repos = await client.repositories.list();
\`\`\`

### Python

\`\`\`bash
pip install projeto-sdk
\`\`\`

\`\`\`python
from projeto_sdk import ApiClient

client = ApiClient(token='seu-token')
repos = client.repositories.list()
\`\`\`

## Exemplos Práticos

### Criar e popular um repositório

\`\`\`javascript
// 1. Criar repositório
const repo = await client.repositories.create({
  name: 'meu-projeto',
  description: 'Projeto de exemplo'
});

// 2. Criar página inicial
await client.pages.create(repo.id, {
  title: 'README',
  path: 'README.md',
  contentMd: '# Meu Projeto\\n\\nDescrição do projeto...'
});
\`\`\`

### Buscar e filtrar conteúdo

\`\`\`javascript
const results = await client.search({
  q: 'getting started',
  scope: 'pages',
  limit: 10
});

console.log(\`Encontradas \${results.pages.length} páginas\`);
\`\`\`

## Changelog da API

### v1.2.0 (2024-03-01)
- Adicionado endpoint de busca global
- Melhorado rate limiting
- Novos webhooks para páginas

### v1.1.0 (2024-02-01)
- Adicionado suporte a paginação
- Novos filtros de busca
- Correções de performance

### v1.0.0 (2024-01-01)
- Lançamento inicial da API
- Endpoints básicos de CRUD
- Autenticação JWT`
  }
];
