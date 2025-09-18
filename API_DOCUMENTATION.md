# APIs de Domínio - Documentação

## Endpoints Implementados

### 1. POST /api/repos
**Descrição**: Criar um novo repositório  
**Autenticação**: Obrigatória  
**Payload**:
```json
{
  "name": "Meu Manual",
  "description": "Descrição do manual (opcional)",
  "visibility": "PUBLIC" // ou "PRIVATE"
}
```
**Resposta (201)**:
```json
{
  "id": "clx123...",
  "name": "Meu Manual",
  "slug": "meu-manual",
  "description": "Descrição do manual",
  "visibility": "PUBLIC",
  "starsCount": 0,
  "ownerId": "user123...",
  "owner": {
    "id": "user123...",
    "username": "usuario",
    "name": "Nome do Usuário"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. POST /api/repos/[id]/star
**Descrição**: Toggle star em um repositório (adiciona se não existe, remove se existe)  
**Autenticação**: Obrigatória  
**Payload**: Nenhum  
**Resposta (200)**:
```json
{
  "isStarred": true,
  "starsCount": 5
}
```

### 3. POST /api/pages
**Descrição**: Criar uma nova página (apenas owner do repo)  
**Autenticação**: Obrigatória  
**Payload**:
```json
{
  "repoId": "repo123...",
  "path": "introducao",
  "title": "Introdução",
  "contentMd": "# Introdução\n\nConteúdo em markdown..."
}
```
**Resposta (201)**:
```json
{
  "id": "page123...",
  "repoId": "repo123...",
  "path": "introducao",
  "title": "Introdução",
  "contentMd": "# Introdução\n\nConteúdo em markdown...",
  "order": 1,
  "repo": {
    "id": "repo123...",
    "name": "Meu Manual",
    "slug": "meu-manual",
    "owner": {
      "username": "usuario"
    }
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. PUT /api/pages/[id]
**Descrição**: Atualizar título e/ou conteúdo de uma página (apenas owner do repo)  
**Autenticação**: Obrigatória  
**Payload**:
```json
{
  "title": "Novo Título (opcional)",
  "contentMd": "Novo conteúdo em markdown (opcional)"
}
```
**Resposta (200)**: Mesma estrutura da criação de página

### 5. POST /api/pages/reorder
**Descrição**: Reordenar páginas com setas ↑/↓ (apenas owner do repo)  
**Autenticação**: Obrigatória  
**Payload**:
```json
{
  "pageId": "page123...",
  "direction": "up" // ou "down"
}
```
**Resposta (200)**:
```json
{
  "pages": [
    {
      "id": "page123...",
      "title": "Página 1",
      "path": "pagina-1",
      "order": 1
    },
    {
      "id": "page456...",
      "title": "Página 2",
      "path": "pagina-2",
      "order": 2
    }
  ]
}
```

### 6. GET /api/search?query=termo
**Descrição**: Buscar repositórios e páginas por nome/título/descrição  
**Autenticação**: Opcional (afeta visibilidade dos resultados)  
**Query Parameters**:
- `query`: Termo de busca (obrigatório)

**Resposta (200)**:
```json
{
  "repositories": [
    {
      "id": "repo123...",
      "name": "Manual React",
      "slug": "manual-react",
      "description": "Guia completo de React",
      "visibility": "PUBLIC",
      "starsCount": 10,
      "owner": {
        "id": "user123...",
        "username": "usuario",
        "name": "Nome do Usuário"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pages": [
    {
      "id": "page123...",
      "title": "Hooks no React",
      "path": "hooks",
      "repo": {
        "id": "repo123...",
        "name": "Manual React",
        "slug": "manual-react",
        "owner": {
          "username": "usuario",
          "name": "Nome do Usuário"
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "query": "react",
  "totalResults": 2
}
```

### 7. POST /api/progress
**Descrição**: Salvar progresso de leitura de uma página  
**Autenticação**: Obrigatória  
**Payload**:
```json
{
  "pageId": "page123...",
  "completedSteps": 3,
  "totalSteps": 5
}
```
**Resposta (200)**:
```json
{
  "id": "progress123...",
  "completedSteps": 3,
  "totalSteps": 5,
  "percentage": 60,
  "page": {
    "id": "page123...",
    "title": "Introdução",
    "path": "introducao"
  },
  "repo": {
    "id": "repo123...",
    "name": "Meu Manual",
    "slug": "meu-manual"
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Regras de Acesso

### Repositórios
- **Públicos**: Qualquer visitante pode visualizar
- **Privados**: Apenas o owner pode visualizar
- **Edição**: Apenas o owner pode editar (criar/atualizar páginas, reordenar)

### Páginas
- **Visualização**: Segue as regras do repositório pai
- **Criação/Edição**: Apenas o owner do repositório

### Stars
- **Visualização**: Usuários autenticados podem dar star em repos que conseguem visualizar
- **Contagem**: Atualizada automaticamente

### Progresso
- **Salvamento**: Usuários autenticados podem salvar progresso em páginas que conseguem visualizar
- **Privacidade**: Cada usuário vê apenas seu próprio progresso

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Recurso não encontrado
- **409**: Conflito (recurso já existe)
- **500**: Erro interno do servidor

## Helpers de Permissão

Implementados em `src/lib/permissions.ts`:

- `isOwner(userId, ownerId)`: Verifica se o usuário é o dono
- `canViewRepo(repo, session)`: Verifica se o usuário pode visualizar o repo
- `canEditRepo(repo, session)`: Verifica se o usuário pode editar o repo

## Utilitários

- `slugify(text)`: Converte texto em slug URL-friendly (em `src/lib/utils.ts`)