import { Session } from 'next-auth'

type RepoWithVisibility = {
  visibility: string
  ownerId: string
}

export function isOwner(userId: string | undefined, ownerId: string): boolean {
  return userId === ownerId
}

export function canViewRepo(
  repo: RepoWithVisibility,
  session: Session | null
): boolean {
  // Repos públicos podem ser vistos por qualquer um
  if (repo.visibility === 'PUBLIC') {
    return true
  }
  
  // Repos privados só podem ser vistos pelo dono
  if (repo.visibility === 'PRIVATE') {
    return isOwner(session?.user?.id, repo.ownerId)
  }
  
  return false
}

export function canEditRepo(
  repo: RepoWithVisibility,
  session: Session | null
): boolean {
  // Só o dono pode editar
  return isOwner(session?.user?.id, repo.ownerId)
}
