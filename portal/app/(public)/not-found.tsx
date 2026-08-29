import Link from "next/link"

/** Boundary de "no encontrado" para la superficie pública (ej. una ficha
 * `/especie/[id]` que no existe o no está publicada). Texto fijo bilingüe
 * en una sola línea — no depende del toggle porque puede renderizarse fuera
 * del provider. */
export default function PublicNotFound() {
  return (
    <div className="tarjeta cream stack">
      <h1 className="pixel" style={{ fontSize: 14 }}>
        404
      </h1>
      <p className="aviso-texto">
        Esta especie no está publicada o no existe. / This species is not
        published or does not exist.
      </p>
      <Link href="/" className="btn btn-outline pixel" style={{ alignSelf: "flex-start" }}>
        &lt; CATÁLOGO / CATALOG
      </Link>
    </div>
  )
}
