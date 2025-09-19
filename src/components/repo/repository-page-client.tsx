'use client';

import { useState } from 'react';
import { PageSidebar } from '@/components/navigation/page-sidebar';
import { NewPageDialog } from '@/components/editor/new-page-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, FileText, Lock, Globe } from 'lucide-react';

type GuideType = {
  id: string;
  title: string;
  slug: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type Repository = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  starsCount: number;
  updatedAt: Date;
  owner: {
    id: string;
    username: string;
    name: string | null;
  };
  guides: GuideType[];
  _count: {
    guides: number;
  };
};

interface RepositoryPageClientProps {
  repository: Repository;
  currentPagePath?: string;
  isOwner: boolean;
  children: React.ReactNode;
}

export function RepositoryPageClient({
  repository,
  currentPagePath,
  isOwner,
  children
}: RepositoryPageClientProps) {
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);

  const handleNewPage = () => {
    setShowNewPageDialog(true);
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar de navegação */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <PageSidebar
              repository={repository}
              pages={repository.guides.map(guide => ({
                id: guide.id,
                title: guide.title,
                path: guide.slug + '.md',
                order: guide.order,
                createdAt: guide.createdAt,
                updatedAt: guide.updatedAt
              }))}
              currentPagePath={currentPagePath}
              isOwner={isOwner}
              onNewPage={handleNewPage}
            />
            
            {/* Info do repositório */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {repository.visibility === 'PRIVATE' ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    Sobre
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {repository.description && (
                  <p className="text-muted-foreground">{repository.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Visibilidade</span>
                    <Badge variant={repository.visibility === 'PUBLIC' ? 'secondary' : 'outline'}>
                      {repository.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stars</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repository.starsCount}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Guias</span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {repository._count.guides}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Atualizado</span>
                    <span className="text-xs">
                      {new Date(repository.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>

      {/* Dialog de nova página */}
      <NewPageDialog
        open={showNewPageDialog}
        onOpenChange={setShowNewPageDialog}
        repoId={repository.id}
        owner={repository.owner.username}
        repoName={repository.slug}
      />
    </>
  );
}