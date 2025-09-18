'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DeletePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: {
    id: string;
    title: string;
    path: string;
  };
  onDeleted: () => void;
}

export function DeletePageDialog({ 
  open, 
  onOpenChange, 
  page, 
  onDeleted 
}: DeletePageDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir página');
      }

      toast.success(`Página "${page.title}" excluída com sucesso!`);
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao excluir página:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir página');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Excluir Página</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-destructive">
            <h4 className="font-semibold text-sm mb-1">Página a ser excluída:</h4>
            <p className="font-mono text-sm">{page.title}</p>
            <p className="text-xs text-muted-foreground mt-1">/{page.path}</p>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Ao confirmar, esta página será permanentemente removida do repositório. 
            Todo o conteúdo será perdido e não poderá ser recuperado.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir Página
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}