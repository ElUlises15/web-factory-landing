# Web Factory — galería por plan

Estado: implementada localmente; pendiente aprobación directa para publicar y QA visual.

## Referencias
- https://web-factory-hjs.pages.dev/#precios — conservar el tarifario, los precios argentinos y la recomendación de Intermedia. No copiar un grid SaaS de tres tarjetas.
- https://web-factory-hjs.pages.dev/#demos — conservar las capturas, identidad editorial oscura y la apertura asimétrica; eliminar el mosaico con desplazamientos arbitrarios que se rompe al filtrar.

## Tokens de marca
- Primario existente: `--blue: #1E3A8A`; acento: `--orange: #F97316`.
- Neutros existentes: `--paper: #F3F4F1`, `--white: #FFFFFF`, `--ink: #0E1530`.
- Galería: `--demo-muted: #C4CCDD`, `--demo-line: #3B4560`.
- Planes: Básica usa `--paper`; Intermedia usa `--orange`; Completa usa salvia `--plan-completa: #B9E5CA`, de la familia verde del WhatsApp existente. Nombre escrito siempre: no depender solo del color.
- Tipografías existentes: Space Grotesk (títulos/precios) + Figtree (cuerpo).
- Fotos: capturas de las demos existentes, sin nuevas fotos de stock.

## Alcance
26 demos: 5 Básica, 15 Intermedia, 6 Completa. Las 10 propuestas de negocios conservan Intermedia por su contenido; RPG Mate & Magia se asigna a Completa por ser una muestra interactiva.

Una columna móvil; filtros horizontales de 46px, enlace de 44px. Dos columnas desde 720px y tres desde 960px; apertura de Apes asimétrica a escritorio, sin reglas nth-child. Categorías vacías se ocultan al filtrar. Galería y precios legibles sin JS; filtros solo aparecen si JS inicializa.

## Mantenimiento y QA
- `node scripts/render-demos.mjs`: regenerar HTML estático desde JSON.
- `node scripts/render-demos.mjs --check`: detectar desincronización.
- `node scripts/test-demos.mjs`: controles de HTML, precios, filtros con DOM simulado, URLs, assets y robots.
- Pendiente: revisión visual en 390px y 1280px con herramienta de navegador autorizada; este executor no dispone de una.
