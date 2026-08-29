# Plan de Implementación Multiagente — Ticodex

> Complementa a [`PROYECTO.md`](./PROYECTO.md). Define cómo se construye Ticodex
> usando subagentes de Claude Code, y en qué orden. La Fase 1 es el MVP real
> (`PROYECTO.md` §2); todo lo demás es roadmap (`PROYECTO.md` §3) y se ataca después
> de validar que la Fase 1 funciona de punta a punta.

## 1. Principio rector: MVP chico primero, no "toda la visión a medias"

En vez de construir un poco de cada feature de la visión completa, la Fase 1 corta
todo lo que no sea imprescindible (cuentas, regiones, offline, captura) y deja un
sistema pequeño pero completo: dato entra por el panel (manual, CSV, o scraper) →
pasa por revisión → la app lo muestra. Cada fase siguiente agrega **una** pieza de la
visión completa sobre esa base, no todas a la vez.

## 2. Roles / subagentes

Cada rol vive como un agente propio en [`.claude/agents/`](./.claude/agents/), que se
invoca arrancando una sesión de Claude Code con `claude --agent <nombre>` desde esta
carpeta (interactivo o con `-p` para una sola vuelta) — ver §5 para el detalle.

| Agente | Archivo | Responsabilidad (Fase 1 / MVP) |
|---|---|---|
| **requirements-gatherer** | `.claude/agents/requirements-gatherer.md` | Punto de entrada de cualquier requerimiento nuevo o cambio de alcance. Aclara ambigüedades, mantiene `PROYECTO.md`/`PLAN_IMPLEMENTACION.md`/`DISENO.md` sincronizados, y despacha a los 4 agentes de abajo con instrucciones concretas. No construye nada él mismo. |
| **backend-supabase** | `.claude/agents/backend-supabase.md` | Esquema Postgres mínimo (`especie`, `especie_foto`, `candidato_especie`, `import_job`), RLS, Storage, import de CSV. |
| **portal-web** | `.claude/agents/portal-web.md` | Portal web (`portal/`, Next.js en Vercel): superficie pública (catálogo real, sin login) + panel de carga interno (login, CSV/plantilla, formulario manual, scraper disparado por búsqueda, cola de revisión de candidatos). |
| **mobile-flutter** | `.claude/agents/mobile-flutter.md` | App de solo lectura: fetch único al abrir, lista/grid, ficha de especie. Sin cuentas. |
| **qa-reviewer** | `.claude/agents/qa-reviewer.md` | Revisión de código, seguridad, contrato de datos, gate de cada fase. |

**Flujo de coordinación:** el usuario le da instrucciones a `requirements-gatherer`
(no a los otros cuatro directamente); ese agente actualiza los documentos y despacha
a `backend-supabase`/`portal-web`/`mobile-flutter`/`qa-reviewer` según corresponda.
La sesión principal de Claude Code sigue disponible para despachar directo cuando
tiene sentido saltarse ese paso (por ejemplo, para pedir algo puntual sin cambio de
requerimiento de por medio), pero el camino estándar para "esto cambió" pasa por
`requirements-gatherer`.

## 3. Contratos entre agentes

- **Esquema CSV** (`data/template_especies.csv`): usado tanto por el upload manual
  como por lo que produce internamente el scraper del panel.
- **Esquema Supabase + tipos generados**: contrato entre `backend-supabase` y
  (`portal-web`, `mobile-flutter`). `backend-supabase` es dueño de las migraciones.
- **Definition of Done por fase**: contrato entre cualquier agente y `qa-reviewer`.

## 4. Fases

### Fase 1 — MVP (`PROYECTO.md` §2, el alcance real de esta iteración)
- `backend-supabase`: esquema mínimo — `especie`, `especie_foto`,
  `candidato_especie`, `import_job`. RLS: lectura pública de `especie` con
  `estado_publicacion = 'publicado'` (la app no tiene login); escritura de todo el
  esquema solo desde el rol interno del panel.
- `portal-web`: login, dashboard, plantilla CSV, upload CSV con preview de
  validación, formulario manual, scraper disparado por búsqueda (el usuario busca
  un animal, confirma cuál es entre los candidatos que devuelve iNaturalist/GBIF, y
  recién ahí se jalan los datos — las fuentes/campos que se consultan siguen fijos
  en config, no elegibles por UI), y la cola de revisión donde se aprueban/descartan
  candidatos `nuevo`/`actualizacion` de a uno. **Agregado 2026-08-28** (`PROYECTO.md`
  §2.1, §9): además del panel, `portal-web` sirve una superficie pública sin login
  (catálogo real: grid + ficha, bilingüe, leyendo `especie` con
  `estado_publicacion = 'publicado'`) en las rutas fuera del grupo `(panel)`; el
  proxy (`portal/proxy.ts`) pasa a proteger solo el grupo `(panel)` y sus rutas bajo
  `/api/*`, no el resto del sitio. Cualquier login exitoso sigue siendo equipo
  interno (sin tabla de roles).
- `backend-supabase`: sin cambio de esquema para este agregado — la política RLS
  de lectura pública de `especie publicado`/`especie_foto` de Fase 1 (ver arriba)
  ya cubre lo que necesita la superficie pública nueva del portal.
- `mobile-flutter`: app sin login que hace un fetch único al abrir contra `especie`
  publicada, muestra lista/grid y ficha de detalle bilingüe con fotos por tipo y sonido.
- **Gate (`qa-reviewer`):** una especie cargada por CSV, otra por formulario manual, y
  una traída por el scraper y aprobada en la cola, las tres aparecen correctamente en
  la app. Nada de lo que trae el scraper llega a la app sin pasar por la cola de
  revisión — verificar explícitamente que no hay un camino que se salte ese paso.

### Fase 2 — Cuentas, captura y factor social (roadmap, `PROYECTO.md` §3.1)
- `backend-supabase`: agrega `usuario` (extiende `auth.users`) y `avistamiento`
  (`visible_comunidad` y `foto_compartida` desacoplados), RLS de escritura propia /
  lectura pública del evento.
- `mobile-flutter`: login, captura (cámara + GPS), marcar vista/fotografiada, perfil
  con feed comunitario, álbum personal con favoritos.
- **Gate:** un usuario fotografía una especie, queda marcada como vista, el
  avistamiento es visible para otros usuarios, y puede marcar su foto como privada
  sin ocultar el avistamiento del feed.

### Fase 3 — Regionalización por zona de vida de Holdridge (roadmap, §3.2)
- `backend-supabase`: agrega `region` y `especie_region` (con
  `frecuencia_estimada_inicial` y `frecuencia_observada`, esta última calculada de
  `avistamiento`).
- `portal-web`: gestión de zonas de vida (crear, `orden_lanzamiento`, activar/desactivar).
- `mobile-flutter`: selector/mapa de zonas de vida, pokedex organizado por región en
  vez de lista plana, progreso por región en el perfil.
- **Gate:** una zona de vida piloto se puede activar/desactivar desde el panel y
  aparece/desaparece del selector de la app en consecuencia.

### Fase 4 — Offline-first (roadmap, §3.3)
- `mobile-flutter`: descarga de datos+fotos por región para consulta sin señal, cola
  local de avistamientos capturados offline, sincronización al reconectar.
- **Gate:** en modo avión se puede navegar una región ya descargada y capturar un
  avistamiento que se sincroniza al reconectar.

### Fase 5 — Scraper configurable por corrida (roadmap, §3.4)
- `portal-web`: reemplaza el botón de config fija por un configurador real (elegir
  fuentes + tipos de campo + zona de vida objetivo por corrida).
- **Gate:** dos corridas con distinta combinación de fuentes/campos producen
  candidatos con `campos_extraidos` distintos y consistentes con lo pedido.

### Fase 6 — Pulido y lanzamiento
- `qa-reviewer`: pase de seguridad (RLS, exposición de Storage, Auth del panel),
  performance offline, revisión de textos bilingües, revisión de licencias de las
  fuentes del scraper.

## 5. Cómo despachar un agente

**Importante — corregido tras probarlo:** los agentes de `.claude/agents/` en este
proyecto **no** son `subagent_type` de la herramienta `Agent` de Claude Code (esa
herramienta solo conoce los tipos genéricos incorporados: `claude`,
`general-purpose`, `Explore`, `Plan`, etc.). Un agente propio de este proyecto solo
se puede invocar arrancando una sesión completa de Claude Code con `--agent`, de dos
formas:

**Interactivo** (una pestaña o panel de terminal, para conversar con el agente en
vivo — así están los 5 paneles del split screen):

```
cd C:\Users\Daae2\Ticodex
claude --agent backend-supabase
```

**No interactivo / scripteable** (`-p`, corre una sola vuelta y devuelve el
resultado — así se "despacha" un agente desde otra sesión, por ejemplo desde
`requirements-gatherer` usando su tool `Bash`):

```bash
cd /c/Users/Daae2/Ticodex
claude --agent backend-supabase -p "Lee PROYECTO.md sección 7 (Modelo de datos,
Iteración 1) y crea las migraciones iniciales para especie, especie_foto,
candidato_especie e import_job, con RLS según PROYECTO.md sección 8. El proyecto
Supabase ya existe: ref weagfzykzqiixjyqejbc (ver PROYECTO.md sección 5). No crees
tablas de usuario, avistamiento o región — son de fases posteriores. Repórtame las
decisiones de tipos/enums que tomaste."
```

Esto sí se probó y funciona (ver conversación — el esquema de Fase 1 ya está
aplicado en `weagfzykzqiixjyqejbc` usándolo).

El orquestador (vos + Claude en esta sesión, o `requirements-gatherer` cuando el
camino pasa por ahí) sigue siendo quien decide **cuándo** despachar cada agente vía
uno de estos dos caminos, y quién resuelve conflictos entre sus entregas.

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El scraper viola términos de uso de una fuente | `portal-web` confirma licencia/ToS de cada fuente antes de configurarla, aunque la config sea fija en esta fase; los candidatos siempre pasan por revisión humana antes de publicarse. |
| Un candidato de tipo `actualizacion` se aprueba sin que nadie note que sobrescribe un campo bueno | La cola de revisión debe mostrar diff (valor actual vs. propuesto), no solo el valor nuevo — `qa-reviewer` lo verifica explícitamente en el gate de Fase 1. |
| Construir de más porque "ya que estamos" se agrega una pieza del roadmap antes de tiempo | Cada fase tiene un Gate explícito; no se despacha la fase siguiente sin cerrar el Gate de la actual. |
| Esquema CSV diverge entre el scraper y el upload manual | El esquema vive en un solo archivo (`data/template_especies.csv`) versionado, usado por ambos flujos dentro del mismo `portal-web`. |
