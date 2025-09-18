import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
        // Buscar dados atualizados do usuário se necessário
        if (token.sub) {
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { image: true }
          })
          session.user.image = user?.image || undefined
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    username?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      username?: string
      image?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string
  }
}
