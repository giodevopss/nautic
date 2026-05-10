# Vídeos

Coloque os `.mp4` aqui (`public/videos/`) e **faça commit** — o Next serve-os em `/videos/...` em desenvolvimento e em produção (Railway) sem CDN.

**Peso no Git:** depois de trocar os ficheiros, corra **`npm run media:compress`** (precisa de `ffmpeg` no PATH). Re-codifica todos os `.mp4` para H.264 com largura máx. 1280px e qualidade adequada ao site, mantendo os **mesmos nomes** — não é preciso alterar código.

Opcionalmente, para ficar ainda menor: `MAX_W=960 CRF=28 npm run media:compress`

Opcionalmente, para não aumentar o repositório, use **Railway Bucket** (ou CDN) com os mesmos paths e configure `NEXT_PUBLIC_MEDIA_URL` no build (`RAILWAY.md`, `.env.example`).

## Hero (alternância)

- `lanchas1.mp4`, `lanchas2.mp4`, `pwc.mp4` — ver comentários no `Hero.tsx`

## Quem somos

- `quem-somos-lancha.mp4` — lancha com pessoas (ex.: plano aéreo no iate, Pexels)

Fontes comuns: [Pexels](https://www.pexels.com/license/), [Pixabay](https://pixabay.com/service/license/).

Para PWC, evite *water skiing* (esqui na água); use *jet ski*, *personal watercraft* ou *PWC*.
