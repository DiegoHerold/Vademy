'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { toast } from 'sonner'

interface UserHeaderProps {
  user: {
    name: string | null
    username: string
    image: string | null
  }
  stats: {
    publicReposCount: number
    totalStarsReceived: number
  }
  showShareButton?: boolean
}

export function UserHeader({ user, stats, showShareButton = false }: UserHeaderProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${user.username}`
    const success = await copyToClipboard(url)
    
    if (success) {
      toast.success('Link do perfil copiado!')
    } else {
      toast.error('Erro ao copiar link')
    }
  }

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex items-start gap-6 p-6 border-b">
      <Avatar className="h-20 w-20">
        <AvatarImage src={user.image || undefined} alt={user.name || user.username} />
        <AvatarFallback className="text-lg">
          {getInitials(user.name, user.username)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {user.name || user.username}
            </h1>
            <p className="text-muted-foreground text-lg">
              @{user.username}
            </p>
          </div>
          
          {showShareButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          )}
        </div>
        
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <span className="font-semibold">{stats.publicReposCount}</span>
            <span className="text-muted-foreground ml-1">
              {stats.publicReposCount === 1 ? 'repositório público' : 'repositórios públicos'}
            </span>
          </div>
          <div>
            <span className="font-semibold">{stats.totalStarsReceived}</span>
            <span className="text-muted-foreground ml-1">
              {stats.totalStarsReceived === 1 ? 'star recebido' : 'stars recebidos'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
