import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash da senha padrão
  const hashedPassword = await bcrypt.hash('Admin!123', 12)

  // 1. Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vademy.dev' },
    update: {},
    create: {
      email: 'admin@vademy.dev',
      username: 'admin',
      name: 'Admin Vademy',
      passwordHash: hashedPassword,
    },
  })

  // 2. Criar outros usuários
  const user1 = await prisma.user.upsert({
    where: { email: 'joao@example.com' },
    update: {},
    create: {
      email: 'joao@example.com',
      username: 'joaodev',
      name: 'João Silva',
      passwordHash: await bcrypt.hash('123456', 12),
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      email: 'maria@example.com',
      username: 'mariaprog',
      name: 'Maria Santos',
      passwordHash: await bcrypt.hash('123456', 12),
    },
  })

  console.log('✅ Users created')

  // 3. Criar repositórios
  const repo1 = await prisma.manualRepo.upsert({
    where: {
      ownerId_slug: {
        ownerId: admin.id,
        slug: 'javascript-fundamentals'
      }
    },
    update: {},
    create: {
      ownerId: admin.id,
      name: 'JavaScript Fundamentals',
      slug: 'javascript-fundamentals',
      description: 'Aprenda os fundamentos do JavaScript com exemplos práticos',
      visibility: 'PUBLIC',
      starsCount: 15,
    },
  })

  const repo2 = await prisma.manualRepo.upsert({
    where: {
      ownerId_slug: {
        ownerId: user1.id,
        slug: 'react-hooks-guide'
      }
    },
    update: {},
    create: {
      ownerId: user1.id,
      name: 'React Hooks Guide',
      slug: 'react-hooks-guide',
      description: 'Guia completo sobre React Hooks e suas aplicações',
      visibility: 'PUBLIC',
      starsCount: 8,
    },
  })

  const repo3 = await prisma.manualRepo.upsert({
    where: {
      ownerId_slug: {
        ownerId: user2.id,
        slug: 'private-notes'
      }
    },
    update: {},
    create: {
      ownerId: user2.id,
      name: 'Private Notes',
      slug: 'private-notes',
      description: 'Minhas anotações pessoais sobre programação',
      visibility: 'PRIVATE',
      starsCount: 0,
    },
  })

  // Mais repositórios com conteúdo diversificado
  const repo4 = await prisma.manualRepo.upsert({
    where: {
      ownerId_slug: {
        ownerId: admin.id,
        slug: 'python-para-iniciantes'
      }
    },
    update: {},
    create: {
      ownerId: admin.id,
      name: 'Python para Iniciantes',
      slug: 'python-para-iniciantes',
      description: 'Aprenda Python do zero com exemplos práticos e projetos reais',
      visibility: 'PUBLIC',
      starsCount: 23,
    },
  })

  const repo5 = await prisma.manualRepo.upsert({
    where: {
      ownerId_slug: {
        ownerId: user1.id,
        slug: 'nodejs-api-rest'
      }
    },
    update: {},
    create: {
      ownerId: user1.id,
      name: 'Node.js API REST',
      slug: 'nodejs-api-rest',
      description: 'Como criar APIs RESTful robustas com Node.js e Express',
      visibility: 'PUBLIC',
      starsCount: 12,
    },
  })

  const repo6 = await prisma.manualRepo.upsert({
    where: {
      ownerId_slug: {
        ownerId: user2.id,
        slug: 'css-moderno'
      }
    },
    update: {},
    create: {
      ownerId: user2.id,
      name: 'CSS Moderno',
      slug: 'css-moderno',
      description: 'Flexbox, Grid, animações e as melhores práticas de CSS',
      visibility: 'PUBLIC',
      starsCount: 18,
    },
  })

  console.log('✅ Repositories created')

  // 4. Criar páginas para cada repositório

  // Páginas do JavaScript Fundamentals
  const pages1 = [
    {
      path: 'README.md',
      title: 'Introdução ao JavaScript',
      contentMd: `# JavaScript Fundamentals

Bem-vindo ao curso de fundamentos do JavaScript! 🚀

## O que você vai aprender

- Variáveis e tipos de dados
- Funções e escopo
- Arrays e objetos
- Controle de fluxo
- DOM manipulation

## Pré-requisitos

- Conhecimento básico de HTML
- Vontade de aprender!

Vamos começar nossa jornada no mundo do JavaScript!`,
      order: 0,
    },
    {
      path: 'variables.md',
      title: 'Variáveis e Tipos',
      contentMd: `# Variáveis e Tipos de Dados

## Declarando Variáveis

\`\`\`javascript
// var - escopo de função (evite usar)
var nome = 'João';

// let - escopo de bloco
let idade = 25;

// const - constante
const PI = 3.14159;
\`\`\`

## Tipos Primitivos

- **String**: \`"texto"\` ou \`'texto'\`
- **Number**: \`42\` ou \`3.14\`
- **Boolean**: \`true\` ou \`false\`
- **Undefined**: valor não definido
- **Null**: ausência intencional de valor

## Exercícios

1. Declare uma variável com seu nome
2. Crie uma constante para armazenar sua idade
3. Teste o typeof de diferentes valores`,
      order: 1,
    },
    {
      path: 'functions.md',
      title: 'Funções',
      contentMd: `# Funções em JavaScript

## Declaração de Funções

\`\`\`javascript
// Function declaration
function saudacao(nome) {
  return "Olá, " + nome + "!";
}

// Function expression
const despedida = function(nome) {
  return "Tchau, " + nome + "!";
};

// Arrow function
const cumprimento = (nome) => {
  return \`Oi, \${nome}!\`;
};

// Arrow function simplificada
const ola = nome => \`Olá, \${nome}!\`;
\`\`\`

## Parâmetros e Argumentos

\`\`\`javascript
function calcular(a, b, operacao = '+') {
  switch(operacao) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default: return 0;
  }
}
\`\`\``,
      order: 2,
    },
    {
      path: 'arrays.md',
      title: 'Arrays e Objetos',
      contentMd: `# Arrays e Objetos

## Arrays

\`\`\`javascript
// Criando arrays
const frutas = ['maçã', 'banana', 'laranja'];
const numeros = [1, 2, 3, 4, 5];

// Métodos úteis
frutas.push('uva'); // adiciona no final
frutas.pop(); // remove do final
frutas.unshift('morango'); // adiciona no início
frutas.shift(); // remove do início

// Iteração
frutas.forEach(fruta => console.log(fruta));
const frutasUpper = frutas.map(fruta => fruta.toUpperCase());
const frutasComA = frutas.filter(fruta => fruta.includes('a'));
\`\`\`

## Objetos

\`\`\`javascript
const pessoa = {
  nome: 'João',
  idade: 30,
  profissao: 'Desenvolvedor',
  saudar() {
    return \`Olá, eu sou \${this.nome}\`;
  }
};

// Acessando propriedades
console.log(pessoa.nome); // notação de ponto
console.log(pessoa['idade']); // notação de colchetes
\`\`\``,
      order: 3,
    }
  ]

  // Páginas do React Hooks Guide
  const pages2 = [
    {
      path: 'README.md',
      title: 'React Hooks - Guia Completo',
      contentMd: `# React Hooks Guide 🎣

## Introdução

Os Hooks foram introduzidos no React 16.8 e revolucionaram a forma como escrevemos componentes funcionais.

## Hooks Básicos

- useState
- useEffect
- useContext

## Hooks Avançados

- useReducer
- useCallback
- useMemo
- useRef

Vamos explorar cada um deles!`,
      order: 0,
    },
    {
      path: 'usestate.md',
      title: 'useState Hook',
      contentMd: `# useState Hook

O \`useState\` é o hook mais básico para gerenciar estado em componentes funcionais.

\`\`\`jsx
import React, { useState } from 'react';

function Contador() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Você clicou {count} vezes</p>
      <button onClick={() => setCount(count + 1)}>
        Clique aqui
      </button>
    </div>
  );
}
\`\`\`

## Estado com Objetos

\`\`\`jsx
function FormularioUsuario() {
  const [usuario, setUsuario] = useState({
    nome: '',
    email: ''
  });

  const atualizarUsuario = (campo, valor) => {
    setUsuario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <form>
      <input 
        value={usuario.nome}
        onChange={(e) => atualizarUsuario('nome', e.target.value)}
        placeholder="Nome"
      />
      <input 
        value={usuario.email}
        onChange={(e) => atualizarUsuario('email', e.target.value)}
        placeholder="Email"
      />
    </form>
  );
}
\`\`\``,
      order: 1,
    },
    {
      path: 'useeffect.md',
      title: 'useEffect Hook',
      contentMd: `# useEffect Hook

O \`useEffect\` permite executar efeitos colaterais em componentes funcionais.

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function ExemploEffect() {
  const [count, setCount] = useState(0);

  // Executa após cada render
  useEffect(() => {
    document.title = \`Você clicou \${count} vezes\`;
  });

  // Executa apenas uma vez (componentDidMount)
  useEffect(() => {
    console.log('Componente montado!');
  }, []);

  // Executa quando count muda
  useEffect(() => {
    if (count > 0) {
      console.log(\`Count mudou para: \${count}\`);
    }
  }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
\`\`\`

## Cleanup

\`\`\`jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Timer executando...');
  }, 1000);

  // Cleanup function
  return () => {
    clearInterval(timer);
  };
}, []);
\`\`\``,
      order: 2,
    }
  ]

  // Páginas do Private Notes
  const pages3 = [
    {
      path: 'README.md',
      title: 'Minhas Notas Privadas',
      contentMd: `# Private Notes 📝

Estas são minhas anotações pessoais sobre programação.

## Tópicos

- Algoritmos importantes
- Padrões de design
- Snippets úteis
- Lembretes para projetos

**Nota**: Este repositório é privado!`,
      order: 0,
    },
    {
      path: 'algorithms.md',
      title: 'Algoritmos Importantes',
      contentMd: `# Algoritmos que Preciso Lembrar

## Binary Search

\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}
\`\`\`

## Fibonacci

\`\`\`javascript
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// Versão otimizada com memoização
const fibMemo = (n, memo = {}) => {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
};
\`\`\``,
      order: 1,
    }
  ]

  // Páginas do Python para Iniciantes
  const pages4 = [
    {
      path: 'README.md',
      title: 'Python para Iniciantes',
      contentMd: `# Python para Iniciantes 🐍

Bem-vindo ao mundo do Python! Uma linguagem simples, poderosa e versátil.

## Por que Python?

- ✨ Sintaxe simples e legível
- 🚀 Rápido desenvolvimento
- 📚 Vasta biblioteca padrão
- 🌍 Comunidade ativa
- 💼 Usado por grandes empresas

## O que vamos aprender

1. Sintaxe básica
2. Estruturas de dados
3. Programação orientada a objetos
4. Manipulação de arquivos
5. Projetos práticos

Vamos começar nossa jornada Python! 🎯`,
      order: 0,
    },
    {
      path: 'sintaxe-basica.md',
      title: 'Sintaxe Básica',
      contentMd: `# Sintaxe Básica do Python

## Variáveis e Tipos

\`\`\`python
# Variáveis (tipagem dinâmica)
nome = "João"
idade = 25
altura = 1.75
ativo = True

# Python é case-sensitive
Nome = "Maria"  # Diferente de 'nome'

# Múltiplas atribuições
x, y, z = 1, 2, 3
a = b = c = 0
\`\`\`

## Tipos de Dados

\`\`\`python
# Números
inteiro = 42
decimal = 3.14
complexo = 2 + 3j

# Strings
texto = "Olá, mundo!"
multiline = """
Texto em
múltiplas linhas
"""

# Booleanos
verdadeiro = True
falso = False

# Verificar tipo
print(type(nome))  # <class 'str'>
\`\`\`

## Operadores

\`\`\`python
# Aritméticos
soma = 5 + 3        # 8
subtracao = 5 - 3   # 2
multiplicacao = 5 * 3  # 15
divisao = 5 / 3     # 1.666...
divisao_inteira = 5 // 3  # 1
resto = 5 % 3       # 2
potencia = 5 ** 3   # 125

# Comparação
igual = 5 == 3      # False
diferente = 5 != 3  # True
maior = 5 > 3       # True
menor_igual = 5 <= 3  # False

# Lógicos
e = True and False  # False
ou = True or False  # True
nao = not True      # False
\`\`\``,
      order: 1,
    },
    {
      path: 'estruturas-dados.md',
      title: 'Estruturas de Dados',
      contentMd: `# Estruturas de Dados em Python

## Listas

\`\`\`python
# Criando listas
frutas = ['maçã', 'banana', 'laranja']
numeros = [1, 2, 3, 4, 5]
mista = ['texto', 42, True, 3.14]

# Métodos úteis
frutas.append('uva')        # Adiciona no final
frutas.insert(0, 'morango') # Adiciona na posição
frutas.remove('banana')     # Remove por valor
ultimo = frutas.pop()       # Remove e retorna último

# Slicing
primeiros_tres = numeros[:3]  # [1, 2, 3]
ultimos_dois = numeros[-2:]   # [4, 5]
\`\`\`

## Dicionários

\`\`\`python
# Criando dicionários
pessoa = {
    'nome': 'João',
    'idade': 30,
    'profissao': 'Desenvolvedor'
}

# Acessando valores
print(pessoa['nome'])           # João
print(pessoa.get('idade'))      # 30
print(pessoa.get('salario', 0)) # 0 (valor padrão)

# Métodos úteis
chaves = pessoa.keys()      # dict_keys(['nome', 'idade', 'profissao'])
valores = pessoa.values()   # dict_values(['João', 30, 'Desenvolvedor'])
itens = pessoa.items()      # dict_items([('nome', 'João'), ...])
\`\`\`

## Tuplas e Sets

\`\`\`python
# Tuplas (imutáveis)
coordenadas = (10, 20)
cores = ('vermelho', 'verde', 'azul')

# Sets (únicos)
numeros_unicos = {1, 2, 3, 3, 4}  # {1, 2, 3, 4}
letras = set('hello')             # {'h', 'e', 'l', 'o'}
\`\`\``,
      order: 2,
    }
  ]

  // Páginas do Node.js API REST
  const pages5 = [
    {
      path: 'README.md',
      title: 'Node.js API REST - Guia Completo',
      contentMd: `# Node.js API REST 🚀

Aprenda a criar APIs RESTful robustas e escaláveis com Node.js!

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

## Estrutura do Projeto

\`\`\`
projeto/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── tests/
└── package.json
\`\`\`

## Funcionalidades

- ✅ CRUD completo
- 🔐 Autenticação JWT
- 📝 Validação de dados
- 🛡️ Middleware de segurança
- 📊 Logging e monitoramento
- 🧪 Testes automatizados`,
      order: 0,
    },
    {
      path: 'setup-inicial.md',
      title: 'Setup Inicial',
      contentMd: `# Setup Inicial do Projeto

## Inicializando o Projeto

\`\`\`bash
# Criar diretório
mkdir minha-api
cd minha-api

# Inicializar npm
npm init -y

# Instalar dependências principais
npm install express mongoose dotenv cors helmet
npm install bcryptjs jsonwebtoken express-rate-limit

# Dependências de desenvolvimento
npm install -D nodemon jest supertest
\`\`\`

## Estrutura Básica

\`\`\`javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Rotas
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Servidor rodando na porta \${PORT}\`);
});
\`\`\`

## Variáveis de Ambiente

\`\`\`env
# .env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/minha-api
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRE=7d
\`\`\``,
      order: 1,
    },
    {
      path: 'autenticacao.md',
      title: 'Sistema de Autenticação',
      contentMd: `# Sistema de Autenticação JWT

## Modelo de Usuário

\`\`\`javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para verificar senha
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
\`\`\`

## Controller de Autenticação

\`\`\`javascript
// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const user = await User.create({
      name,
      email,
      password
    });
    
    const token = signToken(user._id);
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email e senha são obrigatórios'
      });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }
    
    const token = signToken(user._id);
    
    res.json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
\`\`\``,
      order: 2,
    }
  ]

  // Páginas do CSS Moderno
  const pages6 = [
    {
      path: 'README.md',
      title: 'CSS Moderno - Guia Completo',
      contentMd: `# CSS Moderno 🎨

Domine as técnicas mais atuais de CSS para criar layouts incríveis!

## Tópicos Abordados

- 📦 **Flexbox** - Layout flexível
- 🎯 **CSS Grid** - Layout em grade
- 🎭 **Animações** - Transições e keyframes
- 🎨 **Custom Properties** - Variáveis CSS
- 📱 **Responsive Design** - Design responsivo
- 🔧 **Metodologias** - BEM, SMACSS

## Ferramentas Modernas

- **PostCSS** - Processamento de CSS
- **Sass/SCSS** - Pré-processador
- **Autoprefixer** - Prefixos automáticos
- **PurgeCSS** - Remoção de CSS não usado

Vamos criar interfaces modernas e responsivas! ✨`,
      order: 0,
    },
    {
      path: 'flexbox.md',
      title: 'Flexbox - Layout Flexível',
      contentMd: `# Flexbox - Layout Flexível

## Conceitos Básicos

\`\`\`css
.container {
  display: flex;
  
  /* Direção dos itens */
  flex-direction: row; /* row | column | row-reverse | column-reverse */
  
  /* Quebra de linha */
  flex-wrap: nowrap; /* nowrap | wrap | wrap-reverse */
  
  /* Shorthand para direction + wrap */
  flex-flow: row nowrap;
}
\`\`\`

## Alinhamento Principal (justify-content)

\`\`\`css
.container {
  display: flex;
  
  /* Alinhamento horizontal (se flex-direction: row) */
  justify-content: flex-start;
  /* flex-start | flex-end | center | space-between | space-around | space-evenly */
}

/* Exemplos práticos */
.center-horizontal {
  display: flex;
  justify-content: center;
}

.space-between {
  display: flex;
  justify-content: space-between;
}
\`\`\`

## Alinhamento Cruzado (align-items)

\`\`\`css
.container {
  display: flex;
  height: 200px;
  
  /* Alinhamento vertical (se flex-direction: row) */
  align-items: stretch;
  /* stretch | flex-start | flex-end | center | baseline */
}

/* Centralizar vertical e horizontalmente */
.center-both {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
\`\`\`

## Propriedades dos Itens Flex

\`\`\`css
.item {
  /* Crescimento */
  flex-grow: 1; /* 0 = não cresce, 1+ = cresce proporcionalmente */
  
  /* Encolhimento */
  flex-shrink: 1; /* 0 = não encolhe, 1+ = encolhe proporcionalmente */
  
  /* Tamanho base */
  flex-basis: auto; /* auto | 0 | 200px | 50% */
  
  /* Shorthand */
  flex: 1 1 auto; /* grow shrink basis */
  
  /* Alinhamento individual */
  align-self: center; /* auto | flex-start | flex-end | center | baseline | stretch */
}
\`\`\`

## Exemplos Práticos

\`\`\`css
/* Layout de 3 colunas */
.three-columns {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1; /* Todas as colunas com tamanho igual */
}

.sidebar {
  flex: 0 0 250px; /* Largura fixa de 250px */
}

/* Card responsivo */
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 300px; /* Mínimo 300px, cresce conforme necessário */
  min-width: 0; /* Permite encolhimento */
}
\`\`\``,
      order: 1,
    },
    {
      path: 'css-grid.md',
      title: 'CSS Grid - Layout em Grade',
      contentMd: `# CSS Grid - Layout em Grade

## Grid Container

\`\`\`css
.grid-container {
  display: grid;
  
  /* Definir colunas */
  grid-template-columns: 200px 1fr 100px;
  /* ou */
  grid-template-columns: repeat(3, 1fr);
  /* ou */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  
  /* Definir linhas */
  grid-template-rows: 100px auto 50px;
  
  /* Espaçamento */
  gap: 20px;
  /* ou */
  grid-gap: 20px 10px; /* linha coluna */
}
\`\`\`

## Grid Areas (Nomeadas)

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 150px;
  grid-template-rows: 80px 1fr 60px;
  min-height: 100vh;
  gap: 10px;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

## Posicionamento de Itens

\`\`\`css
.item {
  /* Por linha/coluna */
  grid-column: 1 / 3; /* Da coluna 1 até 3 */
  grid-row: 2 / 4;    /* Da linha 2 até 4 */
  
  /* Shorthand */
  grid-area: 2 / 1 / 4 / 3; /* row-start / col-start / row-end / col-end */
  
  /* Span (ocupar X células) */
  grid-column: span 2; /* Ocupar 2 colunas */
  grid-row: span 3;    /* Ocupar 3 linhas */
}
\`\`\`

## Grid Responsivo

\`\`\`css
/* Cards responsivos */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* Layout responsivo com media queries */
.responsive-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

## Alinhamento no Grid

\`\`\`css
.grid-container {
  display: grid;
  
  /* Alinhamento de todo o grid */
  justify-content: center; /* start | end | center | stretch | space-around | space-between | space-evenly */
  align-content: center;   /* start | end | center | stretch | space-around | space-between | space-evenly */
  
  /* Alinhamento padrão dos itens */
  justify-items: center;   /* start | end | center | stretch */
  align-items: center;     /* start | end | center | stretch */
}

.grid-item {
  /* Alinhamento individual */
  justify-self: end;       /* start | end | center | stretch */
  align-self: start;       /* start | end | center | stretch */
}
\`\`\``,
      order: 2,
    }
  ]

  // Inserir páginas no banco
  for (const pageData of pages1) {
    await prisma.page.upsert({
      where: {
        repoId_path: {
          repoId: repo1.id,
          path: pageData.path
        }
      },
      update: {},
      create: {
        repoId: repo1.id,
        ...pageData,
      },
    })
  }

  for (const pageData of pages2) {
    await prisma.page.upsert({
      where: {
        repoId_path: {
          repoId: repo2.id,
          path: pageData.path
        }
      },
      update: {},
      create: {
        repoId: repo2.id,
        ...pageData,
      },
    })
  }

  for (const pageData of pages3) {
    await prisma.page.upsert({
      where: {
        repoId_path: {
          repoId: repo3.id,
          path: pageData.path
        }
      },
      update: {},
      create: {
        repoId: repo3.id,
        ...pageData,
      },
    })
  }

  for (const pageData of pages4) {
    await prisma.page.upsert({
      where: {
        repoId_path: {
          repoId: repo4.id,
          path: pageData.path
        }
      },
      update: {},
      create: {
        repoId: repo4.id,
        ...pageData,
      },
    })
  }

  for (const pageData of pages5) {
    await prisma.page.upsert({
      where: {
        repoId_path: {
          repoId: repo5.id,
          path: pageData.path
        }
      },
      update: {},
      create: {
        repoId: repo5.id,
        ...pageData,
      },
    })
  }

  for (const pageData of pages6) {
    await prisma.page.upsert({
      where: {
        repoId_path: {
          repoId: repo6.id,
          path: pageData.path
        }
      },
      update: {},
      create: {
        repoId: repo6.id,
        ...pageData,
      },
    })
  }

  console.log('✅ Pages created')

  // 5. Criar algumas estrelas (stars)
  await prisma.star.upsert({
    where: {
      userId_repoId: {
        userId: user1.id,
        repoId: repo1.id
      }
    },
    update: {},
    create: {
      userId: user1.id,
      repoId: repo1.id,
    },
  })

  await prisma.star.upsert({
    where: {
      userId_repoId: {
        userId: user2.id,
        repoId: repo1.id
      }
    },
    update: {},
    create: {
      userId: user2.id,
      repoId: repo1.id,
    },
  })

  await prisma.star.upsert({
    where: {
      userId_repoId: {
        userId: admin.id,
        repoId: repo2.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      repoId: repo2.id,
    },
  })

  // Mais estrelas para os novos repositórios
  await prisma.star.upsert({
    where: {
      userId_repoId: {
        userId: user1.id,
        repoId: repo4.id
      }
    },
    update: {},
    create: {
      userId: user1.id,
      repoId: repo4.id,
    },
  })

  await prisma.star.upsert({
    where: {
      userId_repoId: {
        userId: user2.id,
        repoId: repo4.id
      }
    },
    update: {},
    create: {
      userId: user2.id,
      repoId: repo4.id,
    },
  })

  await prisma.star.upsert({
    where: {
      userId_repoId: {
        userId: admin.id,
        repoId: repo5.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      repoId: repo5.id,
    },
  })

  await prisma.star.upsert({
    where: {
      userId_repoId: {
        userId: user2.id,
        repoId: repo6.id
      }
    },
    update: {},
    create: {
      userId: user2.id,
      repoId: repo6.id,
    },
  })

  console.log('✅ Stars created')

  // 6. Criar alguns progressos
  const page1 = await prisma.page.findFirst({
    where: { repoId: repo1.id, path: 'README.md' }
  })

  const page2 = await prisma.page.findFirst({
    where: { repoId: repo1.id, path: 'variables.md' }
  })

  const page3 = await prisma.page.findFirst({
    where: { repoId: repo2.id, path: 'README.md' }
  })

  if (page1) {
    await prisma.progress.upsert({
      where: {
        userId_repoId_pageId: {
          userId: user1.id,
          repoId: repo1.id,
          pageId: page1.id
        }
      },
      update: {},
      create: {
        userId: user1.id,
        repoId: repo1.id,
        pageId: page1.id,
        completedSteps: 5,
        totalSteps: 5,
      },
    })
  }

  if (page2) {
    await prisma.progress.upsert({
      where: {
        userId_repoId_pageId: {
          userId: user1.id,
          repoId: repo1.id,
          pageId: page2.id
        }
      },
      update: {},
      create: {
        userId: user1.id,
        repoId: repo1.id,
        pageId: page2.id,
        completedSteps: 3,
        totalSteps: 8,
      },
    })
  }

  if (page3) {
    await prisma.progress.upsert({
      where: {
        userId_repoId_pageId: {
          userId: user2.id,
          repoId: repo2.id,
          pageId: page3.id
        }
      },
      update: {},
      create: {
        userId: user2.id,
        repoId: repo2.id,
        pageId: page3.id,
        completedSteps: 1,
        totalSteps: 3,
      },
    })
  }

  console.log('✅ Progress records created')
  console.log('🎉 Seed completed successfully!')
  
  // Estatísticas finais
  const userCount = await prisma.user.count()
  const repoCount = await prisma.manualRepo.count()
  const pageCount = await prisma.page.count()
  const starCount = await prisma.star.count()
  const progressCount = await prisma.progress.count()

  console.log(`
📊 Database Statistics:
- Users: ${userCount}
- Repositories: ${repoCount}
- Pages: ${pageCount}
- Stars: ${starCount}
- Progress records: ${progressCount}
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
