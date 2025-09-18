'use client'

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, BookOpen, Star } from 'lucide-react'
import Link from 'next/link'
import RepoCard from '@/components/repo-card'
import { RepoCardSkeleton } from '@/components/common/repo-card-skeleton'
import { EmptyState } from '@/components/common/empty-state'

interface Repository {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: 'PUBLIC' | 'PRIVATE'
  starsCount: number
  updatedAt: Date
  owner: {
    username: string
    name: string | null
  }
  _count: {
    pages: number
  }
}

interface DashboardContentProps {
  userId: string
}

type SortOption = 'updated' | 'stars'
type FilterOption = 'all' | 'public' | 'private'

export function DashboardContent({ userId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState('my-repos')
  const [myRepos, setMyRepos] = useState<Repository[]>([])
  const [starredRepos, setStarredRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [myReposRes, starredReposRes] = await Promise.all([
          fetch('/api/dashboard/my-repos'),
          fetch('/api/dashboard/starred-repos')
        ])

        if (myReposRes.ok) {
          const myReposData = await myReposRes.json()
          setMyRepos(myReposData)
        }

        if (starredReposRes.ok) {
          const starredReposData = await starredReposRes.json()
          setStarredRepos(starredReposData)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrar e ordenar repositórios
  const filteredAndSortedRepos = useMemo(() => {
    const repos = activeTab === 'my-repos' ? myRepos : starredRepos
    
    // Filtrar por busca
    let filtered = repos.filter(repo => {
      const searchLower = searchQuery.toLowerCase()
      return (
        repo.name.toLowerCase().includes(searchLower) ||
        (repo.description && repo.description.toLowerCase().includes(searchLower))
      )
    })

    // Filtrar por visibilidade (apenas para "meus repositórios")
    if (activeTab === 'my-repos' && filterBy !== 'all') {
      filtered = filtered.filter(repo => {
        if (filterBy === 'public') return repo.visibility === 'PUBLIC'
        if (filterBy === 'private') return repo.visibility === 'PRIVATE'
        return true
      })
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else {
        return b.starsCount - a.starsCount
      }
    })

    return filtered
  }, [activeTab, myRepos, starredRepos, searchQuery, sortBy, filterBy])

  const renderRepoGrid = (repos: Repository[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))}
        </div>
      )
    }

    if (repos.length === 0) {
      if (searchQuery) {
        return (
          <EmptyState
            icon={<Search className="h-12 w-12" />}
            title="Nenhum resultado encontrado"
            description={`Não encontramos repositórios que correspondam a "${searchQuery}".`}
          />
        )
      }

      if (activeTab === 'my-repos') {
        return (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="Nenhum repositório ainda"
            description="Crie seu primeiro repositório para começar a compartilhar conhecimento."
            action={{
              label: 'Criar Repositório',
              onClick: () => window.location.href = '/new'
            }}
          />
        )
      } else {
        return (
          <EmptyState
            icon={<Star className="h-12 w-12" />}
            title="Nenhum repositório favoritado"
            description="Explore repositórios e favorite os que mais te interessam."
          />
        )
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={{
              ...repo,
              pagesCount: repo._count.pages
            }}
            showOwner={activeTab === 'starred'}
            showActions={true}
          />
        ))}
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger 
            value="my-repos"
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Meus Repositórios
            {!loading && (
              <Badge variant="secondary" className="ml-2">
                {myRepos.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="starred"
            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Starred
            {!loading && (
              <Badge variant="secondary" className="ml-2">
                {starredRepos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {activeTab === 'my-repos' && (
          <Button asChild className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Link href="/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Repositório
            </Link>
          </Button>
        )}
      </div>

      {/* Controles de busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar repositórios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
        </div>

        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48 focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Atualizados</SelectItem>
            <SelectItem value="stars">Populares</SelectItem>
          </SelectContent>
        </Select>

        {activeTab === 'my-repos' && (
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-full sm:w-32 focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="public">Públicos</SelectItem>
              <SelectItem value="private">Privados</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <TabsContent value="my-repos" className="space-y-6">
        {renderRepoGrid(filteredAndSortedRepos)}
      </TabsContent>

      <TabsContent value="starred" className="space-y-6">
        {renderRepoGrid(filteredAndSortedRepos)}
      </TabsContent>
    </Tabs>
  )
}
