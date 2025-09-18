'use client';

import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  User, 
  FolderOpen, 
  FileText, 
  Edit, 
  Plus,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface PageBreadcrumbProps {
  items: BreadcrumbItemType[];
  actions?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbItemType {
  type: 'home' | 'user' | 'repo' | 'page' | 'edit' | 'new';
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive?: boolean;
}

const iconMap = {
  home: Home,
  user: User,
  repo: FolderOpen,
  page: FileText,
  edit: Edit,
  new: Plus,
};

export function PageBreadcrumb({ items, actions, className }: PageBreadcrumbProps) {
  return (
    <div className={`flex items-center justify-between py-4 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const Icon = item.icon || iconMap[item.type];
            const isLast = index === items.length - 1;

            return (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="flex items-center gap-2 font-medium">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      href={item.href}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-xs ml-1">
                          {item.badge}
                        </Badge>
                      )}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// Funções utilitárias para criar breadcrumbs comuns
export const createRepoBreadcrumb = (owner: string, repoName: string, repoDescription?: string) => [
  {
    type: 'home' as const,
    label: 'Início',
    href: '/',
  },
  {
    type: 'user' as const,
    label: owner,
    href: `/profile/${owner}`,
  },
  {
    type: 'repo' as const,
    label: repoName,
    href: `/${owner}/${repoName}`,
    badge: repoDescription ? 'Público' : undefined,
  },
];

export const createPageBreadcrumb = (
  owner: string, 
  repoName: string, 
  pagePath: string, 
  pageTitle: string
) => [
  ...createRepoBreadcrumb(owner, repoName),
  {
    type: 'page' as const,
    label: pageTitle,
    href: `/${owner}/${repoName}?path=${encodeURIComponent(pagePath)}`,
    badge: pagePath === 'README.md' ? 'README' : undefined,
  },
];

export const createEditBreadcrumb = (
  owner: string, 
  repoName: string, 
  pagePath: string, 
  pageTitle: string
) => [
  ...createPageBreadcrumb(owner, repoName, pagePath, pageTitle),
  {
    type: 'edit' as const,
    label: 'Editando',
    isActive: true,
  },
];

export const createNewPageBreadcrumb = (owner: string, repoName: string) => [
  ...createRepoBreadcrumb(owner, repoName),
  {
    type: 'new' as const,
    label: 'Nova Página',
    isActive: true,
  },
];