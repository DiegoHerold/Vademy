'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Edit, 
  Trash2, 
  GripVertical, 
  Plus,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { RepoPageClient } from './repo-page-client';
import { DeletePageDialog } from './delete-page-dialog';
import Link from 'next/link';
import { toast } from 'sonner';

interface Page {
  id: string;
  title: string;
  path: string;
  order: number;
  updatedAt: Date;
}

interface PagesManagerProps {
  repository: {
    id: string;
    name: string;
    slug: string;
    owner: {
      username: string;
    };
  };
  pages: Page[];
  isOwner: boolean;
}

export function PagesManager({ repository, pages, isOwner }: PagesManagerProps) {
  const [sortedPages, setSortedPages] = useState([...pages].sort((a, b) => a.order - b.order));
  const [isReordering, setIsReordering] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  const movePageUp = async (pageId: string) => {
    const currentIndex = sortedPages.findIndex(p => p.id === pageId);
    if (currentIndex <= 0) return;

    const newPages = [...sortedPages];
    [newPages[currentIndex - 1], newPages[currentIndex]] = [newPages[currentIndex], newPages[currentIndex - 1]];
    
    setSortedPages(newPages);
    await updatePageOrder(pageId, 'up');
  };

  const movePageDown = async (pageId: string) => {
    const currentIndex = sortedPages.findIndex(p => p.id === pageId);
    if (currentIndex >= sortedPages.length - 1) return;

    const newPages = [...sortedPages];
    [newPages[currentIndex], newPages[currentIndex + 1]] = [newPages[currentIndex + 1], newPages[currentIndex]];
    
    setSortedPages(newPages);
    await updatePageOrder(pageId, 'down');
  };

  const updatePageOrder = async (pageId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/pages/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          direction,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao reordenar página');
      }

      toast.success('Ordem das páginas atualizada!');
    } catch (error) {
      console.error('Erro ao reordenar página:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao reordenar página');
      
      // Reverter mudança em caso de erro
      setSortedPages([...pages].sort((a, b) => a.order - b.order));
    }
  };

  const handlePageDeleted = () => {
    if (pageToDelete) {
      setSortedPages(prev => prev.filter(p => p.id !== pageToDelete.id));
      setPageToDelete(null);
    }
  };

  if (sortedPages.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma página ainda
            </h3>
            <p className="text-muted-foreground mb-4">
              {isOwner 
                ? 'Crie a primeira página para começar a documentar seu projeto'
                : 'Este repositório ainda não possui páginas'
              }
            </p>
            {isOwner && (
              <RepoPageClient
                repoId={repository.id}
                owner={repository.owner.username}
                repoName={repository.slug}
                isOwner={isOwner}
                hasPages={false}
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Páginas do Repositório</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {sortedPages.length} página{sortedPages.length !== 1 ? 's' : ''} • 
              Navegue e organize o conteúdo do repositório
            </p>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReordering(!isReordering)}
              >
                <GripVertical className="h-4 w-4 mr-2" />
                {isReordering ? 'Finalizar' : 'Reorganizar'}
              </Button>
              <RepoPageClient
                repoId={repository.id}
                owner={repository.owner.username}
                repoName={repository.slug}
                isOwner={isOwner}
                hasPages={true}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedPages.map((page, index) => (
            <div 
              key={page.id} 
              className={`flex items-center justify-between py-3 px-4 rounded-md border transition-colors ${
                isReordering ? 'bg-muted/30' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isReordering ? (
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => movePageUp(page.id)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => movePageDown(page.id)}
                      disabled={index === sortedPages.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      href={`/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(page.path)}`}
                      className="font-medium hover:text-primary transition-colors truncate"
                    >
                      {page.title}
                    </Link>
                    {page.path === 'README.md' && (
                      <Badge variant="secondary" className="text-xs">
                        README
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>/{page.path}</span>
                    <span>•</span>
                    <span>Atualizado {new Date(page.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {!isReordering && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      #{page.order}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(page.path)}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {isOwner && (
                        <>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${repository.owner.username}/${repository.slug}/edit/${page.path}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          {page.path !== 'README.md' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setPageToDelete(page)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      {/* Dialog de confirmação para deletar */}
      {pageToDelete && (
        <DeletePageDialog
          open={!!pageToDelete}
          onOpenChange={(open) => !open && setPageToDelete(null)}
          page={pageToDelete}
          onDeleted={handlePageDeleted}
        />
      )}
    </Card>
  );
}