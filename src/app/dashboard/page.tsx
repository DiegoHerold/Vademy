import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus repositórios e veja seus favoritos.
          </p>
        </div>

        <DashboardContent userId={session.user.id} />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard - Vademy',
  description: 'Gerencie seus repositórios e projetos no Vademy'
}
