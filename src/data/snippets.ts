export interface Snippet {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables?: string[];
}

export const snippets: Snippet[] = [
  {
    id: 'checklist',
    name: 'Checklist',
    description: 'Lista de tarefas com checkboxes',
    category: 'Listas',
    content: `## Checklist

- [ ] Tarefa 1
- [ ] Tarefa 2
- [ ] Tarefa 3
- [x] Tarefa concluída`
  },
  {
    id: 'code-block',
    name: 'Bloco de Código',
    description: 'Bloco de código com linguagem específica',
    category: 'Código',
    content: `\`\`\`\${LANG}
// Seu código aqui
\`\`\``,
    variables: ['LANG']
  },
  {
    id: 'note-tip',
    name: 'Nota/Dica',
    description: 'Caixa de nota ou dica destacada',
    category: 'Avisos',
    content: `> **💡 Dica:** Esta é uma dica útil para o leitor.`
  },
  {
    id: 'warning',
    name: 'Aviso',
    description: 'Caixa de aviso importante',
    category: 'Avisos',
    content: `> **⚠️ Aviso:** Informação importante que requer atenção.`
  },
  {
    id: 'danger',
    name: 'Perigo',
    description: 'Caixa de alerta crítico',
    category: 'Avisos',
    content: `> **🚨 Atenção:** Ação que pode causar problemas se executada incorretamente.`
  },
  {
    id: 'info',
    name: 'Informação',
    description: 'Caixa de informação geral',
    category: 'Avisos',
    content: `> **ℹ️ Informação:** Informação adicional relevante.`
  },
  {
    id: 'table-2x3',
    name: 'Tabela 2x3',
    description: 'Tabela básica com 2 colunas e 3 linhas',
    category: 'Tabelas',
    content: `| Coluna 1 | Coluna 2 |
|----------|----------|
| Valor 1  | Valor 2  |
| Valor 3  | Valor 4  |
| Valor 5  | Valor 6  |`
  },
  {
    id: 'table-comparison',
    name: 'Tabela de Comparação',
    description: 'Tabela para comparar opções ou recursos',
    category: 'Tabelas',
    content: `| Recurso | Opção A | Opção B | Opção C |
|---------|---------|---------|---------|
| Preço   | Grátis  | $10/mês | $25/mês |
| Suporte | Email   | Chat    | Telefone|
| Limite  | 100     | 1000    | Ilimitado|`
  },
  {
    id: 'callout-success',
    name: 'Callout Sucesso',
    description: 'Destaque para informações de sucesso',
    category: 'Callouts',
    content: `> **✅ Sucesso:** Operação concluída com êxito!`
  },
  {
    id: 'callout-error',
    name: 'Callout Erro',
    description: 'Destaque para informações de erro',
    category: 'Callouts',
    content: `> **❌ Erro:** Algo deu errado. Verifique os logs para mais detalhes.`
  },
  {
    id: 'steps',
    name: 'Passos Numerados',
    description: 'Lista de passos sequenciais',
    category: 'Listas',
    content: `## Passos

1. **Primeiro passo:** Descrição do que fazer
2. **Segundo passo:** Próxima ação
3. **Terceiro passo:** Finalização`
  },
  {
    id: 'installation',
    name: 'Instruções de Instalação',
    description: 'Template para comandos de instalação',
    category: 'Código',
    content: `## Instalação

\`\`\`bash
# Via npm
npm install nome-do-pacote

# Via yarn
yarn add nome-do-pacote

# Via pnpm
pnpm add nome-do-pacote
\`\`\``
  },
  {
    id: 'api-endpoint',
    name: 'Endpoint da API',
    description: 'Documentação de endpoint de API',
    category: 'API',
    content: `### POST /api/endpoint

**Descrição:** Breve descrição do que o endpoint faz.

**Request:**
\`\`\`json
{
  "campo1": "valor",
  "campo2": 123
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "123",
    "message": "Operação realizada"
  }
}
\`\`\`

**Status Codes:**
- \`200\` - Sucesso
- \`400\` - Requisição inválida
- \`500\` - Erro interno`
  },
  {
    id: 'keyboard-shortcuts',
    name: 'Atalhos de Teclado',
    description: 'Lista de atalhos de teclado',
    category: 'Interface',
    content: `## Atalhos de Teclado

| Ação | Windows/Linux | macOS |
|------|---------------|-------|
| Salvar | \`Ctrl + S\` | \`Cmd + S\` |
| Copiar | \`Ctrl + C\` | \`Cmd + C\` |
| Colar | \`Ctrl + V\` | \`Cmd + V\` |
| Desfazer | \`Ctrl + Z\` | \`Cmd + Z\` |`
  },
  {
    id: 'feature-list',
    name: 'Lista de Recursos',
    description: 'Lista destacada de recursos ou funcionalidades',
    category: 'Listas',
    content: `## Recursos

- ✨ **Recurso 1:** Descrição do primeiro recurso
- 🚀 **Recurso 2:** Descrição do segundo recurso  
- 🔒 **Recurso 3:** Descrição do terceiro recurso
- 📱 **Recurso 4:** Descrição do quarto recurso`
  }
];

export const snippetCategories = [
  'Listas',
  'Código', 
  'Avisos',
  'Tabelas',
  'Callouts',
  'API',
  'Interface'
] as const;
