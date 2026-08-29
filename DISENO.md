# Ticodex — Lenguaje Visual (pixel art / naturaleza)

> Referencia de estilo para `docs/mockups.pdf` y, después, para `mobile-flutter` y
> `portal-web`. No es un requerimiento de producto — es la guía visual que hace que
> todo se vea como una sola cosa.

## Paleta: Amity Square

30 colores, paleta comunitaria de [Lospec](https://lospec.com/palette-list/amity-square)
(creadora: Gulf Giggle, inspirada en Eevee y sus evoluciones). Elegida sobre otras dos
candidatas (Johto Redrawn, Pokémon Ruby/Sapphire Exterior) por su tono vibrante y
pastel — encaja con la decisión de tono "Pokedex lúdico" tomada en la entrevista.

### Roles asignados (no todos los 30 colores tienen un rol — el resto queda libre para detalle de ilustración)

| Rol | Hex | Uso |
|---|---|---|
| Fondo principal | `#ffffff` | fondo base de pantallas |
| Fondo cálido / panel | `#ffffbf` | tarjetas, superficies secundarias |
| Superficie alterna | `#cfbfdf` | tarjetas alternas, hover |
| Superficie oscura / chrome | `#36365e` | headers, nav bar, footer del panel |
| Tinta / texto principal | `#302040` | texto, contornos pixel |
| Primario (naturaleza / acción) | `#28b851` | botones primarios, estado publicado |
| Primario oscuro | `#3d8472` | hover/pressed del primario |
| Acento fuerte (CTA, Fase 2 captura) | `#ff4040` | acciones irreversibles / llamadas a la acción fuertes |
| Peligro (conservación EN/CR) | `#9f001f` | badge de estado de conservación crítico |
| Precaución (conservación NT) | `#bf7b3f` | badge de estado de conservación intermedio |
| Info / acento portal web | `#2382c1` | elementos propios del panel interno, links |
| Borde / outline | `#302040` | contorno de 3-4px alrededor de tarjetas, botones, inputs |

## Tipografía

- **Títulos, labels cortos, botones**: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
  (bitmap pixel font, licencia SIL OFL, vía Google Fonts). Se usa en MAYÚSCULAS y
  frases cortas — nunca en párrafos largos, es ilegible a tamaños de texto de cuerpo.
- **Cuerpo / descripciones**: sans-serif del sistema. La legibilidad de la
  descripción de una especie importa más que la pureza estética retro.

## Reglas de pixel art

1. **Grid de 8px**: tamaños y espaciados en múltiplos de 8 (4 para detalle fino).
2. **Sin esquinas redondeadas** (`border-radius: 0`). Si hace falta una esquina
   "cortada", se hace en escalón (`clip-path` de bloques), nunca con una curva.
3. **Contornos duros de 3-4px** en `#302040` alrededor de tarjetas, botones, inputs y
   badges — la convención visual de menús Game Boy/GBA.
4. **Sin degradados ni sombras suaves.** Sombra "dura" desplazada (offset sólido, sin
   blur) si hace falta profundidad.
5. **`image-rendering: pixelated`** en cualquier imagen o ícono para que no se
   suavice al escalar.
6. **Nunca emoji ni pictogramas Unicode como ícono** — ver [[feedback-no-emojis]].
   Todo ícono (cámara, candado, nube, estrella, check) se dibuja como forma pixel
   (bloques cuadrados vía CSS/SVG), no como carácter Unicode.

## Assets externos de referencia (no incluidos en el repo, solo inspiración)

- [free-uinature-pack](https://qiuro.itch.io/free-uinature-pack) — paneles/botones
  con motivo de hojas, gratis para uso comercial con atribución apreciada.
- [Pixel UI pack, 750 elementos](https://opengameart.org/content/pixel-ui-pack-750-assets)
  — barras, cursores, checkmarks en OpenGameArt.
- [Public Pixel Font (CC0)](https://ggbot.itch.io/public-pixel-font) — alternativa sin
  restricciones a Press Start 2P si se prefiere una fuente aún más pequeña/nítida.

## Dónde aplica

- `docs/mockups.pdf` (Iteración 1, ver `PROYECTO.md` §7) ya usa esta paleta y estas
  reglas.
- Cuando se implemente `mobile-flutter` o `portal-web`, este documento es la
  referencia de estilo — no hay que re-decidir colores por pantalla.
- El catálogo público del portal (`portal/`, fuera del grupo `(panel)`, agregado
  2026-08-28 — ver `PROYECTO.md` §2.1/§9) usa esta misma paleta, tipografía y
  reglas de pixel art; no es una superficie de estilo distinta del panel interno
  ni necesita su propia decisión visual.
- `docs/mockups.html` deja de publicarse en GitHub Pages (decisión 2026-08-28,
  `PROYECTO.md` §5/§9: Vercel es el único sitio público de Ticodex) y queda en el
  repo solo como referencia interna de este lenguaje visual, igual que
  `docs/mockups.pdf`.
