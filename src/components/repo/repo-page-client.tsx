'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import { NewPageDialog } from '@/components/editor/new-page-dialog';
import Link from 'next/link';

interface RepoPageClientProps {
  repoId: string;
  owner: string;
  repoName: string;
  isOwner: boolean;
  hasPages: boolean;
}

export function RepoPageClient({ 
  repoId, 
  owner, 
  repoName, 
  isOwner, 
  hasPages 
}: RepoPageClientProps) {
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      {hasPages ? (
        <Button size="sm" onClick={() => setShowNewPageDialog(true)}>
          <Sparkles className="mr-2 h-4 w-4" />
          Nova Página
        </Button>
      ) : (
        <Button onClick={() => setShowNewPageDialog(true)}>
          <Sparkles className="mr-2 h-4 w-4" />
          Criar Primeira Página
        </Button>
      )}

      <NewPageDialog
        open={showNewPageDialog}
        onOpenChange={setShowNewPageDialog}
        repoId={repoId}
        owner={owner}
        repoName={repoName}
      />
    </>
  );
}
