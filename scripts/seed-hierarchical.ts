import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedHierarchical() {
  console.log('🌱 Iniciando seed da estrutura hierárquica...')

  try {
    // 1. Criar usuários de exemplo
    console.log('👥 Criando usuários...')
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@vademy.com' },
      update: {},
      create: {
        email: 'admin@vademy.com',
        username: 'admin',
        name: 'Administrador',
        passwordHash: await bcrypt.hash('123456', 10),
      },
    })

    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@vademy.com' },
      update: {},
      create: {
        email: 'demo@vademy.com',
        username: 'demo',
        name: 'Usuário Demo',
        passwordHash: await bcrypt.hash('123456', 10),
      },
    })

    console.log('✅ Usuários criados')

    // 2. Criar bibliotecas
    console.log('📚 Criando bibliotecas...')
    
    const frontendLibrary = await prisma.library.create({
      data: {
        ownerId: adminUser.id,
        name: 'Frontend',
        slug: 'frontend',
        description: 'Tecnologias e frameworks para desenvolvimento frontend',
        icon: '🎨',
        color: '#3B82F6',
        order: 1
      }
    })

    const backendLibrary = await prisma.library.create({
      data: {
        ownerId: adminUser.id,
        name: 'Backend',
        slug: 'backend',
        description: 'Servidores, APIs e tecnologias backend',
        icon: '⚙️',
        color: '#10B981',
        order: 2
      }
    })

    const devopsLibrary = await prisma.library.create({
      data: {
        ownerId: adminUser.id,
        name: 'DevOps',
        slug: 'devops',
        description: 'Ferramentas de deploy, CI/CD e infraestrutura',
        icon: '🚀',
        color: '#F59E0B',
        order: 3
      }
    })

    const databaseLibrary = await prisma.library.create({
      data: {
        ownerId: adminUser.id,
        name: 'Banco de Dados',
        slug: 'database',
        description: 'Bancos de dados relacionais e NoSQL',
        icon: '🗄️',
        color: '#8B5CF6',
        order: 4
      }
    })

    const mobileLibrary = await prisma.library.create({
      data: {
        ownerId: adminUser.id,
        name: 'Mobile',
        slug: 'mobile',
        description: 'Desenvolvimento para dispositivos móveis',
        icon: '📱',
        color: '#EF4444',
        order: 5
      }
    })

    console.log('✅ Bibliotecas criadas')

    // 3. Criar repositórios
    console.log('📁 Criando repositórios...')
    
    // Repositórios Frontend
    const reactRepo = await prisma.repository.create({
      data: {
        ownerId: adminUser.id,
        libraryId: frontendLibrary.id,
        name: 'React Avançado',
        slug: 'react-avancado',
        description: 'Conceitos avançados do React para desenvolvedores experientes',
        starsCount: 15,
        order: 1
      }
    })

    const vueRepo = await prisma.repository.create({
      data: {
        ownerId: adminUser.id,
        libraryId: frontendLibrary.id,
        name: 'Vue Fundamentos',
        slug: 'vue-fundamentos',
        description: 'Aprenda Vue.js do básico ao avançado',
        starsCount: 8,
        order: 2
      }
    })

    const svelteRepo = await prisma.repository.create({
      data: {
        ownerId: demoUser.id,
        libraryId: frontendLibrary.id,
        name: 'SvelteKit Introdução',
        slug: 'sveltekit-intro',
        description: 'Primeiros passos com SvelteKit',
        starsCount: 5,
        order: 3
      }
    })

    // Repositórios Backend
    const nodeRepo = await prisma.repository.create({
      data: {
        ownerId: adminUser.id,
        libraryId: backendLibrary.id,
        name: 'Node.js APIs',
        slug: 'nodejs-apis',
        description: 'Construindo APIs robustas com Node.js',
        starsCount: 12,
        order: 1
      }
    })

    const pythonRepo = await prisma.repository.create({
      data: {
        ownerId: demoUser.id,
        libraryId: backendLibrary.id,
        name: 'Python Web',
        slug: 'python-web',
        description: 'Desenvolvimento web com Python e FastAPI',
        starsCount: 7,
        order: 2
      }
    })

    // Repositório independente (sem biblioteca)
    const independentRepo = await prisma.repository.create({
      data: {
        ownerId: demoUser.id,
        name: 'Git Essencial',
        slug: 'git-essencial',
        description: 'Controle de versão com Git - guia completo',
        starsCount: 20,
        order: 1
      }
    })

    console.log('✅ Repositórios criados')

    // 4. Criar guias
    console.log('📄 Criando guias...')
    
    // Guias do React Avançado
    await prisma.guide.create({
      data: {
        ownerId: adminUser.id,
        repositoryId: reactRepo.id,
        title: 'Introdução ao React Avançado',
        slug: 'introducao-react-avancado',
        description: 'Conceitos fundamentais para React avançado',
        contentMd: `# Introdução ao React Avançado

## O que você vai aprender

Neste guia, você vai dominar:

- **Hooks customizados** - Criando lógica reutilizável
- **Context API** - Gerenciamento de estado global
- **Performance** - Otimizações e melhores práticas
- **Patterns** - Padrões avançados de componentes

## Pré-requisitos

- Conhecimento básico de React
- JavaScript ES6+
- Hooks básicos (useState, useEffect)

## Vamos começar!

React é uma biblioteca poderosa, mas para tirar o máximo proveito dela, precisamos entender conceitos mais avançados...`,
        order: 1,
        isReadme: true
      }
    })

    await prisma.guide.create({
      data: {
        ownerId: adminUser.id,
        repositoryId: reactRepo.id,
        title: 'Hooks Essenciais',
        slug: 'hooks-essenciais',
        description: 'Dominando os hooks mais importantes do React',
        contentMd: `# Hooks Essenciais

## useState Avançado

O \`useState\` vai além de valores simples:

\`\`\`jsx
// Estado com objeto
const [user, setUser] = useState({
  name: '',
  email: '',
  preferences: {}
})

// Atualização funcional
setUser(prev => ({
  ...prev,
  name: 'João'
}))
\`\`\`

## useEffect Patterns

\`\`\`jsx
// Cleanup function
useEffect(() => {
  const subscription = api.subscribe()
  
  return () => {
    subscription.unsubscribe()
  }
}, [])
\`\`\`

## Custom Hooks

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  })
  
  const setStoredValue = (value) => {
    setValue(value)
    localStorage.setItem(key, JSON.stringify(value))
  }
  
  return [value, setStoredValue]
}
\`\`\``,
        order: 2
      }
    })

    await prisma.guide.create({
      data: {
        ownerId: adminUser.id,
        repositoryId: reactRepo.id,
        title: 'Gerenciamento de Estado',
        slug: 'gerenciamento-estado',
        description: 'Context API, Zustand e outras soluções',
        contentMd: `# Gerenciamento de Estado

## Context API

\`\`\`jsx
const ThemeContext = createContext()

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
\`\`\`

## Zustand (Alternativa Simples)

\`\`\`jsx
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
\`\`\``,
        order: 3
      }
    })

    // Guias do Vue Fundamentos
    await prisma.guide.create({
      data: {
        ownerId: adminUser.id,
        repositoryId: vueRepo.id,
        title: 'Começando com Vue',
        slug: 'comecando-vue',
        description: 'Primeiros passos com Vue.js',
        contentMd: `# Começando com Vue

## O que é Vue.js?

Vue.js é um framework progressivo para construir interfaces de usuário.

## Instalação

\`\`\`bash
npm create vue@latest meu-projeto
cd meu-projeto
npm install
npm run dev
\`\`\`

## Primeiro Componente

\`\`\`vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="updateMessage">Clique aqui</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Olá Vue!')

function updateMessage() {
  message.value = 'Vue é incrível!'
}
</script>
\`\`\``,
        order: 1,
        isReadme: true
      }
    })

    // Guia independente
    await prisma.guide.create({
      data: {
        ownerId: demoUser.id,
        title: 'Git para Iniciantes',
        slug: 'git-iniciantes',
        description: 'Aprenda Git do zero',
        contentMd: `# Git para Iniciantes

## O que é Git?

Git é um sistema de controle de versão distribuído.

## Comandos Básicos

\`\`\`bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Primeiro commit"

# Ver status
git status

# Ver histórico
git log
\`\`\`

## Branches

\`\`\`bash
# Criar branch
git branch feature/nova-funcionalidade

# Trocar de branch
git checkout feature/nova-funcionalidade

# Ou criar e trocar
git checkout -b feature/nova-funcionalidade
\`\`\``,
        order: 1
      }
    })

    console.log('✅ Guias criados')

    // 5. Criar algumas estrelas
    console.log('⭐ Criando estrelas...')
    
    await prisma.star.createMany({
      data: [
        { userId: demoUser.id, repositoryId: reactRepo.id },
        { userId: demoUser.id, repositoryId: nodeRepo.id },
        { userId: adminUser.id, repositoryId: independentRepo.id }
      ]
    })

    console.log('✅ Estrelas criadas')

    console.log('🎉 Seed da estrutura hierárquica concluído!')
    console.log(`
📊 Resumo:
- 2 usuários criados
- 5 bibliotecas criadas
- 6 repositórios criados
- 5 guias criados
- 3 estrelas criadas

🔗 Estrutura:
📚 Frontend
  └── 📁 React Avançado (3 guias)
  └── 📁 Vue Fundamentos (1 guia)
  └── 📁 SvelteKit Introdução

📚 Backend
  └── 📁 Node.js APIs
  └── 📁 Python Web

📚 DevOps (vazia)
📚 Banco de Dados (vazia)  
📚 Mobile (vazia)

📄 Guias Independentes
  └── Git para Iniciantes
`)

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  seedHierarchical()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedHierarchical }