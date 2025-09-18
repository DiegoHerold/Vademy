'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StarButtonProps {
  repoId: string
  initialStarred: boolean
  initialCount: number
}

export default function StarButton({ repoId, initialStarred, initialCount }: StarButtonProps) {
  const { data: session } = useSession()
  const [isStarred, setIsStarred] = useState(initialStarred)
  const [starsCount, setStarsCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStar = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/repos/${repoId}/star`, {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok) {
        setIsStarred(result.isStarred)
        setStarsCount(result.starsCount)
      }
    } catch (error) {
      console.error('Erro ao dar star:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant={isStarred ? "default" : "outline"} 
      size="sm"
      onClick={handleStar}
      disabled={isLoading}
    >
      <Star className={`mr-2 h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
      {isStarred ? 'Starred' : 'Star'} {starsCount}
    </Button>
  )
}
