import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, FileText, Lock, Globe, ExternalLink, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { copyToClipboard } from '@/lib/utils'
import { toast } from 'sonner'

interface RepoCardProps {
  repo: {
    id: string
    name: string
    slug: string
    description: string | null
    visibility: 'PUBLIC' | 'PRIVATE'
    starsCount: number
    pagesCount?: number
    updatedAt: Date
    owner: {
      username: string
      name: string | null
    }
  }
  showOwner?: boolean
  showActions?: boolean
}

export default function RepoCard({ repo, showOwner = true, showActions = false }: RepoCardProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/${repo.owner.username}/${repo.slug}`
    const success = await copyToClipboard(url)
    
    if (success) {
      toast.success('Link do repositório copiado!')
    } else {
      toast.error('Erro ao copiar link')
    }
  }
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">
              <Link 
                href={`/${repo.owner.username}/${repo.slug}`}
                className="hover:text-primary transition-colors"
              >
                {showOwner && (
                  <span className="text-muted-foreground font-normal">
                    {repo.owner.username}/
                  </span>
                )}
                {repo.name}
              </Link>
            </CardTitle>
            {repo.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {repo.description}
              </CardDescription>
            )}
          </div>
          <div className="ml-2 flex-shrink-0">
            {repo.visibility === 'PRIVATE' ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {repo.starsCount}
            </div>
            {repo.pagesCount !== undefined && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {repo.pagesCount} páginas
              </div>
            )}
          </div>
          <div>
            Atualizado {formatDistanceToNow(repo.updatedAt, { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {repo.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
          </Badge>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Link href={`/${repo.owner.username}/${repo.slug}`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
