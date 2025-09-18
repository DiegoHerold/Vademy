'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search, 
  Plus, 
  BookOpen, 
  Clock,
  Star,
  Eye,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Page {
  id: string;
  title: string;
  path: string;
  order: number;
  updatedAt: Date;
}

interface Repository {
  id: string;
  name: string;
  slug: string;
  owner: {
    username: string;
  };
}

interface PageSidebarProps {
  repository: Repository;
  pages: Page[];
  currentPagePath?: string;
  isOwner?: boolean;
  onNewPage?: () => void;
  className?: string;
}

export function PageSidebar({ 
  repository, 
  pages, 
  currentPagePath, 
  isOwner = false,
  onNewPage,
  className 
}: PageSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'updated' | 'title'>('order');

  // Filtrar e ordenar páginas
  const filteredAndSortedPages = pages
    .filter(page => 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'order':
          return a.order - b.order;
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Páginas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {pages.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar páginas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 text-sm"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1">
          <Button
            variant={sortBy === 'order' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('order')}
            className="h-7 px-2 text-xs"
          >
            Ordem
          </Button>
          <Button
            variant={sortBy === 'updated' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('updated')}
            className="h-7 px-2 text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            Recente
          </Button>
          <Button
            variant={sortBy === 'title' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('title')}
            className="h-7 px-2 text-xs"
          >
            A-Z
          </Button>
        </div>

        {/* Lista de páginas */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {filteredAndSortedPages.map((page) => {
              const isActive = currentPagePath === page.path;
              const isReadme = page.path === 'README.md';
              
              return (
                <Link
                  key={page.id}
                  href={`/${repository.owner.username}/${repository.slug}?path=${encodeURIComponent(page.path)}`}
                  className={`block p-2 rounded-md transition-colors hover:bg-muted/50 ${
                    isActive ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <FileText className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`text-sm font-medium truncate ${
                          isActive ? 'text-primary' : ''
                        }`}>
                          {page.title}
                        </span>
                        {isReadme && (
                          <Badge variant="secondary" className="text-xs">
                            README
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">/{page.path}</span>
                        <span>•</span>
                        <span>#{page.order}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(page.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        {/* Botão de nova página */}
        {isOwner && (
          <Button 
            onClick={onNewPage}
            className="w-full h-8 text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Página
          </Button>
        )}

        {/* Estado vazio */}
        {filteredAndSortedPages.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'Nenhuma página encontrada' : 'Nenhuma página ainda'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}