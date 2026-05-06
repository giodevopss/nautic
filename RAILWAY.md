# Deploy no Railway (Next.js + API + MongoDB)

Este app tem **dois processos**: API Express (`server/`) e frontend Next (`src/`). No Railway costuma funcionar melhor como **dois serviços** ligados ao **mesmo MongoDB**.

## 1. Banco MongoDB

1. No projeto Railway: **New** → **Database** → **MongoDB** (plugin oficial), **ou** use [MongoDB Atlas](https://www.mongodb.com/atlas) e copie a connection string.
2. A URI deve incluir nome do banco, por exemplo:  
   `mongodb://user:pass@host:port/nautic?retryWrites=true&w=majority`

## 2. Serviço **API**

- **Root directory**: raiz do repositório.
- **Build command**:  
  `npm ci && npx prisma generate`
- **Start command**:  
  `npx prisma db push && node --import tsx server/index.ts`
- **Variáveis de ambiente**:
  - `DATABASE_URL` — mesma URI do Mongo (referência ao plugin MongoDB do Railway ou string da Atlas).
  - `ADMIN_SECRET`, `AUTH_SECRET` — valores fortes em produção.
  - Opcional: `PORT` é definido pelo Railway; a API já usa `PORT` ou `API_PORT`.

Após deploy, copie a **URL pública** do serviço (ex.: `https://api-xxx.up.railway.app`).

## 3. Serviço **Web** (Next.js)

- **Build command**:  
  `npm ci && npx prisma generate && npm run build`  
  (`prisma generate` é necessário se o build importar algo que referencie tipos/client; aqui é seguro gerar sempre.)
- **Start command**:  
  `npm run prod`  
  (Next usa a variável `PORT` automaticamente quando o Railway define.)

**Importante**: defina **`NEXT_PUBLIC_API_URL`** antes do build, apontando para a URL **pública** da API do passo 2 (sem barra final), por exemplo:

`https://api-xxx.up.railway.app`

Outras variáveis no Web (se o código precisar no servidor):

- Opcionalmente as mesmas chaves apenas se algum código server-side ler; o browser só enxerga `NEXT_PUBLIC_*`.

## 4. Schema e migrações

Com MongoDB o Prisma usa **`prisma db push`** no deploy (não há `migrate deploy` SQL). O comando já está no start da API acima para criar coleções/indexes na primeira subida.

## 5. Desenvolvimento local

1. MongoDB rodando localmente ou Atlas.
2. `.env` com `DATABASE_URL` válida para Mongo.
3. `./start.sh` — gera client, faz `db push`, seed e sobe API + `next dev`.

## 6. Seeds e dados antigos

Dados que estavam em SQLite **não** migram automaticamente: é necessário exportar/importar manualmente ou recadastrar. O seed popula apenas a frota inicial.
