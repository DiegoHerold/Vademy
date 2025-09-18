'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  BookOpen, 
  FolderOpen, 
  Clock, 
  Star,
  TrendingUp,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface Repository {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  starsCount: number;
  updatedAt: Date;
  owner: {
    username: string;
  };
  _count: {
    pages: number;
  };
}

interface Page {
  id: string;
  title: string;
  path: string;
  updatedAt: Date;
  repo: {
    name: string;
    slug: string;
    owner: {
      username: string;
    };
  };
}

interface UserNavProps {
  repositories: Repository[];
  pages: Page[];
  username: string;
  className?: string;
}

export function UserNav({ repositories, pages, username, className }: UserNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'repos' | 'pages'>('repos');

  // Filtrar repositórios
  const filteredRepos = useMemo(() => {
    return repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [repositories, searchQuery]);

  // Filtrar páginas
  const filteredPages = useMemo(() => {
    return pages.filter(page =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Navegação Rápida
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar repositórios e páginas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === 'repos' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('repos')}
            className="h-7 px-3 text-xs"
          >
            <FolderOpen className="h-3 w-3 mr-1" />
            Repositórios ({filteredRepos.length})
          </Button>
          <Button
            variant={activeTab === 'pages' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('pages')}
            className="h-7 px-3 text-xs"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Páginas ({filteredPages.length})
          </Button>
        </div>

        {/* Conteúdo */}
        <ScrollArea className="h-[300px]">
          {activeTab === 'repos' ? (
            <div className="space-y-2">
              {filteredRepos.map((repo) => (
                <Link
                  key={repo.id}
                  href={`/${repo.owner.username}/${repo.slug}`}
                  className="block p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <FolderOpen className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{repo.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {repo.starsCount}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{repo._count.pages} páginas</span>
                        <span>•</span>
                        <span>{new Date(repo.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.repo.owner.username}/${page.repo.slug}?path=${encodeURIComponent(page.path)}`}
                  className="block p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{page.title}</span>
                        {page.path === 'README.md' && (
                          <Badge variant="secondary" className="text-xs">
                            README
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {page.repo.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>/{page.path}</span>
                        <span>•</span>
                        <span>{new Date(page.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Estado vazio */}
        {((activeTab === 'repos' && filteredRepos.length === 0) || 
          (activeTab === 'pages' && filteredPages.length === 0)) && (
          <div className="text-center py-6 text-muted-foreground">
            {activeTab === 'repos' ? (
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            ) : (
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            )}
            <p className="text-sm">
              {searchQuery 
                ? `Nenhum${activeTab === 'repos' ? ' repositório' : 'a página'} encontrad${activeTab === 'repos' ? 'o' : 'a'}`
                : `Nenhum${activeTab === 'repos' ? ' repositório' : 'a página'} ainda`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}