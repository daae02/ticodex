"use client"

import { useCallback, useSyncExternalStore } from "react"
import { IDIOMAS, type Idioma } from "@/lib/publico/i18n"

/**
 * Estado global del toggle ES/EN de la superficie pública. Un solo toggle
 * afecta grid y ficha por igual (misma decisión que la app Flutter), así que
 * en vez de un Context es un store mínimo respaldado por localStorage y leído
 * con `useSyncExternalStore` — SSR siempre entrega "es" y el cliente cambia a
 * la preferencia guardada al hidratar, sin mismatch ni setState en effect.
 */
const STORAGE_KEY = "ticodex.publico.idioma"

function esIdioma(v: string | null): v is Idioma {
  return v != null && (IDIOMAS as readonly string[]).includes(v)
}

const listeners = new Set<() => void>()

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

function getSnapshot(): Idioma {
  const guardado = window.localStorage.getItem(STORAGE_KEY)
  return esIdioma(guardado) ? guardado : "es"
}

function getServerSnapshot(): Idioma {
  return "es"
}

function guardarIdioma(idioma: Idioma): void {
  window.localStorage.setItem(STORAGE_KEY, idioma)
  document.documentElement.lang = idioma
  for (const listener of listeners) listener()
}

export function useIdioma(): { idioma: Idioma; setIdioma: (i: Idioma) => void } {
  const idioma = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const setIdioma = useCallback((nuevo: Idioma) => guardarIdioma(nuevo), [])
  return { idioma, setIdioma }
}
