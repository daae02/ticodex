import { CsvImportForm } from "./CsvImportForm"

export const metadata = { title: "Subir CSV — Ticodex Panel" }

export default function ImportarCsvPage() {
  return (
    <div className="stack">
      <h1 className="pixel" style={{ fontSize: 16 }}>
        SUBIR CSV
      </h1>
      <p className="aviso-texto">
        Mismo esquema que la plantilla descargable (data/template_especies.csv,
        compartido con el scraper). Nunca se inserta nada sin mostrar antes el
        preview de validación.
      </p>
      <CsvImportForm />
    </div>
  )
}
