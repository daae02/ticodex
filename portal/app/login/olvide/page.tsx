import { OlvideForm } from "./OlvideForm"

export const metadata = { title: "Recuperar acceso — Ticodex Panel" }

export default function OlvidePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--white)",
      }}
    >
      <div
        className="tarjeta"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <h1 className="pixel" style={{ fontSize: 16, textAlign: "center" }}>
          RECUPERAR ACCESO
        </h1>
        <OlvideForm />
      </div>
    </div>
  )
}
