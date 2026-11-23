# Avaliador de Professor — Front-end

Front-end do Sistema de Avaliação de Professores, feito com React + TypeScript + Vite.

O front depende da API do back-end, que fica em outro repositório:
[joaovitor-codes/Sistema-de-Avalia-o-de-Professores](https://github.com/joaovitor-codes/Sistema-de-Avalia-o-de-Professores) (NestJS + PostgreSQL + Prisma).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22+ e npm
- [Docker](https://www.docker.com/) e Docker Compose (para o banco do back-end)
- Git

## Passo a passo

> **Ordem importa:** suba primeiro o back-end (banco + API) e só depois o front-end.

### 1. Back-end

#### 1.1 Clonar o repositório

```bash
git clone https://github.com/joaovitor-codes/Sistema-de-Avalia-o-de-Professores.git
cd Sistema-de-Avalia-o-de-Professores
```

#### 1.2 Instalar as dependências

```bash
npm install
```

#### 1.3 Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

O `.env.example` já vem com o `DATABASE_URL` certo para o banco do Docker. Em ambiente local só precisa ajustar o `JWT_SECRET` (e o SMTP, se quiser testar envio de e-mail). Para gerar um segredo:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Sem SMTP configurado o cadastro funciona normalmente, mas "esqueci minha senha" e "reenviar verificação de e-mail" retornam `503`.

#### 1.4 Subir o banco de dados

```bash
docker compose up -d
```

Sobe um PostgreSQL 15 em `localhost:5456`.

#### 1.5 Rodar as migrations

```bash
npx prisma migrate dev
```

#### 1.6 (Opcional) Popular o banco com dados de exemplo

```bash
npx prisma db seed
```

Todos os usuários criados usam a senha `senha123`:

| E-mail | Tipo |
| --- | --- |
| `admin@teste.com` | ADMINISTRADOR |
| `joana.aluna@teste.com`, `pedro.aluno@teste.com` | ALUNO |
| `carlos.menezes@teste.com`, `fernanda.souza@teste.com`, `ricardo.barros@teste.com`, `helena.costa@teste.com` | PROFESSOR |

#### 1.7 Iniciar a API

```bash
npm run start:dev
```

A API fica disponível em **http://localhost:3000**. Deixe esse terminal aberto.

### 2. Front-end

Em **outro terminal**, dentro da pasta deste projeto:

#### 2.1 Instalar as dependências

```bash
npm install
```

#### 2.2 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O front fica disponível em **http://localhost:5173**.

O Vite repassa as chamadas para `/auth` e `/api` à API em `http://localhost:3000`. Assim o front e a API ficam na mesma origem e os cookies de sessão (`access_token` / `refresh_token`) funcionam sem configurar CORS. Se a API estiver em outro endereço, crie um `.env` a partir do `.env.example` e ajuste `API_PROXY_TARGET`.

## Telas

| Rota | Tela | Quem acessa |
| --- | --- | --- |
| `/login` | Entrar / Criar conta | Público |
| `/verificar-email` | Código de 6 dígitos enviado por e-mail | Público |
| `/recuperar-senha` | Pedir código e definir nova senha | Público |
| `/professores` | Busca com filtros por instituição, curso e disciplina | Logado |
| `/professores/:id` | Perfil, médias por critério, avaliações e avaliar | Logado (avaliar: ALUNO) |
| `/meu-perfil` | Titulação, biografia, senha e vínculos | PROFESSOR |
| `/admin/instituicoes` | CRUD de instituições | ADMINISTRADOR |
| `/admin/cursos` | Cursos e disciplinas por instituição | ADMINISTRADOR |
| `/admin/professores` | Cadastro, desativação e vínculos de professores | ADMINISTRADOR |

## Estrutura

```
src/
  api/         cliente HTTP (cookies + refresh automático) e uma função por rota da API
  auth/        sessão do usuário (AuthProvider, useAuth, RequireAuth)
  components/  layouts, modais e componentes de UI reutilizáveis
  pages/       uma tela por arquivo (admin/ para a área do administrador)
  utils/       formatação (notas, titulação, grau) e o hook useCarregar
```

## Resumo rápido (depois da primeira vez)

Com tudo já instalado e configurado, para voltar a trabalhar basta:

```bash
# terminal 1 — back-end
cd Sistema-de-Avalia-o-de-Professores
docker compose up -d
npm run start:dev

# terminal 2 — front-end
npm run dev
```

## Scripts do front-end

| Comando           | Descrição                                   |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento        |
| `npm run build`   | Checa os tipos e gera o build de produção   |
| `npm run lint`    | Roda o linter (oxlint)                      |
| `npm run preview` | Serve o build de produção localmente        |

Mais detalhes sobre a API (variáveis de ambiente, endpoints, testes) estão no [README do back-end](https://github.com/joaovitor-codes/Sistema-de-Avalia-o-de-Professores#readme).
