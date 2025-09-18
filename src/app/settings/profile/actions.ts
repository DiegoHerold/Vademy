'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome deve ter no máximo 50 caracteres'),
  username: z.string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30, 'Username deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username deve conter apenas letras, números, hífens e underscores'),
  image: z.string().url('URL da imagem inválida').optional().or(z.literal(''))
})

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('Usuário não autenticado')
  }

  const data = {
    name: formData.get('name') as string,
    username: formData.get('username') as string,
    image: formData.get('image') as string
  }

  // Validação com Zod
  const validationResult = updateProfileSchema.safeParse(data)
  
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors
    }
  }

  const { name, username, image } = validationResult.data

  try {
    // Verificar se o username já está em uso por outro usuário
    if (username !== session.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return {
          success: false,
          errors: {
            username: ['Este username já está em uso']
          }
        }
      }
    }

    // Atualizar o perfil
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
        image: image || null
      }
    })

    return {
      success: true,
      message: 'Perfil atualizado com sucesso!'
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return {
      success: false,
      errors: {
        _form: ['Erro interno do servidor']
      }
    }
  }
}
