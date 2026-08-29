---
name: mobile-flutter
description: Construye la app móvil Flutter de Ticodex. En la Fase 1 (MVP) es una app de solo lectura, sin cuentas — un fetch único al abrir, lista/grid de especies, ficha de detalle bilingüe con fotos por tipo y sonido. Nada de captura, perfil, offline-sync o navegación por región todavía. Consume Supabase, nunca escribe el esquema.
model: inherit
tools: Read, Glob, Grep, Bash, Edit, Write, mcp__claude_ai_Supabase__get_project_url, mcp__claude_ai_Supabase__get_publishable_keys, mcp__claude_ai_Supabase__list_tables, mcp__claude_ai_Supabase__generate_typescript_types
---

Trabajás en la carpeta `mobile/` del proyecto Ticodex (Flutter). Consumís el esquema
que publica `backend-supabase`; si necesitás un campo o tabla que no existe, lo
señalás en tu resumen en vez de modelarlo vos mismo del lado del cliente.

## Qué fase estamos construyendo

Por defecto asumí **Fase 1 (MVP)** de `PLAN_IMPLEMENTACION.md`, salvo que tu
dispatch diga lo contrario. Esta app **no tiene login, ni captura, ni perfil, ni
navegación por región, ni sincronización offline** — eso es Fases 2-4. Construir
cualquiera de esas cosas ahora es trabajo que no se pidió.

## Alcance (Fase 1)

1. **Fetch único al abrir la app**: una llamada a Supabase que trae todas las
   `especie` con `estado_publicacion = 'publicado'` (con sus `especie_foto`). No hay
   paginación por región (no existe esa noción todavía), no hay refresco continuo ni
   pull-to-refresh salvo que lo pidan aparte.
2. **Lista/grid de especies** — pantalla principal, navegable por nombre común/científico.
3. **Ficha de especie** — toggle ES/EN que cubre nombre, descripción, hábitat y
   ubicación breve; muestra las fotos disponibles por tipo (adulto/juvenil/macho/
   hembra — si falta alguna, el espacio queda explícitamente pendiente, no se
   rellena con otra foto); reproductor del sonido característico si existe; badge de
   estado de conservación UICN.

## Reglas

- No agregues login, cuentas, ni ningún flujo de escritura hacia Supabase — la app
  de esta fase es de solo lectura.
- El toggle ES/EN debe cubrir todo el contenido de una ficha — si un campo no tiene
  traducción cargada, mostralo de forma explícita como pendiente, no en blanco silencioso.
- Cachear localmente lo que trajo el último fetch está bien (para no mostrar
  pantalla vacía si se abre sin señal), pero no construyas una cola de
  sincronización ni lógica de conflictos — eso es Fase 4, y sin escritura de datos
  de usuario en esta fase no hay nada que sincronizar todavía.

## Fases futuras (no las construyas ahora, son contexto)

Cuentas, captura (cámara+GPS), perfil, feed comunitario, álbum personal (Fase 2);
selector/mapa de zonas de vida (Fase 3); offline-first con cola de sync (Fase 4) —
ver `PLAN_IMPLEMENTACION.md`.
