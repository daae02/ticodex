# Ticodex — Panel de carga (`portal/`)

Programa 2 de Ticodex (`PROYECTO.md` §2, `PLAN_IMPLEMENTACION.md` Fase 1) y único
sitio web público de Ticodex (Vercel, decisión 2026-08-28). Dos superficies en
una sola app Next.js:

- **Pública** (sin login): el catálogo real de especies publicadas — grid + ficha
  bilingüe, la misma experiencia de contenido que la app móvil, en la web.
- **Panel interno** (login contra Supabase Auth): cargar y curar el catálogo que
  consume la app móvil. No hay registro público; cualquier login exitoso es
  equipo interno (sin tabla de roles).

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions) + React 19 + TypeScript.
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) para Auth, Postgres y
  Storage — sin backend propio, el panel habla directo con Supabase desde Server
  Components / Server Actions / Route Handlers, respetando las políticas RLS que
  publica el agente `backend-supabase`.
- **Papaparse** para el parseo de CSV.

Por qué Next.js: es un panel CRUD orientado a formularios y listados sobre una
sola base de datos, sin necesidad de una API propia — Server Actions +
`@supabase/ssr` cubren login, mutaciones y RLS-aware queries sin capa
intermedia. El resto del monorepo (`mobile-flutter`) ya usa un stack aparte, así
que no hay presión de compartir código entre `portal/` y la app.

## Requisitos

- Node.js 20+.
- El proyecto Supabase de Ticodex ya existe y tiene el esquema de Fase 1
  aplicado (ver `PROYECTO.md` §5 y `supabase/database.types.ts`, publicados por
  `backend-supabase` — no se regeneran a mano acá).

## Configuración

Variables de entorno en `portal/.env.local` (ya presente en este checkout,
apuntando al proyecto `weagfzykzqiixjyqejbc`):

```
SUPABASE_URL=https://weagfzykzqiixjyqejbc.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_STORAGE_BUCKET=especie-media
```

`SUPABASE_PUBLISHABLE_KEY` es la publishable/anon key (no la service role) — el
panel opera siempre con la sesión del usuario logueado, sujeta a RLS.

## Correrlo

```bash
cd portal
npm install   # solo la primera vez / si cambió package.json
npm run dev
```

Abrí `http://localhost:3000` — muestra el catálogo público. El panel interno
está en `/especies` (redirige a `/login` si no hay sesión).

Para producción: `npm run build && npm run start`.

## Cuentas de acceso

No hay registro desde el panel (`PROYECTO.md` §4: equipo interno únicamente,
sin flujo de aprobación). Las cuentas se crean a mano desde **Supabase Dashboard
→ Authentication → Users** en el proyecto `weagfzykzqiixjyqejbc`. Cualquier
cuenta con sesión válida opera el panel entero.

## Mapa de pantallas

El portal tiene dos superficies (`PROYECTO.md` §2.1, decisión 2026-08-28): una
**pública** sin login (catálogo real) y el **panel** interno (grupo de rutas
`(panel)` + `/api/*`, protegido por `proxy.ts`).

### Pública (sin sesión — catálogo real, bilingüe ES/EN)

| Ruta | Qué hace |
|---|---|
| `/` | Grid del catálogo: especies con `estado_publicacion = 'publicado'`, foto principal, nombre común ES/EN, nombre científico y badge de conservación. Sin borradores ni candidatos. |
| `/especie/[id]` | Ficha de detalle de una especie publicada (singular, para no chocar con `/especies` del panel): toggle real ES/EN, fotos por tipo (adulto/juvenil/macho/hembra), sonido, descripción, hábitat, ubicación breve, badge UICN. Solo lectura. Una especie no publicada o inexistente devuelve 404. |

El toggle ES/EN es un store global (`components/publico/idioma.ts`,
`useSyncExternalStore` + `localStorage`) — afecta grid y ficha por igual, igual
que en la app Flutter. Textos y etiquetas en `lib/publico/i18n.ts` (réplica
deliberada de `mobile/lib/l10n/strings.dart`). El pie de página tiene el único
acceso visible al panel: un link discreto a `/login`.

### Panel interno (requiere sesión de Supabase Auth)

| Ruta | Qué hace |
|---|---|
| `/login` | Login contra Supabase Auth. Un usuario ya logueado que lo visita es redirigido a `/especies`. |
| `/especies` | Dashboard, filtro por estado, accesos a plantilla/CSV/formulario. |
| `/especies/nueva`, `/especies/[id]/editar` | Formulario manual bilingüe + fotos por tipo + sonido. |
| `/especies/importar` | Subir CSV con preview de validación fila por fila antes de confirmar. |
| `/fuentes` | Botón "Actualizar desde fuentes" (scraper, configuración fija). |
| `/revision` | Cola de revisión de `candidato_especie` (`nuevo` / `actualizacion`, con diff). |
| `/importaciones` | Historial de `import_job`. |

## El scraper (`lib/scraper/`)

Configuración fija en `lib/scraper/config.ts` (10 especies piloto × 4 fuentes de
referencia del mockup: SINAC, iNaturalist, GBIF, Wikipedia especies) — no hay
configurador por corrida, es Fase 5.

**Estado actual: las 4 fuentes están deshabilitadas (`licenciaConfirmada:
false`)** porque ninguna tiene confirmada su licencia/ToS de redistribución
para este proyecto (regla explícita: no asumir permiso, señalarlo). El motivo
puntual de cada una está en `lib/scraper/fuentes/*.ts` y se ve también en
`/fuentes`. El botón "ACTUALIZAR AHORA" funciona (dispara el orquestador en
segundo plano vía `after()`), pero con 0 fuentes habilitadas no genera
candidatos — es el comportamiento esperado hasta que alguien confirme una
licencia y active el flag correspondiente.

## Gaps conocidos (no resueltos en este dispatch, quedan para otro agente)

- **Bucket de Storage `especie-media` no existe todavía** en el proyecto
  Supabase — lo confirmé con una llamada directa a la Storage API (404 Bucket
  not found). La subida de fotos/sonido desde el formulario manual va a
  fallar con un mensaje explícito hasta que `backend-supabase` lo cree.
- Licencias de SINAC / iNaturalist / GBIF / Wikipedia no confirmadas (ver
  sección anterior) — bloquea que el scraper traiga datos reales.
- No hay una tabla de historial de corridas del scraper (algo como
  `scrape_job`, análogo a `import_job`); `/fuentes` aproxima "última
  actividad" con el `creado_en` más reciente de `candidato_especie`. Si se
  necesita trazabilidad más precisa, es una migración para `backend-supabase`.
