# Vídeos

Coloque os `.mp4` aqui (`public/videos/`) e **faça commit** — o Next serve-os em `/videos/...` em desenvolvimento e em produção (Railway) sem CDN.

**Peso no Git:** depois de trocar os ficheiros, corra **`npm run media:compress`** (precisa de `ffmpeg` no PATH). Re-codifica todos os `.mp4` para H.264 com largura máx. 1280px e qualidade adequada ao site, mantendo os **mesmos nomes** — não é preciso alterar código.

Opcionalmente, para ficar ainda menor: `MAX_W=960 CRF=28 npm run media:compress`

Opcionalmente, para não aumentar o repositório, use **Railway Bucket** (ou CDN) com os mesmos paths e configure `NEXT_PUBLIC_MEDIA_URL` no build (`RAILWAY.md`, `.env.example`).

## Vários clipes por secção

Lista de paths em código:

| Secção | Ficheiro de constantes |
|--------|-------------------------|
| Hero | `Hero.tsx` → `HERO_VIDEOS` |
| Quem somos | `About.tsx` → `ABOUT_VIDEOS` |
| Serviços (por cartão) | `Services.tsx` → campo `videos: [...]` em cada item |

Basta acrescentar ou reordenar entradas; os nomes dos ficheiros em `public/videos/` devem coincidir com os paths.

Fontes comuns: [Pexels](https://www.pexels.com/license/), [Pixabay](https://pixabay.com/service/license/).

Para PWC, evite *water skiing* (esqui na água); use *jet ski*, *personal watercraft* ou *PWC*.
