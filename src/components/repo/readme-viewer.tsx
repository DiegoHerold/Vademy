'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Save, X, FileText } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { DocQualityPanel } from './doc-quality-panel';
import { toast } from 'sonner';

interface ReadmeViewerProps {
  repository: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    owner: {
      username: string;
    };
  };
  readmePage?: {
    id: string;
    title: string;
    path: string;
    contentMd: string;
    updatedAt: Date;
  } | null;
  isOwner: boolean;
}

export function ReadmeViewer({ repository, readmePage, isOwner }: ReadmeViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(readmePage?.contentMd || '');
  const [isSaving, setIsSaving] = useState(false);

  // Renderizar markdown simples
  const renderMarkdown = (markdown: string) => {
    if (!markdown.trim()) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum README encontrado</p>
          {isOwner && (
            <Button 
              className="mt-4" 
              onClick={() => {
                setContent(`# ${repository.name}

${repository.description || 'Descrição do projeto'}

## Sobre

Adicione aqui uma descrição detalhada do seu projeto.

## Como usar

1. Clone o repositório
2. Instale as dependências
3. Execute o projeto

## Contribuindo

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.

## Licença

Este projeto está sob a licença MIT.`);
                setIsEditing(true);
              }}
            >
              Criar README
            </Button>
          )}
        </div>
      );
    }

    // Conversão básica de markdown para HTML
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>')
      // Bold e Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // Code inline
      .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
    });

    // Lists
    html = html.replace(/^\- (.*)$/gim, '<li class="ml-4">• $1</li>');
    html = html.replace(/^(\d+)\. (.*)$/gim, '<li class="ml-4">$1. $2</li>');
    
    // Checklists
    html = html.replace(/^\- \[ \] (.*)$/gim, '<li class="flex items-center gap-2 ml-4"><input type="checkbox" disabled class="rounded"> $1</li>');
    html = html.replace(/^\- \[x\] (.*)$/gim, '<li class="flex items-center gap-2 ml-4"><input type="checkbox" checked disabled class="rounded"> $1</li>');

    // Blockquotes
    html = html.replace(/^> (.*)$/gim, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">$1</blockquote>');

    return html;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let response;
      
      if (readmePage) {
        // Atualizar README existente
        response = await fetch(`/api/pages/${readmePage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'README',
            contentMd: content,
          }),
        });
      } else {
        // Criar novo README
        response = await fetch('/api/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoId: repository.id,
            title: 'README',
            path: 'README.md',
            contentMd: content,
            order: 0,
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar README');
      }

      toast.success('README salvo com sucesso!');
      setIsEditing(false);
      
      // Recarregar a página para mostrar as mudanças
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao salvar README:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar README');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(readmePage?.contentMd || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header fixo de edição */}
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4 max-w-[1800px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Editando README.md</h1>
                  <p className="text-sm text-muted-foreground">
                    {repository.owner.username}/{repository.name}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  <FileText className="h-3 w-3 mr-1" />
                  Markdown
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !content.trim()} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar README'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor em tela cheia */}
        <div className="container mx-auto px-6 py-6 max-w-[1800px]">
          <div className="grid gap-8 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 min-h-[calc(100vh-200px)]">
            <div className="2xl:col-span-5 xl:col-span-4 lg:col-span-3">
              <Card className="h-full shadow-lg">
                <CardHeader className="pb-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-lg">Editor de Markdown</span>
                        <p className="text-sm text-muted-foreground font-normal mt-1">
                          Use a sintaxe Markdown para formatar seu README
                        </p>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="font-semibold text-primary">{content.length}</div>
                        <div className="text-xs">caracteres</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-primary">{content.split('\n').length}</div>
                        <div className="text-xs">linhas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-primary">{content.split(' ').length}</div>
                        <div className="text-xs">palavras</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)] p-0">
                  <div className="h-full">
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      repoId={repository.id}
                      owner={repository.owner.username}
                      repoName={repository.slug}
                      showTemplateButton={false}
                      className="h-full border-0 rounded-none"
                      placeholder="# 📚 Meu Projeto

> Uma breve descrição do que seu projeto faz e para quem é destinado.

## 🚀 Começando

Estas instruções vão te ajudar a ter uma cópia do projeto rodando na sua máquina local.

### 📋 Pré-requisitos

O que você precisa para instalar o software:

```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### 🔧 Instalação

Passo a passo para ter o ambiente de desenvolvimento rodando:

```bash
# Clone o repositório
git clone https://github.com/usuario/projeto.git

# Entre na pasta
cd projeto

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

## 📖 Como usar

Exemplos de como usar seu projeto:

```javascript
import { MinhaFuncao } from 'meu-projeto';

const resultado = MinhaFuncao('exemplo');
console.log(resultado);
```

## 🛠️ Construído com

* [React](https://reactjs.org/) - Framework web
* [Node.js](https://nodejs.org/) - Runtime JavaScript
* [Express](https://expressjs.com/) - Framework backend

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para saber como contribuir.

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## 🎉 Agradecimentos

* Inspiração
* Referências
* etc"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="2xl:col-span-1 xl:col-span-1 lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <DocQualityPanel 
                  contentMd={content}
                />
                
                {/* Dicas de escrita */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      💡 Dicas de Escrita
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-2">
                      <p className="font-medium">📝 Estrutura recomendada:</p>
                      <ul className="space-y-1 text-muted-foreground ml-4">
                        <li>• Título e descrição clara</li>
                        <li>• Instruções de instalação</li>
                        <li>• Exemplos de uso</li>
                        <li>• Como contribuir</li>
                        <li>• Licença</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium">🎨 Use emojis para destacar:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        <span>🚀 Início rápido</span>
                        <span>📋 Requisitos</span>
                        <span>🔧 Instalação</span>
                        <span>📖 Documentação</span>
                        <span>🤝 Contribuição</span>
                        <span>📄 Licença</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                README.md
                {readmePage && (
                  <Badge variant="secondary" className="text-xs">
                    {new Date(readmePage.updatedAt).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Documentação principal do projeto
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setContent(readmePage?.contentMd || '');
                  setIsEditing(true);
                }}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                {readmePage ? 'Editar README' : 'Criar README'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div 
          className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-pre:bg-muted prose-pre:border prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
          dangerouslySetInnerHTML={{ 
            __html: renderMarkdown(readmePage?.contentMd || '') 
          }}
        />
      </CardContent>
    </Card>
  );
}