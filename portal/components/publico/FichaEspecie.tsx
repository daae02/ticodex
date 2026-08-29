"use client"

import Link from "next/link"
import type { Tables } from "@/lib/database.types"
import {
  CLASE_LABELS,
  IUCN_LABELS,
  TEXTOS,
  TIPO_FOTO_LABELS,
} from "@/lib/publico/i18n"
import {
  fotoDeTipo,
  fotoPrincipal,
  otrasFotos,
  slotsFoto,
  textoBilingue,
  type FotoPublica,
} from "@/lib/publico/especie"
import { PixelIcon } from "@/components/PixelIcon"
import { useIdioma } from "./idioma"
import { ConservationBadge } from "./ConservationBadge"

type EspecieConFotos = Tables<"especie"> & {
  especie_foto: Tables<"especie_foto">[]
}

export function FichaEspecie({ especie }: { especie: EspecieConFotos }) {
  const { idioma } = useIdioma()
  const t = TEXTOS[idioma]

  const fotos: FotoPublica[] = especie.especie_foto ?? []
  const nombre = textoBilingue(
    especie.nombre_comun_es,
    especie.nombre_comun_en,
    idioma
  )
  const principal = fotoPrincipal(fotos)
  const slots = slotsFoto(especie)
  const sueltas = otrasFotos(fotos)

  return (
    <div className="stack">
      <div>
        <Link href="/" className="pixel" style={{ fontSize: 9 }}>
          {t.volverAlCatalogo}
        </Link>
      </div>

      <div
        className="box lavender"
        style={{
          height: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {principal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={principal.url}
            alt={nombre ?? especie.nombre_cientifico}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <PixelIcon name="photo" size={40} />
        )}
      </div>

      <div className="columna" style={{ gap: 8 }}>
        <h1
          className="pixel"
          style={{ fontSize: 15, fontStyle: nombre ? "normal" : "italic" }}
        >
          {nombre ?? t.traduccionPendiente}
        </h1>
        <p style={{ margin: 0, fontStyle: "italic" }}>
          {especie.nombre_cientifico}
        </p>

        <div className="fila" style={{ gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          <ConservationBadge
            estado={especie.estado_conservacion}
            idioma={idioma}
          />
          <span className="chip">
            {CLASE_LABELS[idioma][especie.clase_taxonomica]}
          </span>
          {especie.familia?.trim() && (
            <span className="chip">{especie.familia}</span>
          )}
          {especie.endemica && <span className="chip">{t.endemica}</span>}
        </div>

        <p className="aviso-texto" style={{ marginTop: 2 }}>
          {t.estadoConservacion}:{" "}
          {especie.estado_conservacion
            ? IUCN_LABELS[idioma][especie.estado_conservacion]
            : t.sinDatoConservacion}
        </p>
      </div>

      {especie.sonido_url?.trim() && (
        <div className="columna" style={{ maxWidth: 360 }}>
          <label className="campo-label">{t.sonidoTitulo}</label>
          <audio controls src={especie.sonido_url} style={{ width: "100%" }} />
        </div>
      )}

      <Seccion titulo={t.descripcionTitulo}>
        {textoBilingue(especie.descripcion_es, especie.descripcion_en, idioma)}
      </Seccion>
      <Seccion titulo={t.habitatTitulo}>
        {textoBilingue(especie.habitat_es, especie.habitat_en, idioma)}
      </Seccion>
      <Seccion titulo={t.ubicacionTitulo}>
        {textoBilingue(
          especie.ubicacion_breve_es,
          especie.ubicacion_breve_en,
          idioma
        )}
      </Seccion>

      {especie.atribucion_fuente?.trim() && (
        <p
          className="aviso-texto"
          style={{ fontStyle: "italic", opacity: 0.75 }}
        >
          {especie.atribucion_fuente}
        </p>
      )}

      <div className="stack" style={{ gap: 10 }}>
        <span className="pixel" style={{ fontSize: 11 }}>
          {t.fotosTitulo}
        </span>
        <div className="ficha-fotos-grid">
          {slots.map((tipo) => {
            const foto = fotoDeTipo(fotos, tipo)
            return (
              <div key={tipo} className="columna" style={{ gap: 4 }}>
                <label className="campo-label">
                  {TIPO_FOTO_LABELS[idioma][tipo]}
                </label>
                <div className="ficha-foto-slot box">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto.url}
                      alt={TIPO_FOTO_LABELS[idioma][tipo]}
                    />
                  ) : (
                    <span className="columna" style={{ alignItems: "center", gap: 6 }}>
                      <PixelIcon name="photo" size={24} />
                      <span className="aviso-texto">{t.fotoPendiente}</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {sueltas.length > 0 && (
        <div className="stack" style={{ gap: 10 }}>
          <span className="pixel" style={{ fontSize: 11 }}>
            {t.otrasFotosTitulo}
          </span>
          <div className="fila" style={{ gap: 10, flexWrap: "wrap" }}>
            {sueltas.map((foto) => (
              <div
                key={foto.url}
                className="ficha-foto-slot box"
                style={{ width: 120, aspectRatio: "auto", height: 120 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto.url} alt={TIPO_FOTO_LABELS[idioma].otro} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string
  children: string | null
}) {
  const { idioma } = useIdioma()
  return (
    <div className="columna" style={{ gap: 6 }}>
      <span className="pixel" style={{ fontSize: 10 }}>
        {titulo}
      </span>
      <p
        style={{
          margin: 0,
          lineHeight: 1.5,
          fontStyle: children ? "normal" : "italic",
          color: children ? "var(--ink)" : "var(--muted)",
        }}
      >
        {children ?? TEXTOS[idioma].traduccionPendiente}
      </p>
    </div>
  )
}
