# Sullivan & Alanis — site

Site da dupla Sullivan & Alanis (Colombo, PR). HTML, CSS e JS estáticos, sem build.

## Arquivos
- `index.html` — página única
- `styles.css` — visual
- `main.js` — animações (GSAP + ScrollTrigger + Lenis via CDN), som dos vídeos e pedido de show
- `assets/` — logo, vídeos e fotos

## Rodar localmente
```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar no GitHub Pages
Suba a pasta num repositório e ative Settings → Pages → branch `main`, pasta raiz.

## Para configurar
- **WhatsApp:** em `main.js`, preencha `const WHATSAPP = '';` com o número (ex.: `'5541999999999'`).
  O botão "Enviar no WhatsApp" aparece sozinho.
- **Links das músicas:** em `index.html`, troque os links de busca (Spotify, YouTube Music,
  Apple Music, Deezer, Amazon Music) pelos links diretos do single.
- **Fotos:** `alanis.jpg` e `sullivan.jpg` vêm de um reel em 1215×2160 do Instagram; a capa é a oficial (Deezer, 1000px reduzida a 600px); o vídeo do pinheiral é o reel em 720p.
