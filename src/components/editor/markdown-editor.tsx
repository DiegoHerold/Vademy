'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Link, 
  Image, 
  Quote,
  Sparkles,
  FileText,
  ExternalLink
} from 'lucide-react';
import { NewPageDialog } from './new-page-dialog';
import { SnippetDialog } from './snippet-dialog';
import { InsertLinkDialog } from './insert-link-dialog';

type ToolbarButton = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
} | {
  type: 'separator';
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  repoId?: string;
  owner?: string;
  repoName?: string;
  showTemplateButton?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Digite seu conteúdo em Markdown...',
  className,
  repoId,
  owner,
  repoName,
  showTemplateButton = false
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [showSnippetDialog, setShowSnippetDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  // Inserir texto na posição do cursor
  const insertText = useCallback((text: string, selectText = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);

    // Reposicionar cursor
    setTimeout(() => {
      if (selectText) {
        textarea.setSelectionRange(start, start + text.length);
      } else {
        textarea.setSelectionRange(start + text.length, start + text.length);
      }
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // Envolver texto selecionado
  const wrapText = useCallback((before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = before + selectedText + after;
    const newValue = value.substring(0, start) + newText + value.substring(end);
    
    onChange(newValue);

    // Reposicionar cursor
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length);
      }
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // Inserir no início da linha
  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = value.split('\n');
    let currentPos = 0;
    let lineIndex = 0;

    // Encontrar linha atual
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= start) {
        lineIndex = i;
        break;
      }
      currentPos += lines[i].length + 1; // +1 para o \n
    }

    // Inserir prefixo na linha
    lines[lineIndex] = prefix + lines[lineIndex];
    const newValue = lines.join('\n');
    
    onChange(newValue);

    // Reposicionar cursor
    setTimeout(() => {
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertAtLineStart('# ')
    },
    {
      icon: Heading2,
      label: 'Heading 2', 
      action: () => insertAtLineStart('## ')
    },
    { type: 'separator' },
    {
      icon: Bold,
      label: 'Negrito',
      action: () => wrapText('**')
    },
    {
      icon: Italic,
      label: 'Itálico',
      action: () => wrapText('*')
    },
    {
      icon: Code,
      label: 'Código inline',
      action: () => wrapText('`')
    },
    { type: 'separator' },
    {
      icon: List,
      label: 'Lista',
      action: () => insertAtLineStart('- ')
    },
    {
      icon: ListOrdered,
      label: 'Lista numerada',
      action: () => insertAtLineStart('1. ')
    },
    {
      icon: CheckSquare,
      label: 'Checklist',
      action: () => insertAtLineStart('- [ ] ')
    },
    { type: 'separator' },
    {
      icon: Quote,
      label: 'Citação',
      action: () => insertAtLineStart('> ')
    },
    {
      icon: Link,
      label: 'Inserir Link',
      action: () => setShowLinkDialog(true)
    },
    {
      icon: Image,
      label: 'Imagem',
      action: () => insertText('![Alt text](url)')
    },
    { type: 'separator' },
    {
      icon: FileText,
      label: 'Snippets',
      action: () => setShowSnippetDialog(true)
    }
  ];

  // Adicionar botão de template se disponível
  if (showTemplateButton && repoId && owner && repoName) {
    toolbarButtons.push({
      icon: Sparkles,
      label: 'Novo com Template',
      action: () => setShowNewPageDialog(true)
    });
  }

  return (
    <TooltipProvider>
      <div className={className}>
        {/* Toolbar */}
        <div className="border border-b-0 rounded-t-md bg-muted/30 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {toolbarButtons.map((button, index) => {
              if ('type' in button && button.type === 'separator') {
                return <Separator key={index} orientation="vertical" className="h-8 mx-2" />;
              }

              const iconButton = button as Extract<ToolbarButton, { icon: any }>;
              const Icon = iconButton.icon;
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={iconButton.action}
                      className="h-10 w-10 p-0 hover:bg-primary/10"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{iconButton.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Botão Generate README (stub) */}
            <Separator orientation="vertical" className="h-8 mx-2" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="h-10 px-4 text-sm"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gerar README com IA (em breve)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Editor */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[700px] font-mono text-base leading-relaxed border-t-0 rounded-t-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 p-8 text-gray-800 dark:text-gray-200"
          style={{ 
            fontSize: '16px',
            lineHeight: '1.6',
            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          }}
        />

        {/* Dialogs */}
        {repoId && owner && repoName && (
          <NewPageDialog
            open={showNewPageDialog}
            onOpenChange={setShowNewPageDialog}
            repoId={repoId}
            owner={owner}
            repoName={repoName}
          />
        )}

        <SnippetDialog
          open={showSnippetDialog}
          onOpenChange={setShowSnippetDialog}
          onInsert={insertText}
        />

        <InsertLinkDialog
          open={showLinkDialog}
          onOpenChange={setShowLinkDialog}
          onInsert={insertText}
        />
      </div>
    </TooltipProvider>
  );
}
