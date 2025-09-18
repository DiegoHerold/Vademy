import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuários de exemplo
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@vademy.com' },
      update: {},
      create: {
        email: 'admin@vademy.com',
        username: 'admin',
        name: 'Administrador',
        passwordHash: await bcrypt.hash('123456', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'joao@example.com' },
      update: {},
      create: {
        email: 'joao@example.com',
        username: 'joao_dev',
        name: 'João Silva',
        passwordHash: await bcrypt.hash('123456', 10),
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria@example.com' },
      update: {},
      create: {
        email: 'maria@example.com',
        username: 'maria_code',
        name: 'Maria Santos',
        passwordHash: await bcrypt.hash('123456', 10),
      },
    }),
  ])

  console.log('✅ Usuários criados')

  // Criar repositórios de exemplo
  const repos = [
    {
      name: 'Guia Completo de React',
      slug: 'guia-completo-react',
      description: 'Um guia completo para aprender React do básico ao avançado, com exemplos práticos e projetos reais.',
      ownerId: users[0].id,
      starsCount: 45,
    },
    {
      name: 'Node.js para Iniciantes',
      slug: 'nodejs-iniciantes',
      description: 'Aprenda Node.js desde o básico: instalação, conceitos fundamentais, APIs REST e muito mais.',
      ownerId: users[1].id,
      starsCount: 32,
    },
    {
      name: 'Python Data Science',
      slug: 'python-data-science',
      description: 'Introdução à ciência de dados com Python: pandas, numpy, matplotlib e machine learning.',
      ownerId: users[2].id,
      starsCount: 28,
    },
    {
      name: 'Git e GitHub Essencial',
      slug: 'git-github-essencial',
      description: 'Domine o controle de versão com Git e colaboração no GitHub. Workflows, branches e muito mais.',
      ownerId: users[0].id,
      starsCount: 67,
    },
    {
      name: 'TypeScript do Zero',
      slug: 'typescript-do-zero',
      description: 'Aprenda TypeScript: tipos, interfaces, generics e como usar com React e Node.js.',
      ownerId: users[1].id,
      starsCount: 41,
    },
    {
      name: 'Docker para Desenvolvedores',
      slug: 'docker-desenvolvedores',
      description: 'Containerização com Docker: conceitos, Dockerfile, docker-compose e deploy em produção.',
      ownerId: users[2].id,
      starsCount: 23,
    },
    {
      name: 'Next.js Full Stack',
      slug: 'nextjs-full-stack',
      description: 'Construa aplicações full-stack com Next.js: SSR, API Routes, autenticação e deploy.',
      ownerId: users[0].id,
      starsCount: 38,
    },
    {
      name: 'CSS Moderno e Responsivo',
      slug: 'css-moderno-responsivo',
      description: 'CSS Grid, Flexbox, animações e design responsivo. Crie layouts modernos e profissionais.',
      ownerId: users[1].id,
      starsCount: 19,
    },
  ]

  const createdRepos = []
  for (const repo of repos) {
    const createdRepo = await prisma.manualRepo.upsert({
      where: { 
        ownerId_slug: {
          ownerId: repo.ownerId,
          slug: repo.slug
        }
      },
      update: {},
      create: repo,
    })
    createdRepos.push(createdRepo)
  }

  console.log('✅ Repositórios criados')

  // Criar páginas de exemplo para alguns repositórios
  const pages = [
    // React Guide
    {
      repoId: createdRepos[0].id,
      path: 'introducao',
      title: 'Introdução ao React',
      contentMd: '# Introdução ao React\n\nReact é uma biblioteca JavaScript para construir interfaces de usuário...',
      order: 1,
    },
    {
      repoId: createdRepos[0].id,
      path: 'componentes',
      title: 'Componentes e Props',
      contentMd: '# Componentes e Props\n\nComponentes são a base do React. Eles permitem dividir a UI em partes independentes...',
      order: 2,
    },
    {
      repoId: createdRepos[0].id,
      path: 'hooks',
      title: 'React Hooks',
      contentMd: '# React Hooks\n\nHooks são uma adição ao React 16.8 que permite usar estado e outras funcionalidades...',
      order: 3,
    },
    // Node.js Guide
    {
      repoId: createdRepos[1].id,
      path: 'instalacao',
      title: 'Instalação e Configuração',
      contentMd: '# Instalação do Node.js\n\nPara começar com Node.js, primeiro precisamos instalá-lo...',
      order: 1,
    },
    {
      repoId: createdRepos[1].id,
      path: 'primeiro-servidor',
      title: 'Seu Primeiro Servidor',
      contentMd: '# Criando seu Primeiro Servidor\n\nVamos criar um servidor HTTP simples com Node.js...',
      order: 2,
    },
    // Git Guide
    {
      repoId: createdRepos[3].id,
      path: 'conceitos-basicos',
      title: 'Conceitos Básicos do Git',
      contentMd: '# Conceitos Básicos do Git\n\nGit é um sistema de controle de versão distribuído...',
      order: 1,
    },
    {
      repoId: createdRepos[3].id,
      path: 'comandos-essenciais',
      title: 'Comandos Essenciais',
      contentMd: '# Comandos Essenciais do Git\n\nAqui estão os comandos que você usará diariamente...',
      order: 2,
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: {
        repoId_path: {
          repoId: page.repoId,
          path: page.path
        }
      },
      update: {},
      create: page,
    })
  }

  console.log('✅ Páginas criadas')

  // Criar algumas estrelas
  const stars = [
    { userId: users[1].id, repoId: createdRepos[0].id },
    { userId: users[2].id, repoId: createdRepos[0].id },
    { userId: users[0].id, repoId: createdRepos[1].id },
    { userId: users[2].id, repoId: createdRepos[3].id },
    { userId: users[1].id, repoId: createdRepos[3].id },
  ]

  for (const star of stars) {
    await prisma.star.upsert({
      where: {
        userId_repoId: {
          userId: star.userId,
          repoId: star.repoId
        }
      },
      update: {},
      create: star,
    })
  }

  console.log('✅ Estrelas criadas')
  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })