# Animación 3D del portafolio Microdent

- `index.html`: escena Three.js (libro de tapa dura, hojas que se curvan, cámara, luces).
- `render.js`: renderiza cada fotograma con Chromium/Playwright (supermuestreo 2x).

Para regenerar: copiar junto a `node_modules/three` (v0.170.0) y a `tex/p-01.jpg … p-13.jpg`
(páginas del PDF: `pdftoppm -r 200 -jpeg Portafolio_Digital_Microdent.pdf tex/p`), luego:

    node render.js frames 60 0 840 1
    ffmpeg -framerate 60 -i frames/f%05d.png -c:v libx264 -crf 14 -pix_fmt yuv420p salida.mp4
