# UTI da Tecnologia: landing page, SEO técnico e publicação no Vercel

Site estático de página única (HTML + CSS + JS puros, sem framework e sem dependências).
No Vercel, o comando `node scripts/build.mjs` copia o site para `dist/`, minifica o CSS e troca o
marcador `https://TROCAR-PELO-LINK-DO-VERCEL.vercel.app` pelo link de produção
(variável `VERCEL_PROJECT_PRODUCTION_URL`).

## Estrutura

| Arquivo | Para quê |
|---|---|
| `index.html` | Página com title, description, canonical, Open Graph, Twitter Card, favicons e JSON-LD |
| `404.html` | Página de erro com a mesma identidade visual (`noindex`) |
| `assets/style.css`, `assets/script.js` | Estilo e interações (revelações, carrossel, avaliações, horário, mapa) |
| `assets/img/` | Logos da marca (versão branca para fundo escuro, isotipo azul-marinho do pino do mapa) e a arte do boleto |
| `assets/fotos/` | Fotos tratadas em WebP (recorte, limpeza de compressão, ampliação por IA e versão `-640` para celular) |
| `robots.txt` | Libera o rastreamento e aponta o sitemap |
| `sitemap.xml` | Única URL canônica do site (`/`) |
| `site.webmanifest` | Nome, cores e ícones 192/512 |
| `favicon.ico` (16/32/48), `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` | Favicons, todos na **raiz**, gerados do isotipo |
| `og-image.jpg` | Imagem de compartilhamento 1200x630, na raiz |
| `scripts/build.mjs` | **SITE_URL central** e build para `dist/` |
| `vercel.json` | Build, pasta de saída, redirecionamento `/index.html` para `/`, cache e cabeçalhos de segurança (CSP, nosniff, frame, referrer, permissions) |

## O que ficou para preencher

| Item | Arquivo e linha | O que fazer |
|---|---|---|
| URL do site (SITE_URL) | `scripts/build.mjs`, linha 16 | **Automático no Vercel.** Só edite se for publicar fora do Vercel. |
| CEP, coordenadas e número de avaliações (opcional) | `index.html`, linhas 74 a 79 | O site não informa esses dados. Quando tiver, acrescente ao JSON-LD como indicado no comentário. |
| Imagem de compartilhamento (opcional) | raiz, `og-image.jpg` | Já existe. Para outra arte, substitua mantendo o nome e 1200x630 px. |
| Favicons (opcional) | raiz do projeto | Já existem. Substitua mantendo nomes e tamanhos, se quiser. |

Os marcadores em `index.html` (linhas 15, 30, 32, 39, 50, 53, 54 e 55), `robots.txt` (linha 6) e
`sitemap.xml` (linha 5) **não precisam ser editados**: o build troca tudo.

## Checklist

**a. Publicar no Vercel via GitHub**
1. Suba a pasta inteira para um repositório no GitHub (com `vercel.json` e `scripts/`).
2. No Vercel: *Add New, Project, Import* o repositório.
3. Framework Preset: *Other*. O resto vem do `vercel.json`. Clique em *Deploy*.

**b. Link de produção e URL**
1. Ao terminar, copie o domínio de produção (ex.: `seu-projeto.vercel.app`).
2. A troca da URL é automática. Para conferir, abra `seu-projeto.vercel.app/robots.txt`
   e `/sitemap.xml`: devem mostrar o seu link, não o marcador.
3. Links de *preview* do Vercel saem com `noindex` por padrão. Isso é normal;
   confira sempre no link de produção.

**c. Google Search Console**
1. Acesse search.google.com/search-console, *Adicionar propriedade*, *Prefixo do URL*,
   e cole `https://seu-projeto.vercel.app/`.
2. Verifique pelo método *Tag HTML*: cole a meta tag no `<head>` do `index.html`
   (logo abaixo do `<meta name="viewport">`), faça commit e espere o deploy.
3. Em *Sitemaps*, envie `sitemap.xml`.
4. Em *Inspeção de URL*, teste a página inicial e peça a indexação.
   A indexação depende da avaliação do Google e pode levar dias.

**d. Domínio próprio no futuro**
1. Vercel, *Settings, Domains*: adicione o domínio e configure o DNS indicado.
2. Marque o domínio próprio como principal e configure o `.vercel.app` para
   *Redirect* (308) para ele.
3. Faça um novo deploy (*Redeploy*): o build passa a usar o domínio novo em
   canonical, Open Graph, JSON-LD, robots e sitemap.
4. No Search Console, adicione a propriedade do domínio novo e envie o sitemap de novo.

## Observação sobre a CSP (segurança)

O `vercel.json` libera apenas: fontes do Google Fonts, o mapa do Google Maps (iframe) e arquivos do próprio site.
Se no futuro você adicionar algum script externo (ex.: Google Analytics ou Pixel), inclua o domínio dele em
`script-src` e `connect-src` dentro de `Content-Security-Policy`.
