# Deploy no Railway (Next.js + API + MongoDB)

Este app tem **dois processos**: API Express (`server/`) e frontend Next (`src/`). No Railway costuma funcionar melhor como **dois serviços** ligados ao **mesmo MongoDB**.

## 1. Banco MongoDB

1. No projeto Railway: **New** → **Database** → **MongoDB** (plugin oficial), **ou** use [MongoDB Atlas](https://www.mongodb.com/atlas) e copie a connection string.
2. A URI **deve incluir o nome da base** após host/porta (`/nautic`, etc.). O Prisma erro **P1013** aparece se faltar esse segmento — o Railway às vezes expõe só `mongodb://…railway.internal:27017`.  
   **Opção A:** acrescente `/nautic` (ou o nome que preferir) na própria variável `DATABASE_URL`.  
   **Opção B:** deixe como está e defina `MONGO_DATABASE` ou use o default `nautic`; o script `scripts/prisma-db-push.ts` e o carregamento da API corrigem automaticamente.
   
   Exemplo completo:  
   `mongodb://user:pass@host:port/nautic?authSource=admin&retryWrites=true&w=majority`

## 2. Serviço **API**

- **Root directory**: raiz do repositório.
- **Build command**:  
  `npm ci && npx prisma generate`
- **Start command**:  
  `npx tsx scripts/prisma-db-push.ts && node --import tsx server/index.ts`  
  (o script corrige `DATABASE_URL` sem `/dbname` antes do `db push`.)
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

**Importante** — o browser precisa de saber onde está a API. Escolha **uma** das opções (no serviço **Web**, antes do **`npm run build`**):

**A) `NEXT_PUBLIC_API_URL`** (mais simples) — URL pública da API do passo 2, **sem barra final**, por exemplo:

`https://api-xxx.up.railway.app`

O valor fica embutido no JavaScript no build; sem isto a página de reserva e o login mostram aviso de configuração.

**B) `API_UPSTREAM_URL`** — URL da API **só no servidor** do Next. O build gera rewrites: pedidos do browser a `https://seu-site.up.railway.app/api/...` são encaminhados para essa API (menos exposição da URL da API no cliente; CORS no Express continua irrelevante para este fluxo). Não use barra final.

Se definir **as duas**, prevalece `NEXT_PUBLIC_API_URL`.

### Reserva ou login não ligam à API

- O site em **HTTPS** com `NEXT_PUBLIC_API_URL` em **http://** é bloqueado pelo navegador — use sempre `https://` na URL da API.
- Não coloque **`/api` no fim** da URL base (ex.: errado: `https://…railway.app/api`); o código já usa `/api/vehicles`, etc.
- Abra a URL da API no browser (`…/api/health`) e confirme JSON `ok`; se falhar, o serviço API ou o Mongo não estão acessíveis.
- Depois de mudar `NEXT_PUBLIC_API_URL` ou `API_UPSTREAM_URL`, é preciso **novo build** do Web.

### Mídia (Railway Bucket / Tigris)

1. Envie `public/videos/` e `public/images/` com o script local (S3-compatível):
   - Configure `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` no `.env` (chaves do painel Railway/Tigris).
   - Teste: `npm run upload:media -- --dry-run`
   - Envio: `npm run upload:media`
   - Defaults: endpoint `https://t3.storageapi.dev`, bucket `wrapped-pannikin-ta6us77k` (sobrescreva com `STORAGE_ENDPOINT` / `STORAGE_BUCKET` se mudar).
2. Garanta leitura **pública** nos objetos ou use a **URL pública** que o Railway mostra para servir ficheiros ao browser.
3. No serviço **Web**, defina antes do **`npm run build`**:

   **`NEXT_PUBLIC_MEDIA_URL`** — URL base pública **sem barra final**, apontando para onde os ficheiros ficam acessíveis por HTTPS (pode ser diferente do endpoint da API S3 `t3.storageapi.dev`).

Os componentes combinam esse prefixo com paths como `/videos/…` e `/images/…`. Sem a variável, o site usa ficheiros em `public/` — por exemplo vídeos em `public/videos/` se estiverem no repositório.

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
