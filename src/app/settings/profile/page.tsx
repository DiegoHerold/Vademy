import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProfileForm } from './profile-form'

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/settings"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Configurações
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Configurações do Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais e como outros usuários te veem.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}
