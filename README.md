# Task API

API de gestão de tarefas feita para rodar em AWS Lambda, com banco PostgreSQL na Neon. Fiz como projeto de estudo para praticar TypeScript, Prisma e o fluxo de desenvolvimento serverless, desde o schema do banco até o bundle pronto para deploy.

Por enquanto existe um endpoint: criação de tarefas.

## Stack

- Node.js 20+ e TypeScript
- AWS Lambda (eventos do API Gateway HTTP API, payload v2)
- PostgreSQL na Neon (serverless)
- Prisma ORM 6
- Zod para validação do corpo da requisição
- tsx para rodar o código localmente
- esbuild para gerar o bundle

## Estrutura

```
prisma/
  schema.prisma     modelo Task
src/
  schemas.ts        schema de validação (Zod)
  handler.ts        handler da Lambda (createTask)
  localTest.ts      simula eventos do API Gateway
.env.example        variáveis de ambiente necessárias
```

## Como rodar localmente

Pré-requisitos: Node 20.6 ou superior e um projeto criado na Neon.

```bash
git clone https://github.com/SEU_USUARIO/task-api.git
cd task-api
npm install
cp .env.example .env
```

Preencha o `.env` com as connection strings do painel da Neon:

- `DATABASE_URL`: conexão com pooler (host com `-pooler`). É a que a Lambda usa em runtime.
- `DIRECT_URL`: conexão direta, sem pooler. O Prisma Migrate precisa dela.

Depois, crie a tabela e rode o teste:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run test:local
```

O script `localTest.ts` chama o handler com dois eventos: um válido e um com título curto demais. Dá para editar os payloads no próprio arquivo.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run typecheck` | Checa os tipos sem gerar arquivos |
| `npm run test:local` | Executa o handler com eventos simulados |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Roda as migrations em desenvolvimento |
| `npm run build` | Gera `dist/handler.js` com esbuild |

## Endpoint

### POST /tasks

Cria uma tarefa.

Corpo da requisição:

```json
{
  "title": "Estudar AWS Lambda",
  "description": "Finalizar a Task API do portfólio"
}
```

Regras: `title` é obrigatório e precisa ter pelo menos 3 caracteres. `description` é opcional.

Resposta `201 Created`:

```json
{
  "id": "0b6f6c5e-3f43-4a58-9a44-1d2a0f3c9d11",
  "title": "Estudar AWS Lambda",
  "description": "Finalizar a Task API do portfólio",
  "completed": false,
  "createdAt": "2026-11-02T22:10:00.000Z"
}
```

Resposta `400 Bad Request` (validação falhou):

```json
{
  "message": "Dados inválidos.",
  "errors": {
    "formErrors": [],
    "fieldErrors": {
      "title": ["O título deve ter no mínimo 3 caracteres."]
    }
  }
}
```

Também retorna `400` quando o corpo está ausente ou não é um JSON válido, e `500` para erros inesperados (o detalhe fica só no log da função, não vai para o cliente).

Todas as respostas incluem cabeçalhos de CORS, e requisições `OPTIONS` respondem `204`.

## Deploy

```bash
npm run build
```

Isso gera `dist/handler.js`. O Prisma fica como dependência externa no bundle, então o pacote enviado para a Lambda precisa incluir `node_modules/@prisma/client` e `node_modules/.prisma` (direto no zip ou em uma Layer). O `schema.prisma` já define o `binaryTargets` com `rhel-openssl-3.0.x`, que é o que o runtime Node 20 da AWS usa.

Configuração da função:

- Runtime: Node.js 20.x
- Handler: `handler.createTask`
- Variável de ambiente: `DATABASE_URL` (a string com pooler)
- Rota no API Gateway: `POST /tasks`

## Decisões e limitações

- Prisma fixado na versão 6. A versão 7 exige `prisma.config.ts` e driver adapters, e quis manter o setup mais simples.
- O `PrismaClient` é criado fora do handler para ser reaproveitado entre invocações quentes.
- Usei o pooler da Neon em runtime para não esgotar conexões quando várias Lambdas sobem ao mesmo tempo.
- O CORS está aberto (`*`) por ser projeto de estudo. Em produção, restringiria à origem do front-end.
- Ainda não há autenticação, testes automatizados nem infraestrutura como código.

## Próximos passos

- Endpoints de listagem, atualização e remoção de tarefas
- Template SAM ou Serverless Framework para o deploy
- Testes automatizados com banco de teste
