'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, FolderOpen, ExternalLink, Loader2 } from 'lucide-react';
import { highlight } from '@/lib/highlight';

interface SearchResult {
  type: 'repository' | 'page';
  id: string;
  title: string;
  description?: string;
  path?: string;
  owner?: string;
  repoName?: string;
  url: string;
}

interface InsertLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (markdown: string) => void;
}

export function InsertLinkDialog({ open, onOpenChange, onInsert }: InsertLinkDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [mode, setMode] = useState<'search' | 'custom'>('search');

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Buscar resultados
  useEffect(() => {
    if (!debouncedQuery.trim() || mode === 'custom') {
      setResults([]);
      return;
    }

    const searchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&scope=both&limit=20`
        );
        
        if (!response.ok) {
          throw new Error('Erro na busca');
        }

        const data = await response.json();
        
        const searchResults: SearchResult[] = [
          // Repositórios
          ...(data.repositories || []).map((repo: any) => ({
            type: 'repository' as const,
            id: repo.id,
            title: repo.name,
            description: repo.description,
            owner: repo.owner?.username,
            url: `/${repo.owner?.username}/${repo.name}`
          })),
          // Páginas
          ...(data.pages || []).map((page: any) => ({
            type: 'page' as const,
            id: page.id,
            title: page.title,
            path: page.path,
            owner: page.repository?.owner?.username,
            repoName: page.repository?.name,
            url: `/${page.repository?.owner?.username}/${page.repository?.name}?path=${encodeURIComponent(page.path)}`
          }))
        ];

        setResults(searchResults);
      } catch (error) {
        console.error('Erro ao buscar:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchResults();
  }, [debouncedQuery, mode]);

  // Inserir link
  const handleInsert = () => {
    let markdown = '';

    if (mode === 'custom') {
      if (!customTitle.trim() || !customUrl.trim()) {
        return;
      }
      markdown = `[${customTitle.trim()}](${customUrl.trim()})`;
    } else if (selectedResult) {
      markdown = `[${selectedResult.title}](${selectedResult.url})`;
    } else {
      return;
    }

    onInsert(markdown);
    handleClose();
  };

  // Fechar e resetar
  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    setSelectedResult(null);
    setCustomTitle('');
    setCustomUrl('');
    setMode('search');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Inserir Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Modo de inserção */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('search')}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar Conteúdo
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('custom')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Link Personalizado
            </Button>
          </div>

          {mode === 'search' ? (
            <>
              {/* Busca */}
              <div className="space-y-2">
                <Label>Buscar repositórios e páginas</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Resultados */}
              <div className="space-y-2">
                <Label>Resultados</Label>
                <ScrollArea className="h-[300px] border rounded-lg">
                  {results.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {results.map((result) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedResult?.id === result.id && selectedResult?.type === result.type
                              ? 'bg-primary/10 border border-primary/20'
                              : 'border border-transparent'
                          }`}
                          onClick={() => setSelectedResult(result)}
                        >
                          <div className="flex items-start gap-3">
                            {result.type === 'repository' ? (
                              <FolderOpen className="h-4 w-4 mt-0.5 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 mt-0.5 text-green-500" />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">
                                  {highlight(result.title, searchQuery)}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {result.type === 'repository' ? 'Repositório' : 'Página'}
                                </Badge>
                              </div>
                              
                              {result.description && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {highlight(result.description, searchQuery)}
                                </p>
                              )}
                              
                              <div className="text-xs text-muted-foreground font-mono">
                                {result.type === 'repository' ? (
                                  `/${result.owner}/${result.title}`
                                ) : (
                                  `/${result.owner}/${result.repoName}/${result.path}`
                                )}
                              </div>
                            </div>

                            {selectedResult?.id === result.id && selectedResult?.type === result.type && (
                              <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery && !isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum resultado encontrado</p>
                    </div>
                  ) : !searchQuery ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Digite algo para buscar</p>
                    </div>
                  ) : null}
                </ScrollArea>
              </div>
            </>
          ) : (
            /* Modo personalizado */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-title">Texto do Link</Label>
                <Input
                  id="custom-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Documentação oficial"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-url">URL</Label>
                <Input
                  id="custom-url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Ex: https://exemplo.com"
                />
              </div>

              {customTitle && customUrl && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">Preview:</Label>
                  <div className="font-mono text-sm mt-1">
                    [{customTitle}]({customUrl})
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {mode === 'search' && selectedResult && (
              <span>Link: [{selectedResult.title}]({selectedResult.url})</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleInsert}
              disabled={
                mode === 'search' 
                  ? !selectedResult 
                  : !customTitle.trim() || !customUrl.trim()
              }
            >
              Inserir Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
