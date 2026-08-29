"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Tables } from "@/lib/database.types"
import { PixelIcon } from "@/components/PixelIcon"

const TIPOS_FOTO: { valor: "adulto" | "juvenil" | "macho" | "hembra"; etiqueta: string }[] = [
  { valor: "adulto", etiqueta: "ADULTO" },
  { valor: "juvenil", etiqueta: "JUVENIL" },
  { valor: "macho", etiqueta: "MACHO" },
  { valor: "hembra", etiqueta: "HEMBRA" },
]

/** "adulto" siempre se exige. "juvenil" solo si `tiene_diferencia_juvenil`
 * está tildado, "macho"/"hembra" solo si `tiene_dimorfismo_sexual` lo está —
 * refleja en vivo lo que exige el trigger de publicación
 * `validar_especie_completa_para_publicar`. El sonido (sonido_url) queda
 * fuera de esta regla a propósito: el esquema no modela audio por tipo
 * todavía (PROYECTO.md §10), así que siempre se muestra igual. */
function tipoVisible(
  valor: "adulto" | "juvenil" | "macho" | "hembra",
  tieneDimorfismoSexual: boolean,
  tieneDiferenciaJuvenil: boolean
): boolean {
  if (valor === "juvenil") return tieneDiferenciaJuvenil
  if (valor === "macho" || valor === "hembra") return tieneDimorfismoSexual
  return true
}

async function subir(
  especieId: string,
  kind: "foto" | "sonido",
  file: File,
  tipo?: string
) {
  const formData = new FormData()
  formData.set("especieId", especieId)
  formData.set("kind", kind)
  if (tipo) formData.set("tipo", tipo)
  formData.set("file", file)

  const res = await fetch("/api/upload", { method: "POST", body: formData })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? "Error subiendo el archivo.")
  return json.url as string
}

export function FotosYSonido({
  especieId,
  fotos,
  sonidoUrl,
  tieneDimorfismoSexual,
  tieneDiferenciaJuvenil,
}: {
  especieId: string
  fotos: Tables<"especie_foto">[]
  sonidoUrl: string | null
  tieneDimorfismoSexual: boolean
  tieneDiferenciaJuvenil: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pendiente, iniciarTransicion] = useTransition()

  function fotoDeTipo(tipo: string) {
    return fotos.find((f) => f.tipo === tipo)?.url ?? null
  }

  function manejarSubidaFoto(tipo: string, file: File) {
    setError(null)
    iniciarTransicion(async () => {
      try {
        await subir(especieId, "foto", file, tipo)
        router.refresh()
      } catch (e) {
        setError((e as Error).message)
      }
    })
  }

  function manejarSubidaSonido(file: File) {
    setError(null)
    iniciarTransicion(async () => {
      try {
        await subir(especieId, "sonido", file)
        router.refresh()
      } catch (e) {
        setError((e as Error).message)
      }
    })
  }

  return (
    <div className="tarjeta lavender stack">
      <span className="pixel" style={{ fontSize: 12 }}>
        FOTOS Y SONIDO
      </span>
      {error && <p className="err">{error}</p>}
      <div className="fila" style={{ gap: 12, flexWrap: "wrap" }}>
        {TIPOS_FOTO.filter((tipo) =>
          tipoVisible(tipo.valor, tieneDimorfismoSexual, tieneDiferenciaJuvenil)
        ).map((tipo) => (
          <FotoTipoCampo
            key={tipo.valor}
            etiqueta={tipo.etiqueta}
            url={fotoDeTipo(tipo.valor)}
            disabled={pendiente}
            onArchivo={(file) => manejarSubidaFoto(tipo.valor, file)}
          />
        ))}
      </div>
      <div className="columna" style={{ maxWidth: 320 }}>
        <label className="campo-label">SONIDO</label>
        {sonidoUrl && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio controls src={sonidoUrl} style={{ width: "100%" }} />
        )}
        <input
          type="file"
          accept="audio/*"
          disabled={pendiente}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) manejarSubidaSonido(file)
          }}
        />
      </div>
    </div>
  )
}

function FotoTipoCampo({
  etiqueta,
  url,
  disabled,
  onArchivo,
}: {
  etiqueta: string
  url: string | null
  disabled: boolean
  onArchivo: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="columna" style={{ width: 140 }}>
      <label className="campo-label">{etiqueta}</label>
      <div
        className="box"
        style={{
          width: 140,
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "default" : "pointer",
          overflow: "hidden",
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={etiqueta}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <PixelIcon name="photo" size={28} />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onArchivo(file)
        }}
      />
    </div>
  )
}
