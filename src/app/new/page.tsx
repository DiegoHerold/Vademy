import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreateRepoForm from '@/components/create-repo-form'

export default async function NewPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Criar Novo Repositório</h1>
          <p className="text-muted-foreground">
            Crie um novo repositório para compartilhar seu conhecimento
          </p>
        </div>

        <CreateRepoForm />
      </div>
    </div>
  )
}
