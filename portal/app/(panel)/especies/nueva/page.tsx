import { EspecieForm } from "../EspecieForm"

export const metadata = { title: "Nueva especie — Ticodex Panel" }

export default function NuevaEspeciePage() {
  return (
    <div className="stack">
      <h1 className="pixel" style={{ fontSize: 16 }}>
        NUEVA ESPECIE
      </h1>
      <EspecieForm />
    </div>
  )
}
