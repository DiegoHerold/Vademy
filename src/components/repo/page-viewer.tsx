'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { DocQualityPanel } from './doc-quality-panel';
import { PageBreadcrumb } from '@/components/navigation/page-breadcrumb';
import Link from 'next/link';

interface PageViewerProps {
  page: {
    id: string;
    title: string;
    path: string;
    contentMd: string;
    createdAt: Date;
    updatedAt: Date;
  };
  repository: {
    id: string;
    name: string;
    slug: string;
    owner: {
      username: string;
    };
  };
  isOwner: boolean;
  allPages?: Array<{
    id: string;
    title: string;
    path: string;
    order: number;
  }>;
}

export function PageViewer({ page, repository, isOwner, allPages = [] }: PageViewerProps) {
  // Renderizar markdown simples (em produção, usar uma lib como react-markdown)
  const renderMarkdown = (content: string) => {
    // Conversão básica de markdown para HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Code inline
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code class="text-sm">${code.trim()}</code></pre>`;
    });

    // Lists
    html = html.replace(/^\- (.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul class="list-disc list-inside space-y-1">$1</ul>');

    // Checklists
    html = html.replace(/^\- \[ \] (.*)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" disabled> $1</li>');
    html = html.replace(/^\- \[x\] (.*)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" checked disabled> $1</li>');

    // Blockquotes
    html = html.replace(/^> (.*)$/gim, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground">$1</blockquote>');

    return html;
  };

  // Encontrar páginas anterior e próxima
  const sortedPages = allPages.sort((a, b) => a.order - b.order);
  const currentIndex = sortedPages.findIndex(p => p.id === page.id);
  const previousPage = currentIndex > 0 ? sortedPages[currentIndex - 1] : null;
  const nextPage = currentIndex < sortedPages.length - 1 ? sortedPages[currentIndex + 1] : null;

  // Criar breadcrumb
  const breadcrumbItems = [
    {
      type: 'home' as const,
      label: 'Início',
      href: '/',
    },
    {
      type: 'user' as const,
      label: repository.owner.username,
      href: `/profile/${repository.owner.username}`,
    },
    {
      type: 'repo' as const,
      label: repository.slug,
      href: `/${repository.owner.username}/${repository.slug}`,
    },
    {
      type: 'page' as const,
      label: page.title,
      href: `/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(page.path)}`,
      badge: page.path === 'README.md' ? 'README' : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <PageBreadcrumb 
            items={breadcrumbItems}
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="outline">{page.path}</Badge>
                {isOwner && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${repository.owner.username}/${repository.slug}/edit/${page.path}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            {/* Conteúdo da página */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{page.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Atualizado {new Date(page.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-pre:bg-muted prose-pre:border prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(page.contentMd) }}
                />
              </CardContent>
            </Card>

            {/* Navegação entre páginas */}
            {(previousPage || nextPage) && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {previousPage && (
                        <Link 
                          href={`/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(previousPage.path)}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                          <div>
                            <div className="text-xs uppercase tracking-wide">Anterior</div>
                            <div className="font-medium">{previousPage.title}</div>
                          </div>
                        </Link>
                      )}
                    </div>
                    
                    <div className="flex-1 text-right">
                      {nextPage && (
                        <Link 
                          href={`/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(nextPage.path)}`}
                          className="flex items-center justify-end gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <div className="text-right">
                            <div className="text-xs uppercase tracking-wide">Próximo</div>
                            <div className="font-medium">{nextPage.title}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <DocQualityPanel 
              contentMd={page.contentMd}
              className="sticky top-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
